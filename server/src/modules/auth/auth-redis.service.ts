import {
  PersistentSnowflakeIdGenerator,
  RedisService,
  RedisSnowflakeStateStore,
} from '@/common';
import { WeChatPlatform } from '@/modules/auth/platforms';
import { UpdateUserDto } from '@/modules/user/dto';
import { UserService } from '@/modules/user/services/user.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  NotificationPriority,
  NotificationType,
} from '../notification/entities/notification.entity';
import { NotificationService } from '../notification/services/notification.service';
import { AuthKeyUtils } from './constants/auth-keys.constant';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { ThirdPartyLoginDto } from './dto/third-party-login.dto';
import { AlipayPlatform } from './platforms/alipay.platform';
import { KuaishouPlatform } from './platforms/kuaishou.platform';
import { TikTokPlatform } from './platforms/tiktok.platform';

export interface AuthResult {
  user: {
    id: string;
    email?: string;
    mobile?: string;
    nickname?: string;
    avatarUrl?: string;
    role?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface VerificationCodeData {
  code: string;
  mobile: string;
  type: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
  maxAttempts: number;
}

interface RefreshTokenData {
  id: string;
  expiresAt: number;
}

/**
 * 认证服务（使用Redis存储）
 * 生产环境就绪版本
 */
@Injectable()
class AuthRedisService implements OnModuleInit {
  private readonly logger = new Logger(AuthRedisService.name);
  private readonly CODE_EXPIRY_SECONDS: number = 60;
  private readonly CODE_RESEND_INTERVAL_SECONDS: number;
  private readonly MAX_CODE_ATTEMPTS: number;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS: number;
  private readonly accessTokenExpiresInSeconds: number;
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly wechatPlatform: WeChatPlatform,
    private readonly alipayPlatform: AlipayPlatform,
    private readonly tiktokPlatform: TikTokPlatform,
    private readonly kuaishouPlatform: KuaishouPlatform,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {
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

    this.idGenerator = new PersistentSnowflakeIdGenerator({
      workerId: 11,
      datacenterId: 1,
      stateStore: new RedisSnowflakeStateStore(this.redisService),
      stateKey: 'snowflake:state:auth',
      metricsKey: 'snowflake:auth',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.idGenerator.initialize();
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { mobile, verificationCode } = loginDto;
    this.logger.log('尝试登录');

    // 验证手机号格式
    if (!this.isValidPhoneNumber(mobile)) {
      this.logger.warn(`登录失败: 手机号格式不正确 - ${mobile}`);
      throw new BadRequestException('手机号格式不正确');
    }

    // 验证验证码
    const isCodeValid = await this.verifyCode(mobile, verificationCode);
    if (!isCodeValid) {
      this.logger.warn(`登录失败: 验证码错误或已过期 - ${mobile}`);
      throw new UnauthorizedException('验证码错误或已过期');
    }

    // 查找或创建用户
    let user = await this.userService.findByMobile(mobile);
    if (!user) {
      this.logger.log(`用户不存在，创建新用户: ${mobile}`);
      user = await this.userService.create({
        mobile,
        nickname: `用户${mobile.slice(-4)}`,
      });
    }

    // 生成令牌
    const tokens = await this.generateTokens(user);

    // 清除已使用的验证码
    await this.deleteVerificationCode(mobile);

    this.logger.log(`登录成功: userId=${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile || mobile,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status || 'active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens,
    };
  }

  async sendVerificationCode(
    sendCodeDto: SendCodeDto,
  ): Promise<{ success: boolean; message: string }> {
    const { mobile, type = 'login' } = sendCodeDto;
    this.logger.log(`请求发送验证码: mobile=${mobile}, type=${type}`);

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
    // 60秒过期
    const expiresAt = Date.now() + this.CODE_EXPIRY_SECONDS * 1000;

    // 存储验证码到Redis
    await this.saveVerificationCode(mobile, {
      code,
      mobile,
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
    this.logger.log(`刷新令牌请求`);

    const tokenData = await this.getRefreshToken(refreshToken);
    if (!tokenData || tokenData.expiresAt < Date.now()) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    const user = await this.userService.findOne(tokenData.id);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const payload = {
      sub: user.id,
      mobile: user.mobile,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiresInSeconds,
    });
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
    this.logger.log(`用户登出: userId=${userId}`);

    // 删除刷新令牌
    if (refreshToken) {
      await this.deleteRefreshToken(refreshToken);
    }

    return {
      success: true,
      message: '登出成功',
    };
  }

  async thirdPartyLogin(
    platform: string,
    thirdPartyLoginDto: ThirdPartyLoginDto,
  ): Promise<AuthResult> {
    const { code, nickname, avatarUrl } = thirdPartyLoginDto;
    this.logger.log(`第三方登录: platform=${platform}`);

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
    let user = await this.userService.findByIdentity(
      platform,
      platformUserInfo.openid,
    );

    if (!user) {
      // 创建新用户
      const defaultNickname =
        nickname || `用户${platformUserInfo.openid.slice(-6)}`;
      user = await this.userService.create({
        nickname: defaultNickname,
        avatarUrl: avatarUrl,
      });

      // 绑定平台身份
      await this.userService.createOrUpdateIdentity(user.id, {
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
        user = await this.userService.update(user.id, updateData);
      }
    }

    // 生成令牌
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status || 'active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      tokens,
    };
  }

  // ==================== Redis操作方法 ====================

  private async saveVerificationCode(
    mobile: string,
    data: VerificationCodeData,
  ): Promise<void> {
    const key = AuthKeyUtils.getVerificationCodeKey(mobile);
    // 使用 60秒
    const ttl = this.CODE_EXPIRY_SECONDS;
    await this.redisService.set(key, data, ttl);
  }

  private async getVerificationCode(
    phone: string,
  ): Promise<VerificationCodeData | null> {
    const key = AuthKeyUtils.getVerificationCodeKey(phone);
    return await this.redisService.get<VerificationCodeData>(key);
  }

  private async deleteVerificationCode(phone: string): Promise<void> {
    const key = AuthKeyUtils.getVerificationCodeKey(phone);
    await this.redisService.del(key);
  }

  private async saveRefreshToken(
    token: string,
    data: RefreshTokenData,
  ): Promise<void> {
    const key = AuthKeyUtils.getRefreshTokenKey(token);
    const ttl = this.REFRESH_TOKEN_EXPIRY_DAYS * 86400;
    await this.redisService.set(key, data, ttl);
  }

  private async getRefreshToken(
    token: string,
  ): Promise<RefreshTokenData | null> {
    const key = AuthKeyUtils.getRefreshTokenKey(token);
    return await this.redisService.get<RefreshTokenData>(key);
  }

  private async deleteRefreshToken(token: string): Promise<void> {
    const key = AuthKeyUtils.getRefreshTokenKey(token);
    await this.redisService.del(key);
  }

  // ==================== 辅助方法 ====================

  private async generateTokens(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = {
      sub: user.id,
      mobile: user.mobile,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiresInSeconds,
    });
    const refreshToken = this.idGenerator.nextId();
    const expiresIn = this.accessTokenExpiresInSeconds;

    // 存储刷新令牌到Redis
    const refreshTokenExpiresAt =
      Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    await this.saveRefreshToken(refreshToken, {
      id: user.id,
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
          body: `您的验证码是：${code}，60秒内有效。`,
          data: { type },
        },
        priority: NotificationPriority.HIGH,
      });

      this.logger.log(`验证码已通过通知服务发送 (${phone})`);
    } catch (error) {
      this.logger.error('发送短信失败:', error);
      throw new BadRequestException('验证码发送失败，请稍后重试');
    }
  }
}

export default AuthRedisService;
