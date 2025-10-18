import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { ItemType, ItemCondition, ProcessingStatus, TransactionType, ReservationStatus, CheckType, CheckResult, WarehouseType, WarehouseStatus, InventoryStatus } from '../entities/inventory.entity';
import { Decimal } from '@prisma/client/runtime/library';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    inventoryItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    inventoryTransaction: {
      create: jest.fn(),
    },
    inventoryReservation: {
      create: jest.fn(),
    },
    qualityCheck: {
      create: jest.fn(),
    },
    warehouse: {
      create: jest.fn(),
    },
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInventoryItem', () => {
    it('should create an inventory item', async () => {
      const createData = {
        warehouseId: BigInt(1),
        categoryId: BigInt(1),
        name: 'Test Item',
        description: 'Test Description',
        unit: 'pcs',
        quantity: 100,
        unitPrice: 10.5,
        location: 'A1',
        itemType: ItemType.RECYCLED,
        condition: ItemCondition.GOOD,
        processingStatus: ProcessingStatus.READY,
      };

      const expectedResult = {
        id: BigInt(1),
        ...createData,
        reservedQty: 0,
        availableQty: 100,
        totalPrice: 1050,
        status: 'IN_STOCK',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.inventoryItem.create.mockResolvedValue(expectedResult);

      const result = await service.createInventoryItem(createData);

      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createData,
          quantity: new Decimal(createData.quantity),
          unitPrice: new Decimal(createData.unitPrice),
          totalPrice: new Decimal(1050),
          reservedQty: new Decimal(0),
          availableQty: new Decimal(100),
          status: 'IN_STOCK',
        }),
        include: {
          warehouse: true,
          category: true,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getInventoryItems', () => {
    it('should return inventory items with filters', async () => {
      const filters = {
        status: InventoryStatus.IN_STOCK,
        itemType: ItemType.RECYCLED,
        categoryId: BigInt(1),
      };

      const expectedItems = [
        {
          id: BigInt(1),
          name: 'Test Item',
          status: 'IN_STOCK',
          itemType: ItemType.RECYCLED,
          categoryId: BigInt(1),
        },
      ];

      mockPrismaService.inventoryItem.findMany.mockResolvedValue(expectedItems);

      const result = await service.getInventoryItems(filters);

      expect(mockPrismaService.inventoryItem.findMany).toHaveBeenCalledWith({
        where: filters,
        include: {
          warehouse: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expectedItems);
    });
  });

  describe('getInventoryItemById', () => {
    it('should return an inventory item by id', async () => {
      const itemId = BigInt(1);
      const expectedItem = {
        id: itemId,
        name: 'Test Item',
        status: 'IN_STOCK',
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(expectedItem);

      const result = await service.getInventoryItemById(itemId);

      expect(mockPrismaService.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: itemId },
        include: {
          warehouse: true,
          category: true,
        },
      });
      expect(result).toEqual(expectedItem);
    });

    it('should return null if item not found', async () => {
      const itemId = BigInt(999);

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      const result = await service.getInventoryItemById(itemId);

      expect(result).toBeNull();
    });
  });

  describe('updateInventoryItem', () => {
    it('should update an inventory item', async () => {
      const itemId = BigInt(1);
      const updateData = {
        name: 'Updated Item',
        quantity: 150,
      };

      const updatedItem = {
        id: itemId,
        ...updateData,
        totalPrice: 1575,
        availableQty: 150,
      };

      mockPrismaService.inventoryItem.update.mockResolvedValue(updatedItem);

      const result = await service.updateInventoryItem(itemId, updateData);

      expect(mockPrismaService.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: itemId },
        data: expect.objectContaining({
          ...updateData,
          quantity: new Decimal(updateData.quantity),
          totalPrice: expect.any(Decimal),
          availableQty: expect.any(Decimal),
          updatedAt: expect.any(Date),
        }),
        include: {
          warehouse: true,
          category: true,
        },
      });
      expect(result).toEqual(updatedItem);
    });
  });

  describe('deleteInventoryItem', () => {
    it('should delete an inventory item', async () => {
      const itemId = BigInt(1);

      mockPrismaService.inventoryItem.delete.mockResolvedValue({ id: itemId });

      await service.deleteInventoryItem(itemId);

      expect(mockPrismaService.inventoryItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });
    });
  });

  describe('getInventoryStats', () => {
    it('should return inventory statistics', async () => {
      const mockStats = {
        _count: { id: 100 },
        _sum: { totalPrice: new Decimal(50000) },
      };

      const mockCounts = {
        lowStock: 5,
        outOfStock: 2,
        inStock: 93,
        expiringSoon: 3,
      };

      mockPrismaService.inventoryItem.aggregate.mockResolvedValue(mockStats);
      mockPrismaService.inventoryItem.count
        .mockResolvedValueOnce(mockCounts.lowStock)
        .mockResolvedValueOnce(mockCounts.outOfStock)
        .mockResolvedValueOnce(mockCounts.inStock)
        .mockResolvedValueOnce(mockCounts.expiringSoon);

      const result = await service.getInventoryStats();

      expect(result).toEqual({
        totalItems: 100,
        totalValue: 50000,
        lowStockItems: 5,
        outOfStockItems: 2,
        inStockItems: 93,
        expiringSoonItems: 3,
        averageValue: 500,
      });
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const createData = {
        itemId: BigInt(1),
        type: TransactionType.INBOUND,
        quantity: 50,
        unitPrice: 10.5,
        notes: 'Test transaction',
      };

      const expectedTransaction = {
        id: BigInt(1),
        ...createData,
        totalPrice: 525,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.inventoryTransaction.create.mockResolvedValue(expectedTransaction);

      const result = await service.createTransaction(createData);

      expect(mockPrismaService.inventoryTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createData,
          quantity: new Decimal(createData.quantity),
          unitPrice: new Decimal(createData.unitPrice),
          totalPrice: new Decimal(525),
        }),
        include: {
          item: true,
        },
      });
      expect(result).toEqual(expectedTransaction);
    });
  });

  describe('createReservation', () => {
    it('should create a reservation', async () => {
      const createData = {
        itemId: BigInt(1),
        orderId: 'ORDER-123',
        quantity: 10,
        status: ReservationStatus.PENDING,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };

      const expectedReservation = {
        id: BigInt(1),
        ...createData,
        reservedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.inventoryReservation.create.mockResolvedValue(expectedReservation);

      const result = await service.createReservation(createData);

      expect(mockPrismaService.inventoryReservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...createData,
          quantity: new Decimal(createData.quantity),
          reservedAt: expect.any(Date),
        }),
        include: {
          item: true,
        },
      });
      expect(result).toEqual(expectedReservation);
    });
  });

  describe('createQualityCheck', () => {
    it('should create a quality check', async () => {
      const createData = {
        itemId: BigInt(1),
        checkerId: BigInt(1),
        checkType: CheckType.INITIAL,
        result: CheckResult.PASSED,
        score: 85,
        notes: 'Good condition',
        images: ['image1.jpg'],
        checkedAt: new Date(),
      };

      const expectedCheck = {
        id: BigInt(1),
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.qualityCheck.create.mockResolvedValue(expectedCheck);

      const result = await service.createQualityCheck(createData);

      expect(mockPrismaService.qualityCheck.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          item: true,
        },
      });
      expect(result).toEqual(expectedCheck);
    });
  });

  describe('createWarehouse', () => {
    it('should create a warehouse', async () => {
      const createData = {
        name: 'Main Warehouse',
        code: 'WH001',
        type: WarehouseType.MAIN,
        address: '123 Main St',
        status: WarehouseStatus.ACTIVE,
      };

      const expectedWarehouse = {
        id: BigInt(1),
        ...createData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.warehouse.create.mockResolvedValue(expectedWarehouse);

      const result = await service.createWarehouse(createData);

      expect(mockPrismaService.warehouse.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(expectedWarehouse);
    });
  });
});