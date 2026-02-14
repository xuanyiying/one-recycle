import { Test, TestingModule } from '@nestjs/testing';
import { CourierService } from './courier.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CourierStatus } from '@prisma/client';
import { RedisService } from '@/common';

describe('CourierService', () => {
  let service: CourierService;
  let prisma: PrismaService;

  const mockPrismaService = {
    courier: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => defaultValue),
  };

  const mockRedisService = {
    get: jest.fn(async () => null),
    set: jest.fn(async () => {}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<CourierService>(CourierService);
    prisma = module.get<PrismaService>(PrismaService);
    await service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCourier', () => {
    it('should create a courier successfully', async () => {
      const createDto = {
        name: 'John Doe',
        phone: '1234567890',
        email: 'john@example.com',
      };

      const mockCourier = {
        id: '1234567890',
        ...createDto,
        status: CourierStatus.OFFLINE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.courier.create.mockResolvedValue(mockCourier);

      const result = await service.createCourier(createDto);

      expect(prisma.courier.create).toHaveBeenCalled();
      expect(result).toEqual(mockCourier);
    });
  });

  describe('findOne', () => {
    it('should return a courier if found', async () => {
      const mockCourier = { id: '1', name: 'John' };
      mockPrismaService.courier.findUnique.mockResolvedValue(mockCourier);

      const result = await service.findOne('1');
      expect(result).toEqual(mockCourier);
    });
  });
});
