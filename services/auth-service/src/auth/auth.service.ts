import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SnowflakeIdGenerator } from '@one-recycle/shared';
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
import axios from 'axios';

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
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

@Injectable()
export class AuthService {
  private readonly CODE_EXPIRY_MINUTES = 5;
  private readonly MAX_CODE_ATTEMPTS = 3;
  private readonly TOKEN_EXPIRY_HOURS = 24;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;
  private readonly idGenerator: SnowflakeIdGenerator;

  // 临时存储验证码（生产环境应使用Redis）
  private verificationCodes = new Map<string, VerificationCodeData>();
  private refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();
  private sessions = new Map<string, { userId: string; deviceFingerprint?: string; createdAt: Date }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly wechatPlatform: WeChatPlatform,
    private readonly alipayPlatform: AlipayPlatform,
    private readonly tiktokPlatform: TikTokPlatform,
    private readonly kuaishouPlatform: KuaishouPlatform,
    private readonly accountClient: AccountClient,
  ) {
    this.idGenerator = new SnowflakeIdGenerator({ workerId: 11, datacenterId: 1 });
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
    let user = await this.findUserByPhone(mobile);
    if (!user) {
      user = await this.createUser(mobile);
    }

    // 生成会话ID
    const sessionId = this.generateSessionId();
    
    // 存储会话信息
    this.sessions.set(sessionId, {
      userId: user.id,
      deviceFingerprint,
      createdAt: new Date(),
    });

    // 生成令牌
    const tokens = await this.generateTokens(user, sessionId);

    // 清除已使用的验证码
    this.verificationCodes.delete(mobile);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      },
      tokens,
      sessionId,
    };
  }

  async sendVerificationCode(sendCodeDto: SendCodeDto): Promise<{ success: boolean; message: string }> {
    const { mobile, type = 'login' } = sendCodeDto;

    // 验证手机号格式
    if (!this.isValidPhoneNumber(mobile)) {
      throw new BadRequestException('手机号格式不正确');
    }

    // 检查是否频繁发送
    const existingCode = this.verificationCodes.get(mobile);
    if (existingCode && this.isCodeStillValid(existingCode)) {
      const remainingTime = Math.ceil((existingCode.expiresAt.getTime() - Date.now()) / 1000);
      throw new BadRequestException(`验证码仍然有效，请${remainingTime}秒后再试`);
    }

    // 生成验证码
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

    // 存储验证码
    this.verificationCodes.set(mobile, {
      code,
      phone: mobile,
      type,
      expiresAt,
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

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; expiresIn: number }> {
    const { refreshToken } = refreshTokenDto;

    const tokenData = this.refreshTokens.get(refreshToken);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    const user = await this.findUserById(tokenData.userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 生成新的访问令牌
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.TOKEN_EXPIRY_HOURS * 3600;

    return {
      accessToken,
      expiresIn,
    };
  }

  async logout(userId: string, logoutDto: LogoutDto): Promise<{ success: boolean; message: string }> {
    const { refreshToken } = logoutDto;

    // 删除刷新令牌
    if (refreshToken) {
      this.refreshTokens.delete(refreshToken);
    }

    // 删除用户的所有会话
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }

    return {
      success: true,
      message: '登出成功',
    };
  }

  async thirdPartyLogin(platform: string, thirdPartyLoginDto: ThirdPartyLoginDto): Promise<AuthResult> {
    const { code, nickname, avatarUrl, deviceFingerprint } = thirdPartyLoginDto;

    // 根据平台获取用户信息
    let platformUserInfo: { openid: string; unionid?: string };
    let appId: string;

    switch (platform.toLowerCase()) {
      case 'weapp':
      case 'wechat':
        const wechatInfo = await this.wechatPlatform.code2Session(code);
        platformUserInfo = { openid: wechatInfo.openid, unionid: wechatInfo.unionid };
        appId = this.configService.get<string>('WECHAT_APP_ID');
        break;

      case 'alipay':
        const alipayInfo = await this.alipayPlatform.getAccessToken(code);
        platformUserInfo = { openid: alipayInfo.openid || alipayInfo.user_id };
        appId = this.configService.get<string>('ALIPAY_APP_ID');
        break;

      case 'tt':
      case 'tiktok':
      case 'douyin':
        const tiktokInfo = await this.tiktokPlatform.code2Session(code);
        platformUserInfo = { openid: tiktokInfo.openid };
        appId = this.configService.get<string>('DOUYIN_APP_ID');
        break;

      case 'kwai':
      case 'kuaishou':
        const kuaishouInfo = await this.kuaishouPlatform.code2Session(code);
        platformUserInfo = { openid: kuaishouInfo.openid };
        appId = this.configService.get<string>('KUAISHOU_APP_ID');
        break;

      default:
        throw new BadRequestException(`不支持的平台: ${platform}`);
    }

    // 查找或创建用户
    let user = await this.accountClient.findUserByIdentity(platform, platformUserInfo.openid);

    if (!user) {
      // 创建新用户
      const defaultNickname = nickname || `用户${platformUserInfo.openid.slice(-6)}`;
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
        const updateData: any = {};
        if (nickname) updateData.nickname = nickname;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;
        user = await this.accountClient.updateUser(user.id, updateData);
      }
    }

    // 生成会话ID
    const sessionId = this.generateSessionId();

    // 存储会话信息
    this.sessions.set(sessionId, {
      userId: user.id,
      deviceFingerprint,
      createdAt: new Date(),
    });

    // 生成令牌（包含平台信息）
    const tokens = await this.generateTokensWithPlatform(user, sessionId, platform);

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
      platform, // 添加平台标识
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.idGenerator.nextId();
    const expiresIn = this.TOKEN_EXPIRY_HOURS * 3600;

    // 存储刷新令牌
    const refreshTokenExpiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    this.refreshTokens.set(refreshToken, {
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

  private isCodeStillValid(codeData: VerificationCodeData): boolean {
    return codeData.expiresAt > new Date();
  }

  private async verifyCode(phone: string, code: string): Promise<boolean> {
    const codeData = this.verificationCodes.get(phone);
    
    if (!codeData) {
      return false;
    }

    if (!this.isCodeStillValid(codeData)) {
      this.verificationCodes.delete(phone);
      return false;
    }

    if (codeData.attempts >= codeData.maxAttempts) {
      this.verificationCodes.delete(phone);
      return false;
    }

    codeData.attempts++;

    if (codeData.code !== code) {
      return false;
    }

    return true;
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateSessionId(): string {
    return this.idGenerator.nextId();
  }

  private async sendSMS(phone: string, code: string, type: string): Promise<void> {
    try {
      const notificationServiceUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', 'http://localhost:3008');
      
      await axios.post(`${notificationServiceUrl}/api/v1/notifications/send-sms`, {
        phone,
        message: `您的验证码是：${code}，5分钟内有效。`,
        type,
      });
    } catch (error) {
      console.error('发送短信失败:', error);
      // 在开发环境中，可以将验证码打印到控制台
      if (this.configService.get<string>('NODE_ENV') === 'development') {
        console.log(`验证码 (${phone}): ${code}`);
      }
    }
  }

  private async findUserByPhone(phone: string): Promise<any> {
    try {
      // 这里应该调用用户服务或直接查询数据库
      // 暂时返回模拟数据
      return null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  private async findUserById(userId: string): Promise<any> {
    try {
      // 这里应该调用用户服务或直接查询数据库
      // 暂时返回模拟数据
      return null;
    } catch (error) {
      console.error('查找用户失败:', error);
      return null;
    }
  }

  private async createUser(phone: string): Promise<any> {
    try {
      // 这里应该调用用户服务或直接创建用户
      // 暂时返回模拟数据
      return {
        id: Math.random().toString(36).substring(2),
        phone,
        nickname: `用户${phone.slice(-4)}`,
        avatar: null,
        role: 'USER',
        status: 'ACTIVE',
      };
    } catch (error) {
      console.error('创建用户失败:', error);
      throw new BadRequestException('创建用户失败');
    }
  }

  private async generateTokens(user: any, sessionId: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const payload = { sub: user.id, phone: user.phone, role: user.role, sessionId };
    
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.idGenerator.nextId();
    const expiresIn = this.TOKEN_EXPIRY_HOURS * 3600;

    // 存储刷新令牌
    const refreshTokenExpiresAt = new Date(Date.now() + this.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: refreshTokenExpiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}