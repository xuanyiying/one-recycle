import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../src/auth/auth.module';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthService } from '../../src/auth/auth.service';
import { WeChatPlatform } from '../../src/auth/platforms/wechat.platform';
import { AlipayPlatform } from '../../src/auth/platforms/alipay.platform';
import { TikTokPlatform } from '../../src/auth/platforms/tiktok.platform';
import { KuaishouPlatform } from '../../src/auth/platforms/kuaishou.platform';
import { AccountClient } from '../../src/auth/clients/account.client';

describe('Third-Party Login (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let wechatPlatform: WeChatPlatform;
  let accountClient: AccountClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        PrismaModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    wechatPlatform = moduleFixture.get<WeChatPlatform>(WeChatPlatform);
    accountClient = moduleFixture.get<AccountClient>(AccountClient);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Platform Services', () => {
    it('should have WeChatPlatform service', () => {
      expect(wechatPlatform).toBeDefined();
      expect(wechatPlatform.code2Session).toBeDefined();
    });

    it('should have AlipayPlatform service', () => {
      const alipayPlatform = app.get<AlipayPlatform>(AlipayPlatform);
      expect(alipayPlatform).toBeDefined();
      expect(alipayPlatform.getAccessToken).toBeDefined();
    });

    it('should have TikTokPlatform service', () => {
      const tiktokPlatform = app.get<TikTokPlatform>(TikTokPlatform);
      expect(tiktokPlatform).toBeDefined();
      expect(tiktokPlatform.code2Session).toBeDefined();
    });

    it('should have KuaishouPlatform service', () => {
      const kuaishouPlatform = app.get<KuaishouPlatform>(KuaishouPlatform);
      expect(kuaishouPlatform).toBeDefined();
      expect(kuaishouPlatform.code2Session).toBeDefined();
    });
  });

  describe('AccountClient', () => {
    it('should have AccountClient service', () => {
      expect(accountClient).toBeDefined();
      expect(accountClient.findUserByIdentity).toBeDefined();
      expect(accountClient.createUser).toBeDefined();
      expect(accountClient.createOrUpdateUserIdentity).toBeDefined();
    });
  });

  describe('AuthService.thirdPartyLogin', () => {
    it('should have thirdPartyLogin method', () => {
      expect(authService.thirdPartyLogin).toBeDefined();
    });

    it('should reject unsupported platform', async () => {
      await expect(
        authService.thirdPartyLogin('unsupported', {
          code: 'test-code',
        }),
      ).rejects.toThrow('不支持的平台');
    });

    // Note: Full integration tests would require mocking the platform APIs
    // and account service, which is beyond the scope of this basic test
  });
});
