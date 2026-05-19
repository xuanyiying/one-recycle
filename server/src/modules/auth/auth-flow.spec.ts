import { Test, TestingModule } from '@nestjs/testing';
import AuthRedisService from './auth-redis.service';
import { RedisService, SnowflakeIdGenerator } from '@/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/modules/user/services/user.service';
import { NotificationService } from '../notification/services/notification.service';
import { WeChatPlatform } from '@/modules/auth/platforms';
import { AlipayPlatform } from '@/modules/auth/platforms';
import { TikTokPlatform } from '@/modules/auth/platforms';
import { KuaishouPlatform } from '@/modules/auth/platforms';

describe('AuthFlow Integration', () => {
  let service: AuthRedisService;
  let redisService: any;
  let userService: any;
  let notificationService: any;

  // Mock data
  const mockMobile = '15529328373';
  const mockUser = {
    id: '1212',
    mobile: mockMobile,
    email: 'test@example.com',
    nickname: 'Test User',
    avatarUrl: 'http://avatar.com/u.jpg',
    role: 'USER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    // In-memory Redis mock
    const redisStore = new Map();
    redisService = {
      set: jest.fn((key, val, ttl) => {
        redisStore.set(key, val);
        return Promise.resolve();
      }),
      get: jest.fn((key) => Promise.resolve(redisStore.get(key))),
      del: jest.fn((key) => {
        redisStore.delete(key);
        return Promise.resolve();
      }),
      sadd: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      srem: jest.fn().mockResolvedValue(1),
      smembers: jest.fn().mockResolvedValue([]),
    };

    userService = {
      findByMobile: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn().mockResolvedValue(mockUser),
      findByIdentity: jest.fn(),
      createOrUpdateIdentity: jest.fn(),
      update: jest.fn(),
    };

    notificationService = {
      sendNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRedisService,
        { provide: RedisService, useValue: redisService },
        { provide: UserService, useValue: userService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload) => {
              console.log('JWT Sign Payload:', payload);
              return 'mock-jwt-token';
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key, defaultValue) => {
              if (key === 'NODE_ENV') return 'test';
              if (key === 'UNIVERSAL_VERIFICATION_CODE') return '123456';
              return defaultValue !== undefined ? defaultValue : null;
            }),
          },
        },
        {
          provide: SnowflakeIdGenerator,
          useValue: { nextId: jest.fn().mockReturnValue('mock-id') },
        },
        {
          provide: NotificationService,
          useValue: notificationService,
        },
        // Mock platforms
        { provide: WeChatPlatform, useValue: {} },
        { provide: AlipayPlatform, useValue: {} },
        { provide: TikTokPlatform, useValue: {} },
        { provide: KuaishouPlatform, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthRedisService>(AuthRedisService);
    await service.onModuleInit();
  });

  it('should complete full login flow with complete user data', async () => {
    console.log('Starting Auth Flow Test...');

    // 1. Send Code
    console.log('Step 1: Sending verification code...');
    const sendRes = await service.sendVerificationCode({
      mobile: mockMobile,
      type: 'login',
    });
    expect(sendRes.success).toBe(true);
    expect(redisService.set).toHaveBeenCalled();
    expect(notificationService.sendNotification).toHaveBeenCalled();
    console.log('Verification code sent successfully.');

    // Retrieve the actual verification code stored in the Redis mock
    const codeKey = `auth:code:${mockMobile}`;
    const storedData = await redisService.get(codeKey);
    const actualCode = storedData?.code;

    // 2. Login
    console.log(`Step 2: Logging in with code ${actualCode}...`);
    const loginRes = await service.login({
      mobile: mockMobile,
      verificationCode: actualCode,
    });

    // 3. Verify Response Structure
    console.log('Step 3: Verifying response structure...');
    console.log('Login Result:', JSON.stringify(loginRes, null, 2));

    expect(loginRes.user).toBeDefined();
    expect(loginRes.user.id).toBe(mockUser.id);
    expect(loginRes.user.mobile).toBe(mockUser.mobile);

    // Critical: Check if extended fields are present
    expect(loginRes.user.email).toBe(mockUser.email);
    expect(loginRes.user.nickname).toBe(mockUser.nickname);
    expect(loginRes.user.avatarUrl).toBe(mockUser.avatarUrl);
    expect(loginRes.user.status).toBe(mockUser.status);
    expect(loginRes.user.createdAt).toBe(mockUser.createdAt);
    expect(loginRes.user.updatedAt).toBe(mockUser.updatedAt);

    expect(loginRes.tokens).toBeDefined();
    expect(loginRes.tokens.accessToken).toBe('mock-jwt-token');

    console.log('Auth Flow Test Passed!');
  });
});
