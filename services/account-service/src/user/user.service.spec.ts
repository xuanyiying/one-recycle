import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createMockPrismaService,
  createTestUser,
  createCreateUserDto,
  createUpdateUserDto,
} from '../../tests/test-utils';

describe('UserService', () => {
  let service: UserService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建用户', async () => {
      const createUserDto = createCreateUserDto();
      const expectedUser = createTestUser();

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { mobile: createUserDto.mobile },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          avatarUrl: createUserDto.avatarUrl,
        },
        select: {
          id: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('当手机号已存在时应该抛出ConflictException', async () => {
      const createUserDto = createCreateUserDto();
      const existingUser = createTestUser();

      prismaService.user.findUnique.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('手机号已被注册')
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { mobile: createUserDto.mobile },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('应该处理可选字段', async () => {
      const createUserDto = createCreateUserDto({
        nickname: undefined,
        avatarUrl: undefined,
      });
      const expectedUser = createTestUser({
        nickname: null,
        avatarUrl: null,
      });

      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
    });
  });



  describe('findOne', () => {
    it('应该返回指定ID的用户', async () => {
      const userId = '1';
      const user = createTestUser();
      prismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(userId) },
        select: {
          id: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(user);
    });

    it('当用户不存在时应该抛出NotFoundException', async () => {
      const userId = '999';
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(
        new NotFoundException('用户不存在')
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(userId) },
        select: {
          id: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('update', () => {
    it('应该成功更新用户', async () => {
      const userId = '1';
      const updateUserDto = createUpdateUserDto();
      const existingUser = createTestUser();
      const updatedUser = createTestUser({ ...updateUserDto });

      prismaService.user.findUnique
        .mockResolvedValueOnce(existingUser) // findOne call
        .mockResolvedValueOnce(null); // mobile check call
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: BigInt(userId) },
        data: updateUserDto,
        select: {
          id: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('当用户不存在时应该抛出NotFoundException', async () => {
      const userId = '999';
      const updateUserDto = createUpdateUserDto();

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new NotFoundException('用户不存在')
      );

      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('当更新的手机号已被使用时应该抛出ConflictException', async () => {
      const userId = '1';
      const updateUserDto = createUpdateUserDto({ mobile: '13900139000' });
      const existingUser = createTestUser({ mobile: '13800138000' });
      const conflictUser = createTestUser({ id: BigInt(2), mobile: '13900139000' });

      prismaService.user.findUnique
        .mockResolvedValueOnce(existingUser) // findOne call
        .mockResolvedValueOnce(conflictUser); // mobile check call

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new ConflictException('手机号已被使用')
      );

      expect(prismaService.user.update).not.toHaveBeenCalled();
    });

    it('应该处理部分更新', async () => {
      const userId = '1';
      const updateUserDto = createUpdateUserDto({ nickname: '新昵称' });
      const existingUser = createTestUser();
      const updatedUser = createTestUser({ nickname: '新昵称' });

      prismaService.user.findUnique.mockResolvedValue(existingUser);
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
    });
  });

  describe('findByIdentity', () => {
    it('应该根据身份标识查找用户', async () => {
      const provider = 'wechat';
      const openid = 'openid123';
      const user = createTestUser();
      const identity = {
        id: BigInt(1),
        userId: BigInt(1),
        provider,
        openid,
        user,
      };

      prismaService.userIdentity.findFirst.mockResolvedValue(identity);

      const result = await service.findByIdentity(provider, openid);

      expect(prismaService.userIdentity.findFirst).toHaveBeenCalledWith({
        where: { provider, openid },
        include: { user: true },
      });
      expect(result).toEqual(user);
    });

    it('当身份标识不存在时应该抛出NotFoundException', async () => {
      const provider = 'wechat';
      const openid = 'nonexistent';

      prismaService.userIdentity.findFirst.mockResolvedValue(null);

      await expect(service.findByIdentity(provider, openid)).rejects.toThrow(
        new NotFoundException('用户身份标识不存在')
      );

      expect(prismaService.userIdentity.findFirst).toHaveBeenCalledWith({
        where: { provider, openid },
        include: { user: true },
      });
    });
  });
});