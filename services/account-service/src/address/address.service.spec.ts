import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AddressService } from './address.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  createMockPrismaService,
  createTestAddress,
  createTestUser,
  createCreateAddressDto,
} from '../../tests/test-utils';

describe('AddressService', () => {
  let service: AddressService;
  let prismaService: any;

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create address successfully when user exists', async () => {
      const createAddressDto = createCreateAddressDto();
      const existingUser = createTestUser();
      const expectedAddress = createTestAddress();

      prismaService.user.findUnique.mockResolvedValue(existingUser);
      prismaService.address.create.mockResolvedValue(expectedAddress);

      const result = await service.create(createAddressDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(createAddressDto.userId) },
      });
      expect(prismaService.address.create).toHaveBeenCalledWith({
        data: {
          ...createAddressDto,
          userId: BigInt(createAddressDto.userId),
        },
      });
      expect(result).toEqual(expectedAddress);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const createAddressDto = createCreateAddressDto();

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createAddressDto)).rejects.toThrow(
        new NotFoundException('用户不存在')
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(createAddressDto.userId) },
      });
      expect(prismaService.address.create).not.toHaveBeenCalled();
    });

    it('should create address with default values', async () => {
      const createAddressDto = createCreateAddressDto({
        isDefault: undefined,
      });
      const existingUser = createTestUser();
      const expectedAddress = createTestAddress({ isDefault: false });

      prismaService.user.findUnique.mockResolvedValue(existingUser);
      prismaService.address.create.mockResolvedValue(expectedAddress);

      const result = await service.create(createAddressDto);

      expect(result).toEqual(expectedAddress);
    });
  });

  describe('findAllByUserId', () => {
    it('should return addresses ordered by isDefault desc', async () => {
      const userId = 1;
      const addresses = [
        createTestAddress({ id: BigInt(1), isDefault: true }),
        createTestAddress({ id: BigInt(2), isDefault: false }),
        createTestAddress({ id: BigInt(3), isDefault: false }),
      ];

      prismaService.address.findMany.mockResolvedValue(addresses);

      const result = await service.findAllByUserId(userId);

      expect(prismaService.address.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(userId) },
        orderBy: { isDefault: 'desc' },
      });
      expect(result).toEqual(addresses);
    });

    it('should return empty array when user has no addresses', async () => {
      const userId = 1;

      prismaService.address.findMany.mockResolvedValue([]);

      const result = await service.findAllByUserId(userId);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update address successfully', async () => {
      const addressId = 1;
      const updateData = {
        consignee: '李四',
        mobile: '13900139000',
        isDefault: false,
      };
      const existingAddress = createTestAddress();
      const updatedAddress = createTestAddress({ ...updateData });

      prismaService.address.findUnique.mockResolvedValue(existingAddress);
      prismaService.address.update.mockResolvedValue(updatedAddress);

      const result = await service.update(addressId, updateData);

      expect(prismaService.address.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
      });
      expect(prismaService.address.update).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
        data: {
          ...updateData,
          userId: undefined,
        },
      });
      expect(result).toEqual(updatedAddress);
    });

    it('should throw NotFoundException when address not found', async () => {
      const addressId = 999;
      const updateData = { consignee: '李四' };

      prismaService.address.findUnique.mockResolvedValue(null);

      await expect(service.update(addressId, updateData)).rejects.toThrow(
        new NotFoundException('地址不存在')
      );

      expect(prismaService.address.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
      });
      expect(prismaService.address.update).not.toHaveBeenCalled();
    });

    it('should set as default and unset other addresses when isDefault is true', async () => {
      const addressId = 1;
      const updateData = { isDefault: true };
      const existingAddress = createTestAddress({ userId: BigInt(1) });
      const updatedAddress = createTestAddress({ ...updateData });

      prismaService.address.findUnique.mockResolvedValue(existingAddress);
      prismaService.address.updateMany.mockResolvedValue({ count: 2 });
      prismaService.address.update.mockResolvedValue(updatedAddress);

      const result = await service.update(addressId, updateData);

      expect(prismaService.address.updateMany).toHaveBeenCalledWith({
        where: { userId: existingAddress.userId, id: { not: BigInt(addressId) } },
        data: { isDefault: false },
      });
      expect(prismaService.address.update).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
        data: {
          ...updateData,
          userId: undefined,
        },
      });
      expect(result).toEqual(updatedAddress);
    });

    it('should not update other addresses when isDefault is false', async () => {
      const addressId = 1;
      const updateData = { isDefault: false };
      const existingAddress = createTestAddress();
      const updatedAddress = createTestAddress({ ...updateData });

      prismaService.address.findUnique.mockResolvedValue(existingAddress);
      prismaService.address.update.mockResolvedValue(updatedAddress);

      const result = await service.update(addressId, updateData);

      expect(prismaService.address.updateMany).not.toHaveBeenCalled();
      expect(result).toEqual(updatedAddress);
    });

    it('should handle userId in updateData', async () => {
      const addressId = 1;
      const updateData = { userId: 2, consignee: '王五' };
      const existingAddress = createTestAddress();
      const updatedAddress = createTestAddress({ ...updateData });

      prismaService.address.findUnique.mockResolvedValue(existingAddress);
      prismaService.address.update.mockResolvedValue(updatedAddress);

      const result = await service.update(addressId, updateData);

      expect(prismaService.address.update).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
        data: {
          ...updateData,
          userId: BigInt(updateData.userId),
        },
      });
      expect(result).toEqual(updatedAddress);
    });
  });

  describe('remove', () => {
    it('should delete address successfully', async () => {
      const addressId = 1;
      const existingAddress = createTestAddress();

      prismaService.address.findUnique.mockResolvedValue(existingAddress);
      prismaService.address.delete.mockResolvedValue(existingAddress);

      const result = await service.remove(addressId);

      expect(prismaService.address.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
      });
      expect(prismaService.address.delete).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
      });
      expect(result).toEqual(existingAddress);
    });

    it('should throw NotFoundException when address not found', async () => {
      const addressId = 999;

      prismaService.address.findUnique.mockResolvedValue(null);

      await expect(service.remove(addressId)).rejects.toThrow(
        new NotFoundException('地址不存在')
      );

      expect(prismaService.address.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(addressId) },
      });
      expect(prismaService.address.delete).not.toHaveBeenCalled();
    });
  });
});