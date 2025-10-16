import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '../../prisma/generated/client';
import { Decimal } from '../../prisma/generated/client/runtime/library';
import { InventoryService } from 'src/inventory/inventory.service';
import { PrismaService } from 'src/prisma.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    inventoryItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    inventoryTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    warehouse: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    salesRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    qualityCheck: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInventoryItem', () => {
    it('should create an inventory item successfully', async () => {
      const createDto = {
        warehouseId: 1,
        categoryId: 1,
        name: 'Test Item',
        description: 'Test Description',
        unit: 'pcs',
        quantity: 100,
        unitPrice: 10.5,
        location: 'A1-B2',
      };

      const expectedResult = {
        id: BigInt(1),
        ...createDto,
        warehouseId: BigInt(1),
        categoryId: BigInt(1),
        quantity: new Prisma.Decimal(100),
        unitPrice: new Prisma.Decimal(10.5),
        totalPrice: new Prisma.Decimal(1050),
        status: 'IN_STOCK',
      };

      mockPrismaService.inventoryItem.create.mockResolvedValue(expectedResult);

      const result = await service.createInventoryItem(createDto);

      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalledWith({
        data: {
          warehouseId: BigInt(1),
          categoryId: BigInt(1),
          name: 'Test Item',
          description: 'Test Description',
          unit: 'pcs',
          quantity: new Prisma.Decimal(100),
          unitPrice: new Prisma.Decimal(10.5),
          totalPrice: new Prisma.Decimal(1050),
          location: 'A1-B2',
          status: 'IN_STOCK',
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should set status to OUT_OF_STOCK when quantity is 0', async () => {
      const createDto = {
        warehouseId: 1,
        categoryId: 1,
        name: 'Test Item',
        description: 'Test Description',
        unit: 'pcs',
        quantity: 0,
        unitPrice: 10.5,
        location: 'A1-B2',
      };

      mockPrismaService.inventoryItem.create.mockResolvedValue({});

      await service.createInventoryItem(createDto);

      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'OUT_OF_STOCK',
        }),
      });
    });
  });

  describe('findInventoryItemById', () => {
    it('should return an inventory item by id', async () => {
      const itemId = '1';
      const expectedItem = {
        id: BigInt(1),
        name: 'Test Item',
        quantity: new Prisma.Decimal(100),
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(expectedItem);

      const result = await service.findInventoryItemById(itemId);

      expect(mockPrismaService.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        include: {
          warehouse: true,
          category: true,
        },
      });
      expect(result).toEqual(expectedItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      const itemId = '999';
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.findInventoryItemById(itemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateInventoryItem', () => {
    it('should update an inventory item successfully', async () => {
      const itemId = '1';
      const updateDto = {
        name: 'Updated Item',
        quantity: 150,
        unitPrice: 12.0,
      };

      const existingItem = {
        id: BigInt(1),
        name: 'Test Item',
        quantity: new Prisma.Decimal(100),
        unitPrice: new Prisma.Decimal(10.5),
      };

      const updatedItem = {
        ...existingItem,
        ...updateDto,
        quantity: new Prisma.Decimal(150),
        unitPrice: new Prisma.Decimal(12.0),
        totalPrice: new Prisma.Decimal(1800),
        status: 'IN_STOCK',
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);
      mockPrismaService.inventoryItem.update.mockResolvedValue(updatedItem);

      const result = await service.updateInventoryItem(itemId, updateDto);

      expect(mockPrismaService.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: expect.objectContaining({
          name: 'Updated Item',
          quantity: new Prisma.Decimal(150),
          unitPrice: new Prisma.Decimal(12.0),
          totalPrice: new Prisma.Decimal(1800),
          status: 'IN_STOCK',
        }),
      });
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      const itemId = '999';
      const updateDto = { name: 'Updated Item' };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.updateInventoryItem(itemId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTransaction', () => {
    it('should create an inbound transaction successfully', async () => {
      const createDto = {
        itemId: 1,
        type: 'INBOUND' as const,
        quantity: 50,
        unitPrice: 10.5,
        referenceId: 'REF001',
        notes: 'Test inbound',
      };

      const existingItem = {
        id: BigInt(1),
        quantity: new Prisma.Decimal(100),
        status: 'IN_STOCK',
      };

      const transaction = {
        id: BigInt(1),
        ...createDto,
        itemId: BigInt(1),
        quantity: new Prisma.Decimal(50),
        unitPrice: new Prisma.Decimal(10.5),
        totalPrice: new Prisma.Decimal(525),
      };

      mockPrismaService.inventoryTransaction.create.mockResolvedValue(transaction);
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);
      mockPrismaService.inventoryItem.update.mockResolvedValue({});

      const result = await service.createTransaction(createDto);

      expect(mockPrismaService.inventoryTransaction.create).toHaveBeenCalledWith({
        data: {
          itemId: BigInt(1),
          type: 'INBOUND',
          quantity: new Prisma.Decimal(50),
          unitPrice: new Prisma.Decimal(10.5),
          totalPrice: new Prisma.Decimal(525),
          referenceId: 'REF001',
          notes: 'Test inbound',
        },
      });
      expect(result).toEqual(transaction);
    });

    it('should throw BadRequestException for outbound transaction with insufficient stock', async () => {
      const createDto = {
        itemId: 1,
        type: 'OUTBOUND' as const,
        quantity: 150,
        unitPrice: 10.5,
        referenceId: 'REF001',
        notes: 'Test outbound',
      };

      const existingItem = {
        id: BigInt(1),
        quantity: new Prisma.Decimal(100),
        status: 'IN_STOCK',
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);

      await expect(service.createTransaction(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getLowStockItems', () => {
    it('should return low stock items', async () => {
      const threshold = 10;
      const lowStockItems = [
        {
          id: BigInt(1),
          name: 'Low Stock Item',
          quantity: new Prisma.Decimal(5),
        },
      ];

      mockPrismaService.inventoryItem.findMany.mockResolvedValue(lowStockItems);

      const result = await service.getLowStockItems(threshold);

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: {
          quantity: { lte: threshold },
          status: { not: 'OUT_OF_STOCK' },
        },
        include: {
          warehouse: true,
          category: true,
        },
        orderBy: { quantity: 'asc' },
      });
      expect(result).toEqual(lowStockItems);
    });
  });

  describe('getOutOfStockItems', () => {
    it('should return out of stock items', async () => {
      const outOfStockItems = [
        {
          id: BigInt(1),
          name: 'Out of Stock Item',
          quantity: new Prisma.Decimal(0),
          status: 'OUT_OF_STOCK',
        },
      ];

      mockPrismaService.inventoryItem.findMany.mockResolvedValue(outOfStockItems);

      const result = await service.getOutOfStockItems();

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: { status: 'OUT_OF_STOCK' },
        include: {
          warehouse: true,
          category: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(outOfStockItems);
    });
  });

  describe('recordSales', () => {
    it('should record sales successfully', async () => {
      const salesData = {
        itemId: 1,
        quantity: 10,
        unitPrice: 15.0,
        orderId: 'ORDER001',
        customerId: 1,
        notes: 'Test sale',
      };

      const existingItem = {
        id: BigInt(1),
        quantity: new Prisma.Decimal(100),
        status: 'IN_STOCK',
      };

      const salesRecord = {
        id: BigInt(1),
        ...salesData,
        itemId: BigInt(1),
        customerId: BigInt(1),
        quantity: new Prisma.Decimal(10),
        unitPrice: new Prisma.Decimal(15.0),
        totalPrice: new Prisma.Decimal(150),
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);
      mockPrismaService.salesRecord.create.mockResolvedValue(salesRecord);
      mockPrismaService.inventoryTransaction.create.mockResolvedValue({});
      mockPrismaService.inventoryItem.update.mockResolvedValue({});

      const result = await service.recordSales(salesData);

      expect(mockPrismaService.salesRecord.create).toHaveBeenCalledWith({
        data: {
          itemId: BigInt(1),
          quantity: new Prisma.Decimal(10),
          unitPrice: new Prisma.Decimal(15.0),
          totalPrice: new Prisma.Decimal(150),
          orderId: 'ORDER001',
          customerId: BigInt(1),
          notes: 'Test sale',
        },
      });
      expect(result).toEqual(salesRecord);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      const salesData = {
        itemId: 1,
        quantity: 150,
        unitPrice: 15.0,
        orderId: 'ORDER001',
        customerId: 1,
        notes: 'Test sale',
      };

      const existingItem = {
        id: BigInt(1),
        quantity: new Prisma.Decimal(100),
        status: 'IN_STOCK',
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(existingItem);

      await expect(service.recordSales(salesData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createWarehouse', () => {
    it('should create a warehouse successfully', async () => {
      const createDto = {
        name: 'Test Warehouse',
        code: 'TW001',
        type: 'MAIN' as const,
        address: 'Test Address',
      };

      const warehouse = {
        id: BigInt(1),
        ...createDto,
      };

      mockPrismaService.warehouse.create.mockResolvedValue(warehouse);

      const result = await service.createWarehouse(createDto);

      expect(mockPrismaService.warehouse.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(warehouse);
    });
  });

  describe('getInventoryStats', () => {
    it('should return inventory statistics', async () => {
      const mockStats = {
        _count: { id: 100 },
        _sum: { quantity: new Prisma.Decimal(5000) },
        _avg: { unitPrice: new Prisma.Decimal(25.5) },
      };

      const mockLowStock = [
        { id: BigInt(1), name: 'Low Stock Item', quantity: new Prisma.Decimal(5) },
      ];

      const mockOutOfStock = [
        { id: BigInt(2), name: 'Out of Stock Item', quantity: new Prisma.Decimal(0) },
      ];

      mockPrismaService.inventoryItem.aggregate.mockResolvedValue(mockStats);
      mockPrismaService.inventoryItem.findMany
        .mockResolvedValueOnce(mockLowStock)
        .mockResolvedValueOnce(mockOutOfStock);

      const result = await service.getInventoryStats();

      expect(result).toEqual({
        totalItems: 100,
        totalQuantity: 5000,
        averagePrice: 25.5,
        lowStockCount: 1,
        outOfStockCount: 1,
        lowStockItems: mockLowStock,
        outOfStockItems: mockOutOfStock,
      });
    });
  });
});