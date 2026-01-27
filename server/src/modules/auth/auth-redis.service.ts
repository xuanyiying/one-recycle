import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';
import { SnowflakeIdGenerator } from '../../common/utils/common.util';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { ThirdPartyLoginDto } from './dto/third-party-login.dto';
import { WeChatPlatform } from './platforms/wechat.platform';
import { AlipayPlatform } from './platforms/alipay.platform';
import { TikTokPlatform } from './platforms/tiktok.platform';
import { KuaishouPlatform } from './platforms/kuaishou.platform';
import { AccountClient } from './clients/account.client';
import { UpdateUserDto } from '@/modules/user/dto';
import { NotificationService } from '../notification/services/notification.service';
import {
  NotificationType,
  NotificationPriority,
} from '../notification/entities/notification.entity';

export interface AuthResult {
  user: {
    id: string;
    phone: string;
    nickname?: string;
    avatar?: string;
    role: string;
    status: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  sessionId: string;
}

interface VerificationCodeData {
  code: string;
  phone: string;
  type: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  maxAttempts: number;
}

interface SessionData {
  userId: string;
  deviceFingerprint?: string;
  createdAt: number;
}

interface RefreshTokenData {
  userId: string;
  expiresAt: number;
}

/**
 * 认证服务（使用Redis存储）
 * 生产环境就绪版本
 */
@Injectable()
export class AuthRedisService {
  private readonly logger = new Logger(AuthRedisService.name);
  private readonly CODE_EXPIRY_MINUTES: number;
  private readonly CODE_RESEND_INTERVAL_SECONDS: number;
  private readonly MAX_CODE_ATTEMPTS: number;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS: number;
  private readonly accessTokenExpiresInSeconds: number;
  private readonly sessionExpiresInSeconds: number;
  private readonly idGenerator: SnowflakeIdGenerator;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly wechatPlatform: WeChatPlatform,
    private readonly alipayPlatform: AlipayPlatform,
    private readonly tiktokPlatform: TikTokPlatform,
    private readonly kuaishouPlatform: KuaishouPlatform,
    private readonly accountClient: AccountClient,
    private readonly notificationService: NotificationService,
  ) {
    this.CODE_EXPIRY_MINUTES = this.configService.get<number>(
      'auth.codeExpiresMinutes',
      5,
    );
    this.CODE_RESEND_INTERVAL_SECONDS = this.configService.get<number>(
      'auth.codeResendIntervalSeconds',
      60,
    );
    this.MAX_CODE_ATTEMPTS = this.configService.get<number>(
      'auth.maxCodeAttempts',
      3,
    );
    this.REFRESH_TOKEN_EXPIRY_DAYS = this.configService.get<number>(
      'auth.refreshTokenExpiresDays',
      30,
    );
    this.accessTokenExpiresInSeconds = this.configService.get<number>(
      'auth.accessTokenExpiresInSeconds',
      7200,
    );
    this.sessionExpiresInSeconds = this.configService.get<number>(
      'auth.sessionExpiresInSeconds',
      86400,
    );

    // TODO: move workerId to config
    this.idGenerator = new SnowflakeIdGenerator({
      workerId: 11,
      datacenterId: 1,
    });
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { mobile, verificationCode, deviceFingerprint } = loginDto;

    // 验证手机号格式
    if (!this.isValidPhoneNumber(mobile)) {
      throw new BadRequestException('手机号格式不正确');
    }

    // 验证验证码
    const isCodeValid = await this.verifyCode(mobile, verificationCode);
    if (!isCodeValid) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    // 查找或创建用户
    let user = await this.accountClient.findUserByMobile(mobile);
    if (!user) {
      user = await this.accountClient.createUser({
        mobile,
        nickname: `用户${mobile.slice(-4)}`,
      });
    }

    // 生成会话ID
    const sessionId = this.generateSessionId();

    // 存储会话信息到Redis
    await this.saveSession(sessionId, {
      userId: user.id,
      deviceFingerprint,
      createdAt: Date.now(),
    });

    // 生成令牌
    const tokens = await this.generateTokens(user, sessionId);

    // 清除已使用的验证码
    await this.deleteVerificationCode(mobile);

    return {
      user: {
        id: user.id,
        phone: user.mobile || '',
        nickname: user.nickname,
        avatar: user.avatarUrl,
        role: 'USER',
        status: user.status,
      },
      tokens,
      sessionId,
    };
  }

