import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
/**
 * 创建测试应用
 */
export async function createTestApp(moduleMetadata: any): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule(moduleMetadata).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}

/**
 * 创建模拟的PrismaService
 */
export function createMockPrismaService() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userIdentity: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  };
}

/**
 * 创建测试用户数据
 */
export function createTestUser(overrides: any = {}) {
  return {
    id: BigInt(1),
    mobile: '13800138000',
    nickname: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * 创建测试JWT令牌
 */
export function createTestJwtPayload(overrides: any = {}) {
  return {
    sub: '1',
    phone: '13800138000',
    role: 'user',
    sessionId: 'test-session-id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

/**
 * 模拟SMS服务
 */
export function createMockSmsService() {
  return {
    sendVerificationCode: jest.fn().mockResolvedValue({ success: true }),
    verifyCode: jest.fn().mockResolvedValue(true),
  };
}

/**
 * 模拟Redis服务
 */
export function createMockRedisService() {
  return {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
  };
}