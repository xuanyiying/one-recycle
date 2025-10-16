import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: InventoryService;

  const mockInventoryService = {
    createInventoryItem: jest.fn(),
    findInventoryItems: jest.fn(),
    findInventoryItemById: jest.fn(),
    updateInventoryItem: jest.fn(),
    removeInventoryItem: jest.fn(),
    createTransaction: jest.fn(),
    getInventoryTransactions: jest.fn(),
    getLowStockItems: jest.fn(),
    getOutOfStockItems: jest.fn(),
    recordSales: jest.fn(),
    getSalesRecords: jest.fn(),
    createQualityCheck: jest.fn(),
    getQualityChecks: jest.fn(),
    createReservation: jest.fn(),
    confirmReservation: jest.fn(),
    cancelReservation: jest.fn(),
    getInventoryStats: jest.fn(),
    batchUpdateStatus: jest.fn(),
    batchDelete: jest.fn(),
    createWarehouse: jest.fn(),
    findWarehouses: jest.fn(),
    updateWarehouse: jest.fn(),
    deleteWarehouse: jest.fn(),
    stockIn: jest.fn(),
    stockOut: jest.fn(),
    reserveStock: jest.fn(),
    releaseReservedStock: jest.fn(),
    checkStockAlert: jest.fn(),
    transferStock: jest.fn(),
    adjustStock: jest.fn(),
    stockTaking: jest.fn(),
    getInventoryReport: jest.fn(),
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

  describe('createInventoryItem', () => {
    it('should create an inventory item', async () => {
      const createDto: CreateInventoryItemDto = {
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
        id: 1,
        ...createDto,
        totalPrice: 1050,
        status: 'IN_STOCK',
      };

      mockInventoryService.createInventoryItem.mockResolvedValue(expectedResult);

      const result = await controller.createInventoryItem(createDto);

      expect(service.createInventoryItem).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findInventoryItems', () => {
    it('should return inventory items with query parameters', async () => {
      const query = {
        page: 1,
        limit: 20,
        warehouseId: '1',
        categoryId: '1',
        status: 'IN_STOCK',
      };

      const expectedResult = {
        items: [
          {
            id: 1,
            name: 'Test Item',
            quantity: 100,
            status: 'IN_STOCK',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockInventoryService.findInventoryItems.mockResolvedValue(expectedResult);

      const result = await controller.findInventoryItems(query);

      expect(service.findInventoryItems).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findInventoryItemById', () => {
    it('should return an inventory item by id', async () => {
      const itemId = '1';
      const expectedResult = {
        id: 1,
        name: 'Test Item',
        quantity: 100,
        status: 'IN_STOCK',
      };

      mockInventoryService.findInventoryItemById.mockResolvedValue(expectedResult);

      const result = await controller.findInventoryItemById(itemId);

      expect(service.findInventoryItemById).toHaveBeenCalledWith(itemId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when item not found', async () => {
      const itemId = '999';
      mockInventoryService.findInventoryItemById.mockRejectedValue(
        new NotFoundException('Item not found'),
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
        id: 1,
        ...updateDto,
        totalPrice: 1800,
        status: 'IN_STOCK',
      };

      mockInventoryService.updateInventoryItem.mockResolvedValue(expectedResult);

      const result = await controller.updateInventoryItem(itemId, updateDto);

      expect(service.updateInventoryItem).toHaveBeenCalledWith(itemId, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeInventoryItem', () => {
    it('should remove an inventory item', async () => {
      const itemId = '1';
      const expectedResult = { message: 'Item deleted successfully' };

      mockInventoryService.removeInventoryItem.mockResolvedValue(expectedResult);

      const result = await controller.removeInventoryItem(itemId);

      expect(service.removeInventoryItem).toHaveBeenCalledWith(itemId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction', async () => {
      const createDto: CreateTransactionDto = {
        itemId: 1,
        type: 'INBOUND',
        quantity: 50,
        unitPrice: 10.5,
        referenceId: 'REF001',
        notes: 'Test transaction',
      };

      const expectedResult = {
        id: 1,
        ...createDto,
        totalPrice: 525,
      };

      mockInventoryService.createTransaction.mockResolvedValue(expectedResult);

      const result = await controller.createTransaction(createDto);

      expect(service.createTransaction).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getInventoryTransactions', () => {
    it('should return inventory transactions for an item', async () => {
      const itemId = '1';
      const expectedResult = [
        {
          id: 1,
          itemId: 1,
          type: 'INBOUND',
          quantity: 50,
          unitPrice: 10.5,
          totalPrice: 525,
        },
      ];

      mockInventoryService.getInventoryTransactions.mockResolvedValue(expectedResult);

      const result = await controller.getInventoryTransactions(itemId);

      expect(service.getInventoryTransactions).toHaveBeenCalledWith(itemId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getLowStockItems', () => {
    it('should return low stock items with default threshold', async () => {
      const expectedResult = [
        {
          id: 1,
          name: 'Low Stock Item',
          quantity: 5,
          status: 'LOW_STOCK',
        },
      ];

      mockInventoryService.getLowStockItems.mockResolvedValue(expectedResult);

      const result = await controller.getLowStockItems();

      expect(service.getLowStockItems).toHaveBeenCalledWith(10);
      expect(result).toEqual(expectedResult);
    });

    it('should return low stock items with custom threshold', async () => {
      const threshold = '20';
      const expectedResult = [
        {
          id: 1,
          name: 'Low Stock Item',
          quantity: 15,
          status: 'LOW_STOCK',
        },
      ];

      mockInventoryService.getLowStockItems.mockResolvedValue(expectedResult);

      const result = await controller.getLowStockItems(threshold);

      expect(service.getLowStockItems).toHaveBeenCalledWith(20);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getOutOfStockItems', () => {
    it('should return out of stock items', async () => {
      const expectedResult = [
        {
          id: 1,
          name: 'Out of Stock Item',
          quantity: 0,
          status: 'OUT_OF_STOCK',
        },
      ];

      mockInventoryService.getOutOfStockItems.mockResolvedValue(expectedResult);

      const result = await controller.getOutOfStockItems();

      expect(service.getOutOfStockItems).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('recordSales', () => {
    it('should record sales', async () => {
      const salesData = {
        itemId: '1',
        quantity: 10,
        unitPrice: 15.0,
        orderId: 'ORDER001',
        customerId: '1',
        notes: 'Test sale',
      };

      const expectedResult = {
        id: 1,
        itemId: 1,
        quantity: 10,
        unitPrice: 15.0,
        totalPrice: 150,
        orderId: 'ORDER001',
        customerId: 1,
        notes: 'Test sale',
      };

      mockInventoryService.recordSales.mockResolvedValue(expectedResult);

      const result = await controller.recordSales(salesData);

      expect(service.recordSales).toHaveBeenCalledWith({
        ...salesData,
        itemId: 1,
        customerId: 1,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSalesRecords', () => {
    it('should return all sales records', async () => {
      const expectedResult = [
        {
          id: 1,
          itemId: 1,
          quantity: 10,
          unitPrice: 15.0,
          totalPrice: 150,
          orderId: 'ORDER001',
        },
      ];

      mockInventoryService.getSalesRecords.mockResolvedValue(expectedResult);

      const result = await controller.getSalesRecords();

      expect(service.getSalesRecords).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getSalesRecordsByItem', () => {
    it('should return sales records for a specific item', async () => {
      const itemId = '1';
      const expectedResult = [
        {
          id: 1,
          itemId: 1,
          quantity: 10,
          unitPrice: 15.0,
          totalPrice: 150,
          orderId: 'ORDER001',
        },
      ];

      mockInventoryService.getSalesRecords.mockResolvedValue(expectedResult);

      const result = await controller.getSalesRecordsByItem(itemId);

      expect(service.getSalesRecords).toHaveBeenCalledWith(itemId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getInventoryStats', () => {
    it('should return inventory statistics', async () => {
      const expectedResult = {
        totalItems: 100,
        totalQuantity: 5000,
        averagePrice: 25.5,
        lowStockCount: 5,
        outOfStockCount: 2,
      };

      mockInventoryService.getInventoryStats.mockResolvedValue(expectedResult);

      const result = await controller.getInventoryStats();

      expect(service.getInventoryStats).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('batchUpdateStatus', () => {
    it('should batch update item status', async () => {
      const data = {
        itemIds: ['1', '2', '3'],
        status: 'INACTIVE',
      };

      const expectedResult = {
        updatedCount: 3,
        message: 'Status updated successfully',
      };

      mockInventoryService.batchUpdateStatus.mockResolvedValue(expectedResult);

      const result = await controller.batchUpdateStatus(data);

      expect(service.batchUpdateStatus).toHaveBeenCalledWith(data.itemIds, data.status);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('stockIn', () => {
    it('should perform stock in operation', async () => {
      const itemId = '1';
      const stockInDto = {
        quantity: 100,
        unitPrice: 10.5,
        referenceId: 'REF001',
        notes: 'Stock in',
      };

      const expectedResult = {
        id: 1,
        quantity: 200,
        status: 'IN_STOCK',
      };

      mockInventoryService.stockIn.mockResolvedValue(expectedResult);

      const result = await controller.stockIn(itemId, stockInDto);

      expect(service.stockIn).toHaveBeenCalledWith({
        itemId: BigInt(1),
        ...stockInDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('stockOut', () => {
    it('should perform stock out operation', async () => {
      const itemId = '1';
      const stockOutDto = {
        quantity: 50,
        referenceId: 'REF002',
        notes: 'Stock out',
      };

      const expectedResult = {
        id: 1,
        quantity: 50,
        status: 'IN_STOCK',
      };

      mockInventoryService.stockOut.mockResolvedValue(expectedResult);

      const result = await controller.stockOut(itemId, stockOutDto);

      expect(service.stockOut).toHaveBeenCalledWith({
        itemId: BigInt(1),
        ...stockOutDto,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('transferStock', () => {
    it('should transfer stock between warehouses', async () => {
      const transferData = {
        itemId: '1',
        fromWarehouseId: '1',
        toWarehouseId: '2',
        quantity: 50,
        operatorId: '1',
        operatorName: 'Test Operator',
        notes: 'Transfer test',
      };

      const expectedResult = {
        sourceItem: { id: 1, quantity: 50 },
        targetItem: { id: 2, quantity: 50 },
      };

      mockInventoryService.transferStock.mockResolvedValue(expectedResult);

      const result = await controller.transferStock(transferData);

      expect(service.transferStock).toHaveBeenCalledWith({
        itemId: BigInt(1),
        fromWarehouseId: BigInt(1),
        toWarehouseId: BigInt(2),
        quantity: expect.any(Object), // Decimal object
        operatorId: BigInt(1),
        operatorName: 'Test Operator',
        notes: 'Transfer test',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getInventoryReport', () => {
    it('should return inventory report', async () => {
      const query = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        warehouseId: '1',
        categoryId: '1',
      };

      const expectedResult = {
        overview: {
          totalItems: 100,
          totalQuantity: 5000,
          averagePrice: 25.5,
        },
        transactions: [],
        lowStockItems: [],
        outOfStockItems: [],
        generatedAt: new Date(),
      };

      mockInventoryService.getInventoryReport.mockResolvedValue(expectedResult);

      const result = await controller.getInventoryReport(query);

      expect(service.getInventoryReport).toHaveBeenCalledWith({
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        warehouseId: BigInt(1),
        categoryId: BigInt(1),
      });
      expect(result).toEqual(expectedResult);
    });
  });
});