  async sendVerificationCode(
    sendCodeDto: SendCodeDto,
  ): Promise<{ success: boolean; message: string }> {
    const { mobile, type = 'login' } = sendCodeDto;

    // 验证手机号格式
    if (!this.isValidPhoneNumber(mobile)) {
      throw new BadRequestException('手机号格式不正确');
    }

    // 检查是否频繁发送
    const existingCode = await this.getVerificationCode(mobile);
    if (existingCode) {
      const timeSinceLastSent = (Date.now() - existingCode.lastSentAt) / 1000;
      if (timeSinceLastSent < this.CODE_RESEND_INTERVAL_SECONDS) {
        const remainingTime = Math.ceil(
          this.CODE_RESEND_INTERVAL_SECONDS - timeSinceLastSent,
        );
        throw new BadRequestException(`请在${remainingTime}秒后再试`);
      }
    }

    // 生成验证码
    const code = this.generateVerificationCode();
    const expiresAt = Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000;

    // 存储验证码到Redis
    await this.saveVerificationCode(mobile, {
      code,
      phone: mobile,
      type,
      expiresAt,
      lastSentAt: Date.now(),
      attempts: 0,
      maxAttempts: this.MAX_CODE_ATTEMPTS,
    });

    // 发送短信
    await this.sendSMS(mobile, code, type);

    return {
      success: true,
      message: '验证码发送成功',
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const { refreshToken } = refreshTokenDto;

    const tokenData = await this.getRefreshToken(refreshToken);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    const user = await this.accountClient.findUserById(tokenData.userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 生成新的访问令牌
    const payload = { sub: user.id, phone: user.mobile, role: 'USER' };
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.accessTokenExpiresInSeconds;

    return {
      accessToken,
      expiresIn,
    };
  }

  async logout(
    userId: string,
    logoutDto: LogoutDto,
  ): Promise<{ success: boolean; message: string }> {
    const { refreshToken } = logoutDto;

    // 删除刷新令牌
    if (refreshToken) {
      await this.deleteRefreshToken(refreshToken);
    }

    // 删除用户的所有会话
    await this.deleteUserSessions(userId);

    return {
      success: true,
      message: '登出成功',
    };
  }

  async thirdPartyLogin(
    platform: string,
    thirdPartyLoginDto: ThirdPartyLoginDto,
  ): Promise<AuthResult> {
    const { code, nickname, avatarUrl, deviceFingerprint } = thirdPartyLoginDto;

    // 根据平台获取用户信息
    let platformUserInfo: { openid: string; unionid?: string };
    let appId: string;

    switch (platform.toLowerCase()) {
      case 'weapp':
      case 'wechat': {
        const wechatInfo = await this.wechatPlatform.code2Session(code);
        platformUserInfo = {
          openid: wechatInfo.openid,
          unionid: wechatInfo.unionid,
        };
        appId = this.configService.get<string>('WECHAT_APP_ID') || '';
        break;
      }

      case 'alipay': {
        const alipayInfo = await this.alipayPlatform.getAccessToken(code);
        platformUserInfo = { openid: alipayInfo.openid || alipayInfo.user_id };
        appId = this.configService.get<string>('ALIPAY_APP_ID') || '';
        break;
      }

      case 'tt':
      case 'tiktok':
      case 'douyin': {
        const tiktokInfo = await this.tiktokPlatform.code2Session(code);
        platformUserInfo = { openid: tiktokInfo.openid };
        appId = this.configService.get<string>('DOUYIN_APP_ID') || '';
        break;
      }

      case 'kwai':
      case 'kuaishou': {
        const kuaishouInfo = await this.kuaishouPlatform.code2Session(code);
        platformUserInfo = { openid: kuaishouInfo.openid };
        appId = this.configService.get<string>('KUAISHOU_APP_ID') || '';
        break;
      }

      default:
        throw new BadRequestException(`不支持的平台: ${platform}`);
    }

    // 查找或创建用户
    let user = await this.accountClient.findUserByIdentity(
      platform,
      platformUserInfo.openid,
    );

    if (!user) {
      // 创建新用户
      const defaultNickname =
        nickname || `用户${platformUserInfo.openid.slice(-6)}`;
      user = await this.accountClient.createUser({
        nickname: defaultNickname,
        avatarUrl: avatarUrl,
      });

      // 绑定平台身份
      await this.accountClient.createOrUpdateUserIdentity(user.id, {
        provider: platform,
        openid: platformUserInfo.openid,
        unionid: platformUserInfo.unionid,
        appId: appId,
      });
    } else {
      // 更新用户信息（如果提供了新的昵称或头像）
      if (nickname || avatarUrl) {
        const updateData: UpdateUserDto = {};
        if (nickname) updateData.nickname = nickname;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;
        user = await this.accountClient.updateUser(user.id, updateData);
      }
    }

    // 生成会话ID
    const sessionId = this.generateSessionId();

    // 存储会话信息
    await this.saveSession(sessionId, {
      userId: user.id,
      deviceFingerprint,
      createdAt: Date.now(),
    });

    // 生成令牌
    const tokens = await this.generateTokensWithPlatform(
      user,
      sessionId,
      platform,
    );

    return {
      user: {
        id: user.id,
        phone: user.mobile || '',
        nickname: user.nickname,
        avatar: user.avatarUrl,
        role: 'USER',
        status: user.status,
      },
      tokens,
      sessionId,
    };
  }

  // ==================== Redis操作方法 ====================

  private async saveVerificationCode(
    phone: string,
    data: VerificationCodeData,
  ): Promise<void> {
    const key = `auth:code:${phone}`;
    const ttl = this.CODE_EXPIRY_MINUTES * 60;
    await this.redisService.set(key, data, ttl);
  }

  private async getVerificationCode(
    phone: string,
  ): Promise<VerificationCodeData | null> {
    const key = `auth:code:${phone}`;
    return await this.redisService.get<VerificationCodeData>(key);
  }

  private async deleteVerificationCode(phone: string): Promise<void> {
    const key = `auth:code:${phone}`;
    await this.redisService.del(key);
  }

  private async saveSession(
    sessionId: string,
    data: SessionData,
  ): Promise<void> {
    const key = `auth:session:${sessionId}`;
    const ttl = this.sessionExpiresInSeconds;
    await this.redisService.set(key, data, ttl);



    // 同时维护用户的会话列表
    const userSessionsKey = `auth:user:sessions:${data.userId}`;
    await this.redisService.sadd(userSessionsKey, sessionId);
    await this.redisService.expire(
      userSessionsKey,
      this.REFRESH_TOKEN_EXPIRY_DAYS * 86400,
    );
  }

  private async getSession(sessionId: string): Promise<SessionData | null> {
    const key = `auth:session:${sessionId}`;
    return await this.redisService.get<SessionData>(key);
  }

  private async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      const key = `auth:session:${sessionId}`;
      await this.redisService.del(key);

      // 从用户会话列表中移除
      const userSessionsKey = `auth:user:sessions:${session.userId}`;
      await this.redisService.srem(userSessionsKey, sessionId);
    }
  }

