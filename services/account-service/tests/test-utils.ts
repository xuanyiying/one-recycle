import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { UpdateUserDto } from '../src/user/dto/update-user.dto';
import { CreateAddressDto } from '../src/address/dto/create-address.dto';
import { UserRole } from '@shared/types/auth.types';
import { UserStatus } from '@prisma/client';

// Mock PrismaService
export function createMockPrismaService() {
  const mockPrismaService = {
    user: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
    },
    address: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
    },
    userIdentity: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn(),
  };

  return mockPrismaService;
}

// 测试数据工厂
export function createTestUser(overrides: Partial<any> = {}) {
  return {
    id: BigInt(1),
    mobile: '13800138000',
    nickname: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// 创建符合UserResponseDto类型的测试用户
export const createTestUserResponse = (overrides: Partial<any> = {}): any => {
  return {
    id: '1',
    mobile: '13800138000',
    nickname: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

export function createTestAddress(overrides: Partial<any> = {}) {
  return {
    id: BigInt(1),
    userId: BigInt(1),
    consignee: '张三',
    mobile: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '某某街道123号',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestUserIdentity(overrides: Partial<any> = {}) {
  return {
    id: BigInt(1),
    userId: BigInt(1),
    provider: 'wechat',
    appId: 'wx123456789',
    openid: 'openid123',
    unionid: 'unionid123',
    extraData: {},
    createdAt: new Date(),
    ...overrides,
  };
}

// DTO 工厂
export function createCreateUserDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
  return {
    mobile: '13800138000',
    nickname: '测试用户',
    avatarUrl: 'https://example.com/avatar.jpg',
    ...overrides,
  };
}

export function createUpdateUserDto(overrides: Partial<UpdateUserDto> = {}): UpdateUserDto {
  return {
    nickname: '更新的用户',
    avatarUrl: 'https://example.com/new-avatar.jpg',
    ...overrides,
  };
}

export function createCreateAddressDto(overrides: Partial<CreateAddressDto> = {}): CreateAddressDto {
  return {
    userId: 1,
    consignee: '张三',
    mobile: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '某某街道123号',
    isDefault: false,
    ...overrides,
  };
}

// 创建测试模块的辅助函数
export async function createTestingModule(providers: any[]): Promise<TestingModule> {
  return Test.createTestingModule({
    providers,
  }).compile();
}