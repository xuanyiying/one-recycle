import { AuthRedisService } from '../../src/auth/auth-redis.service';
import { WeChatPlatform } from '../../src/auth/platforms/wechat.platform';
import { AlipayPlatform } from '../../src/auth/platforms/alipay.platform';
import { TikTokPlatform } from '../../src/auth/platforms/tiktok.platform';
import { KuaishouPlatform } from '../../src/auth/platforms/kuaishou.platform';
import { AccountClient } from '../../src/auth/clients/account.client';
import { ThirdPartyLoginDto } from '../../src/auth/dto/third-party-login.dto';

describe('Third-Party Authentication Integration', () => {
  let authService: AuthRedisService;
  let wechatPlatform: WeChatPlatform;
  let alipayPlatform: AlipayPlatform;
  let tiktokPlatform: TikTokPlatform;
  let kuaishouPlatform: KuaishouPlatform;
  let accountClient: AccountClient;

  beforeEach(() => {
    // Create mock instances
    const mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config = {
          JWT_SECRET: 'test-secret',
          WECHAT_APP_ID: 'test-wechat-id',
          WECHAT_APP_SECRET: 'test-wechat-secret',
          ALIPAY_APP_ID: 'test-alipay-id',
          ALIPAY_APP_SECRET: 'test-alipay-secret',
          DOUYIN_APP_ID: 'test-douyin-id',
          DOUYIN_APP_SECRET: 'test-douyin-secret',
          KUAISHOU_APP_ID: 'test-kuaishou-id',
          KUAISHOU_APP_SECRET: 'test-kuaishou-secret',
          ACCOUNT_SERVICE_URL: 'http://localhost:3001',
        };
        return config[key] || defaultValue;
      }),
    };

    const mockJwtService = {
      sign: jest.fn(() => 'mock-jwt-token'),
    };

    const mockPrismaService = {};

    wechatPlatform = new WeChatPlatform(mockConfigService as any);
    alipayPlatform = new AlipayPlatform(mockConfigService as any);
    tiktokPlatform = new TikTokPlatform(mockConfigService as any);
    kuaishouPlatform = new KuaishouPlatform(mockConfigService as any);
    accountClient = new AccountClient(mockConfigService as any);

    authService = new AuthRedisService(
      mockJwtService as any,
      mockConfigService as any,
      mockPrismaService as any,
      wechatPlatform,
      alipayPlatform,
      tiktokPlatform,
      kuaishouPlatform,
      accountClient,
    );
  });

  describe('Platform Integration', () => {
    it('should have all platform providers initialized', () => {
      expect(wechatPlatform).toBeDefined();
      expect(alipayPlatform).toBeDefined();
      expect(tiktokPlatform).toBeDefined();
      expect(kuaishouPlatform).toBeDefined();
    });

    it('should have account client initialized', () => {
      expect(accountClient).toBeDefined();
    });
  });

  describe('WeChat Platform Authentication', () => {
    it('should have code2Session method', () => {
      expect(wechatPlatform.code2Session).toBeDefined();
      expect(typeof wechatPlatform.code2Session).toBe('function');
    });

    it('should handle WeChat login flow', async () => {
      // Mock the platform response
      jest.spyOn(wechatPlatform, 'code2Session').mockResolvedValue({
        openid: 'mock-wechat-openid',
        unionid: 'mock-wechat-unionid',
        session_key: 'mock-session-key',
      });

      // Mock account client responses
      jest.spyOn(accountClient, 'findUserByIdentity').mockResolvedValue(null);
      jest.spyOn(accountClient, 'createUser').mockResolvedValue({
        id: 'user-123',
        nickname: '微信用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      jest.spyOn(accountClient, 'createOrUpdateUserIdentity').mockResolvedValue(undefined);

      const loginDto: ThirdPartyLoginDto = {
        code: 'mock-wechat-code',
        nickname: '微信用户',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const result = await authService.thirdPartyLogin('weapp', loginDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-123');
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.sessionId).toBeDefined();
    });
  });

  describe('Alipay Platform Authentication', () => {
    it('should have getAccessToken method', () => {
      expect(alipayPlatform.getAccessToken).toBeDefined();
      expect(typeof alipayPlatform.getAccessToken).toBe('function');
    });

    it('should handle Alipay login flow', async () => {
      // Mock the platform response
      jest.spyOn(alipayPlatform, 'getAccessToken').mockResolvedValue({
        user_id: 'mock-alipay-userid',
        openid: 'mock-alipay-openid',
        access_token: 'mock-access-token',
      });

      // Mock account client responses
      jest.spyOn(accountClient, 'findUserByIdentity').mockResolvedValue(null);
      jest.spyOn(accountClient, 'createUser').mockResolvedValue({
        id: 'user-456',
        nickname: '支付宝用户',
        avatarUrl: 'https://example.com/avatar.jpg',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      jest.spyOn(accountClient, 'createOrUpdateUserIdentity').mockResolvedValue(undefined);

      const loginDto: ThirdPartyLoginDto = {
        code: 'mock-alipay-code',
        nickname: '支付宝用户',
      };

      const result = await authService.thirdPartyLogin('alipay', loginDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-456');
      expect(result.tokens).toBeDefined();
    });
  });

  describe('TikTok Platform Authentication', () => {
    it('should have code2Session method', () => {
      expect(tiktokPlatform.code2Session).toBeDefined();
      expect(typeof tiktokPlatform.code2Session).toBe('function');
    });

    it('should handle TikTok login flow', async () => {
      // Mock the platform response
      jest.spyOn(tiktokPlatform, 'code2Session').mockResolvedValue({
        openid: 'mock-tiktok-openid',
        session_key: 'mock-session-key',
      });

      // Mock account client responses
      jest.spyOn(accountClient, 'findUserByIdentity').mockResolvedValue(null);
      jest.spyOn(accountClient, 'createUser').mockResolvedValue({
        id: 'user-789',
        nickname: '抖音用户',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      jest.spyOn(accountClient, 'createOrUpdateUserIdentity').mockResolvedValue(undefined);

      const loginDto: ThirdPartyLoginDto = {
        code: 'mock-tiktok-code',
        nickname: '抖音用户',
      };

      const result = await authService.thirdPartyLogin('tt', loginDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-789');
    });
  });

  describe('Kuaishou Platform Authentication', () => {
    it('should have code2Session method', () => {
      expect(kuaishouPlatform.code2Session).toBeDefined();
      expect(typeof kuaishouPlatform.code2Session).toBe('function');
    });

    it('should handle Kuaishou login flow', async () => {
      // Mock the platform response
      jest.spyOn(kuaishouPlatform, 'code2Session').mockResolvedValue({
        openid: 'mock-kuaishou-openid',
        session_key: 'mock-session-key',
      });

      // Mock account client responses
      jest.spyOn(accountClient, 'findUserByIdentity').mockResolvedValue(null);
      jest.spyOn(accountClient, 'createUser').mockResolvedValue({
        id: 'user-101',
        nickname: '快手用户',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      jest.spyOn(accountClient, 'createOrUpdateUserIdentity').mockResolvedValue(undefined);

      const loginDto: ThirdPartyLoginDto = {
        code: 'mock-kuaishou-code',
        nickname: '快手用户',
      };

      const result = await authService.thirdPartyLogin('kwai', loginDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-101');
    });
  });

  describe('Token Generation with Platform Identifier', () => {
    it('should include platform identifier in JWT token', async () => {
      // Mock platform and account client
      jest.spyOn(wechatPlatform, 'code2Session').mockResolvedValue({
        openid: 'test-openid',
        session_key: 'test-session',
      });
      jest.spyOn(accountClient, 'findUserByIdentity').mockResolvedValue(null);
      jest.spyOn(accountClient, 'createUser').mockResolvedValue({
        id: 'user-test',
        nickname: '测试用户',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      jest.spyOn(accountClient, 'createOrUpdateUserIdentity').mockResolvedValue(undefined);

      const loginDto: ThirdPartyLoginDto = {
        code: 'test-code',
      };

      const result = await authService.thirdPartyLogin('weapp', loginDto);

      // Verify token structure
      expect(result.tokens.accessToken).toBeDefined();
      expect(typeof result.tokens.accessToken).toBe('string');
      expect(result.tokens.expiresIn).toBeGreaterThan(0);
    });
  });

  describe('Existing User Login', () => {
    it('should login existing user and update profile if provided', async () => {
      const existingUser = {
        id: 'existing-user-123',
        nickname: '老用户',
        avatarUrl: 'https://example.com/old-avatar.jpg',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock platform response
      jest.spyOn(wechatPlatform, 'code2Session').mockResolvedValue({
        openid: 'existing-openid',
        session_key: 'test-session',
      });

      // Mock finding existing user
      jest.spyOn(accountClient, 'findUserByIdentity').mockResolvedValue(existingUser);
      
      // Mock update user
      const updatedUser = { ...existingUser, nickname: '新昵称' };
      jest.spyOn(accountClient, 'updateUser').mockResolvedValue(updatedUser);

      const loginDto: ThirdPartyLoginDto = {
        code: 'test-code',
        nickname: '新昵称',
      };

      const result = await authService.thirdPartyLogin('weapp', loginDto);

      expect(result.user.id).toBe('existing-user-123');
      expect(accountClient.updateUser).toHaveBeenCalledWith(
        'existing-user-123',
        expect.objectContaining({ nickname: '新昵称' }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported platform', async () => {
      const loginDto: ThirdPartyLoginDto = {
        code: 'test-code',
      };

      await expect(
        authService.thirdPartyLogin('unsupported-platform', loginDto),
      ).rejects.toThrow('不支持的平台');
    });

    it('should handle platform API errors gracefully', async () => {
      jest.spyOn(wechatPlatform, 'code2Session').mockRejectedValue(
        new Error('Platform API error'),
      );

      const loginDto: ThirdPartyLoginDto = {
        code: 'invalid-code',
      };

      await expect(
        authService.thirdPartyLogin('weapp', loginDto),
      ).rejects.toThrow();
    });
  });
});
