import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, OrderType } from '@/common';
import { NotFoundException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const createOrderDto = {
        userId: '1',
        addressId: '1',
        items: [
          { categoryId: 1, estimatedWeight: 5, unitPrice: 10, quantity: 1 },
        ],
        expectPickupTime: new Date().toISOString(),
        channel: 'APP',
      };

      const mockCreatedOrder = {
        id: BigInt(1),
        userId: BigInt(1),
        addressId: BigInt(1),
        status: OrderStatus.PENDING,
        orderType: OrderType.RECYCLE,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
        assignments: [],
      };

      mockPrismaService.order.create.mockResolvedValue(mockCreatedOrder);

      const result = await service.create(createOrderDto);

      expect(prisma.order.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an order if found', async () => {
      const mockOrder = {
        id: BigInt(1),
        userId: BigInt(1),
        addressId: BigInt(1),
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update order status', async () => {
      const mockUpdatedOrder = {
        id: BigInt(1),
        status: OrderStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.update(1, { status: OrderStatus.COMPLETED });

      expect(result.status).toBe(OrderStatus.COMPLETED);
    });
  });
});
