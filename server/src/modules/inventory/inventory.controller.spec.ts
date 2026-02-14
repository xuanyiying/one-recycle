import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './services/inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { NotFoundException } from '@nestjs/common';
import {
  InventoryStatus,
  ItemCondition,
  ItemType,
  ProcessingStatus,
  ReservationStatus,
  InventoryTxnType,
  CheckType,
  CheckResult,
} from './entities/inventory.entity';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    createInventoryItem: jest.fn(),
    getInventoryItems: jest.fn(),
    getInventoryItemById: jest.fn(),
    updateInventoryItem: jest.fn(),
    deleteInventoryItem: jest.fn(),
    createTransaction: jest.fn(),
    createQualityCheck: jest.fn(),
    createReservation: jest.fn(),
    getInventoryStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInventoryItem', () => {
    it('should create a new inventory item', async () => {
      const createDto: CreateInventoryItemDto = {
        warehouseId: BigInt(1),
        categoryId: BigInt(1),
        name: 'Test Item',
        description: 'Test Description',
        unit: 'kg',
        quantity: 100,
        unitPrice: 10.5,
        location: 'A1-B2',
        itemType: ItemType.RECYCLED,
        condition: ItemCondition.GOOD,
        sourceOrderId: 'ORDER-001',
        processingStatus: ProcessingStatus.READY_FOR_SALE,
      };

      const expectedResult = {
        id: BigInt(1),
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInventoryService.createInventoryItem.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.createInventoryItem(createDto);

      expect(service.createInventoryItem).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllInventoryItems', () => {
    it('should return all inventory items with filters', async () => {
      const filters = {
        status: InventoryStatus.IN_STOCK,
        itemType: ItemType.RECYCLED,
        condition: ItemCondition.GOOD,
        location: 'A1',
        categoryId: BigInt(1),
      };

      const expectedResult = [
        {
          id: BigInt(1),
          name: 'Test Item',
          status: InventoryStatus.IN_STOCK,
          quantity: 100,
        },
      ];

      mockInventoryService.getInventoryItems.mockResolvedValue(expectedResult);

      const result = await controller.findAllInventoryItems(
        InventoryStatus.IN_STOCK,
        ItemType.RECYCLED,
        ItemCondition.GOOD,
        'A1',
        '1',
      );

      expect(service.getInventoryItems).toHaveBeenCalledWith(
        filters,
        undefined,
        { page: 1, pageSize: 10 },
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findInventoryItemById', () => {
    it('should return an inventory item by id', async () => {
      const itemId = '1';
      const expectedResult = {
        id: BigInt(1),
        name: 'Test Item',
        status: InventoryStatus.IN_STOCK,
        quantity: 100,
      };

      mockInventoryService.getInventoryItemById.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.findInventoryItemById(itemId);

      expect(service.getInventoryItemById).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when item not found', async () => {
      const itemId = '999';

      mockInventoryService.getInventoryItemById.mockRejectedValue(
        new NotFoundException('Inventory item not found'),
      );

      await expect(controller.findInventoryItemById(itemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateInventoryItem', () => {
    it('should update an inventory item', async () => {
      const itemId = '1';
      const updateDto: UpdateInventoryItemDto = {
        name: 'Updated Item',
        quantity: 150,
        unitPrice: 12.0,
      };

      const expectedResult = {
        id: BigInt(1),
        name: 'Updated Item',
        quantity: 150,
        unitPrice: 12.0,
        updatedAt: new Date(),
      };

      mockInventoryService.updateInventoryItem.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.updateInventoryItem(itemId, updateDto);

      expect(service.updateInventoryItem).toHaveBeenCalledWith(
        BigInt(1),
        updateDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeInventoryItem', () => {
    it('should delete an inventory item', async () => {
      const itemId = '1';
      const expectedResult = { message: 'Inventory item deleted successfully' };

      mockInventoryService.deleteInventoryItem.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.removeInventoryItem(itemId);

      expect(service.deleteInventoryItem).toHaveBeenCalledWith(BigInt(1));
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const createDto: CreateTransactionDto = {
        itemId: BigInt(1),
        type: InventoryTxnType.IN,
        quantity: 50,
        unitPrice: 10.0,
        referenceId: 'REF-001',
        notes: 'Test transaction',
      };

      const expectedResult = {
        id: BigInt(1),
        ...createDto,
        createdAt: new Date(),
      };

      mockInventoryService.createTransaction.mockResolvedValue(expectedResult);

      const result = await controller.createTransaction(createDto);

      expect(service.createTransaction).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createQualityCheck', () => {
    it('should create a new quality check', async () => {
      const createDto: CreateQualityCheckDto = {
        itemId: BigInt(1),
        checkType: CheckType.ROUTINE,
        result: CheckResult.PASS,
        checkerId: BigInt(1),
        checkedAt: new Date(),
        notes: 'Quality check passed',
      };

      const expectedResult = {
        id: BigInt(1),
        ...createDto,
        createdAt: new Date(),
      };

      mockInventoryService.createQualityCheck.mockResolvedValue(expectedResult);

      const result = await controller.createQualityCheck(createDto);

      expect(service.createQualityCheck).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createReservation', () => {
    it('should create a new reservation', async () => {
      const createDto: CreateReservationDto = {
        itemId: BigInt(1),
        quantity: 10,
        orderId: 'ORDER-001',
        status: ReservationStatus.PENDING,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        notes: 'Test reservation',
      };

      const expectedResult = {
        id: BigInt(1),
        ...createDto,
        createdAt: new Date(),
      };

      mockInventoryService.createReservation.mockResolvedValue(expectedResult);

      const result = await controller.createReservation(createDto);

      expect(service.createReservation).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getInventoryStats', () => {
    it('should return inventory statistics', async () => {
      const expectedResult = {
        totalItems: 100,
        totalQuantity: 5000,
        averagePrice: 25.5,
        lowStockItems: 5,
        outOfStockItems: 2,
        byStatus: {
          IN_STOCK: 80,
          OUT_OF_STOCK: 2,
          RESERVED: 15,
          DAMAGED: 3,
        },
        byCategory: {
          Electronics: 30,
          Clothing: 25,
          Books: 45,
        },
      };

      mockInventoryService.getInventoryStats.mockResolvedValue(expectedResult);

      const result = await controller.getInventoryStats();

      expect(service.getInventoryStats).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});