  private async deleteUserSessions(userId: string): Promise<void> {
    const userSessionsKey = `auth:user:sessions:${userId}`;
    const sessionIds =
      await this.redisService.smembers<string>(userSessionsKey);

    // 删除所有会话
    for (const sessionId of sessionIds) {
      const key = `auth:session:${sessionId}`;
      await this.redisService.del(key);
    }

    // 删除会话列表
    await this.redisService.del(userSessionsKey);
  }

  private async saveRefreshToken(
    token: string,
    data: RefreshTokenData,
  ): Promise<void> {
    const key = `auth:refresh:${token}`;
    const ttl = this.REFRESH_TOKEN_EXPIRY_DAYS * 86400;
    await this.redisService.set(key, data, ttl);
  }

  private async getRefreshToken(
    token: string,
  ): Promise<RefreshTokenData | null> {
    const key = `auth:refresh:${token}`;
    return await this.redisService.get<RefreshTokenData>(key);
  }

  private async deleteRefreshToken(token: string): Promise<void> {
    const key = `auth:refresh:${token}`;
    await this.redisService.del(key);
  }
  // ==================== 辅助方法 ====================

  private async generateTokens(
    user: any,
    sessionId: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = {
      sub: user.id,
      phone: user.mobile,
      role: 'USER',
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.idGenerator.nextId();
    const expiresIn = this.accessTokenExpiresInSeconds;

    // 存储刷新令牌到Redis
    const refreshTokenExpiresAt =
      Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    await this.saveRefreshToken(refreshToken, {
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private async generateTokensWithPlatform(
    user: any,
    sessionId: string,
    platform: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = {
      sub: user.id,
      phone: user.mobile,
      role: 'USER',
      sessionId,
      platform,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.idGenerator.nextId();
    const expiresIn = this.accessTokenExpiresInSeconds;

    // 存储刷新令牌
    const refreshTokenExpiresAt =
      Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    await this.saveRefreshToken(refreshToken, {
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  private async verifyCode(phone: string, code: string): Promise<boolean> {
    // 开发环境支持万能验证码
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const isDevOrTest = nodeEnv === 'development' || nodeEnv === 'test';
    if (isDevOrTest && code === '123456') {
      return true;
    }

    const codeData = await this.getVerificationCode(phone);

    if (!codeData) {
      return false;
    }

    if (codeData.expiresAt < Date.now()) {
      await this.deleteVerificationCode(phone);
      return false;
    }

    if (codeData.attempts >= codeData.maxAttempts) {
      await this.deleteVerificationCode(phone);
      return false;
    }

    // 增加尝试次数
    codeData.attempts++;
    await this.saveVerificationCode(phone, codeData);

    if (codeData.code !== code) {
      return false;
    }

    return true;
  }
// 6位验证码， 60s 有效期
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateSessionId(): string {
    return this.idGenerator.nextId();
  }

  private async sendSMS(
    phone: string,
    code: string,
    type: string,
  ): Promise<void> {
    try {
      await this.notificationService.sendNotification({
        type: NotificationType.SMS,
        recipient: {
          phoneNumber: phone,
        },
        content: {
          title: '验证码',
          body: `您的验证码是：${code}，5分钟内有效。`,
          data: { type },
        },
        priority: NotificationPriority.HIGH,
      });

      this.logger.log(`验证码已通过通知服务发送 (${phone})`);
    } catch (error) {
      this.logger.error('发送短信失败:', error);
      // 在开发环境中，可以将验证码打印到控制台
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        this.logger.log(`验证码 (${phone}): ${code}`);
      }
    }
  }
}
