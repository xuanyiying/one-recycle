import { Test, TestingModule } from '@nestjs/testing';
import { AddressService } from './address.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { CreateAddressDto } from './dto/create-address.dto';
import { NotFoundException } from '@nestjs/common';

describe('AddressService', () => {
  let service: AddressService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    address: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    region: {
      findMany: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createAddressDto: CreateAddressDto = {
      userId: '1',
      name: 'Test User',
      mobile: '13800138000',
      province: 'Province',
      city: 'City',
      district: 'District',
      detail: 'Detail Address',
      isDefault: true,
    };

    it('should create an address successfully', async () => {
      // Mock user exists
      mockPrismaService.user.findUnique.mockResolvedValue({ id: BigInt(1) });

      // Mock address creation
      const createdAddress = {
        ...createAddressDto,
        id: BigInt(1),
        userId: BigInt(1),
        town: '',
        street: '',
        zipCode: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.address.create.mockResolvedValue(createdAddress);

      const result = await service.create(createAddressDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
      expect(mockPrismaService.address.create).toHaveBeenCalledWith({
        data: {
          town: '',
          street: '',
          zipCode: '',
          ...createAddressDto,
          userId: BigInt(createAddressDto.userId),
        },
      });
      expect(result).toEqual(createdAddress);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createAddressDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.address.create).not.toHaveBeenCalled();
    });
  });
});
