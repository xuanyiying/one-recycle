import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../src/order/order.service';
import { PrismaService } from '../src/prisma.service';
import { InventoryService } from '../src/inventory/inventory.service';
import {
  createTestRecycleOrder,
  createTestSaleOrder,
  createTestUpdateOrder,
  createTestOrder,
  createTestAssignment,
  mockPrismaService,
  mockInventoryService,
} from './test-utils';

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: any;
  let inventoryService: any;

  beforeEach(async () => {
    const mockPrisma = mockPrismaService();
    const mockInventory = mockInventoryService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: InventoryService,
          useValue: mockInventory,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    inventoryService = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRecycleOrder', () => {
    it('should create a recycle order successfully', async () => {
      const createOrderDto = createTestRecycleOrder();
      const expectedOrder = createTestOrder();

      prismaService.$transaction.mockResolvedValue(expectedOrder);

      const result = await service.createRecycleOrder(createOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const createOrderDto = createTestRecycleOrder();
      const error = new Error('Database error');

      prismaService.$transaction.mockRejectedValue(error);

      await expect(service.createRecycleOrder(createOrderDto)).rejects.toThrow('Database error');
    });
  });

  describe('createSaleOrder', () => {
    it('should create a sale order successfully', async () => {
      const createOrderDto = createTestSaleOrder();
      const expectedOrder = createTestOrder({ orderType: 'SALE' });

      inventoryService.checkStock.mockResolvedValue(true);
      prismaService.$transaction.mockResolvedValue(expectedOrder);

      const result = await service.createSaleOrder(createOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(inventoryService.checkStock).toHaveBeenCalled();
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw error when stock is insufficient', async () => {
      const createOrderDto = createTestSaleOrder();

      inventoryService.checkStock.mockResolvedValue(false);

      await expect(service.createSaleOrder(createOrderDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const expectedOrders = [createTestOrder(), createTestOrder({ id: BigInt(2) })];

      prismaService.order.findMany.mockResolvedValue(expectedOrders);

      const result = await service.findAll();

      expect(result).toEqual(expectedOrders);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        include: { items: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const orderId = 1;
      const expectedOrder = createTestOrder();

      prismaService.order.findUnique.mockResolvedValue(expectedOrder);

      const result = await service.findOne(orderId);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        include: { items: true },
      });
    });

    it('should return null when order not found', async () => {
      const orderId = 999;

      prismaService.order.findUnique.mockResolvedValue(null);

      const result = await service.findOne(orderId);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return orders for a specific user', async () => {
      const userId = 1;
      const expectedOrders = [createTestOrder()];

      prismaService.order.findMany.mockResolvedValue(expectedOrders);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(expectedOrders);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: BigInt(userId) },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const orderId = 1;
      const updateOrderDto = createTestUpdateOrder();
      const expectedOrder = createTestOrder({ status: 'IN_PROGRESS' });

      prismaService.order.update.mockResolvedValue(expectedOrder);

      const result = await service.update(orderId, updateOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        data: expect.objectContaining({
          status: 'IN_PROGRESS',
          remark: '更新测试订单',
        }),
        include: { items: true },
      });
    });

    it('should handle date fields correctly', async () => {
      const orderId = 1;
      const updateOrderDto = {
        expectPickupTime: '2024-01-15T10:00:00Z',
        expectDeliveryTime: null,
      };
      const expectedOrder = createTestOrder();

      prismaService.order.update.mockResolvedValue(expectedOrder);

      await service.update(orderId, updateOrderDto);

      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        data: expect.objectContaining({
          expectPickupTime: new Date('2024-01-15T10:00:00Z'),
          expectDeliveryTime: null,
        }),
        include: { items: true },
      });
    });
  });

  describe('cancel', () => {
    it('should cancel an order successfully', async () => {
      const orderId = 1;
      const expectedOrder = createTestOrder({ status: 'CANCELLED' });

      prismaService.order.update.mockResolvedValue(expectedOrder);

      const result = await service.cancel(orderId);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        data: { status: 'CANCELLED' },
      });
    });
  });

  describe('remove', () => {
    it('should delete an order successfully', async () => {
      const orderId = 1;
      const expectedOrder = createTestOrder();

      prismaService.order.delete.mockResolvedValue(expectedOrder);

      const result = await service.remove(orderId);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.order.delete).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
      });
    });
  });

  describe('assignToWorker', () => {
    it('should assign order to worker successfully', async () => {
      const orderId = 1;
      const courierId = 1;
      const expectedAssignment = createTestAssignment();
      const expectedOrder = createTestOrder({ status: 'ASSIGNED' });

      prismaService.assignment.create.mockResolvedValue(expectedAssignment);
      prismaService.order.update.mockResolvedValue(expectedOrder);

      const result = await service.assignToWorker(orderId, courierId);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.assignment.create).toHaveBeenCalledWith({
        data: {
          orderId: BigInt(orderId),
          courierId: BigInt(courierId),
          status: 'ASSIGNED',
        },
      });
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        data: { status: 'ASSIGNED' },
        include: { assignments: true },
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = 1;
      const status = 'IN_PROGRESS';
      const reason = 'Processing started';
      const expectedOrder = createTestOrder({ status: 'IN_PROGRESS' });

      prismaService.order.update.mockResolvedValue(expectedOrder);

      const result = await service.updateOrderStatus(orderId, status, reason);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        data: { status },
        include: { items: true },
      });
    });
  });

  describe('completeRecycleOrder', () => {
    it('should complete recycle order successfully', async () => {
      const orderId = 1;
      const actualWeights = [{ itemId: 1, actualWeight: '5.0' }];
      const expectedOrder = createTestOrder({ status: 'COMPLETED' });

      prismaService.$transaction.mockResolvedValue(expectedOrder);

      const result = await service.completeRecycleOrder(orderId, actualWeights);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('completeSaleOrder', () => {
    it('should complete sale order successfully', async () => {
      const orderId = 1;
      const expectedOrder = createTestOrder({ status: 'COMPLETED' });

      prismaService.order.update.mockResolvedValue(expectedOrder);

      const result = await service.completeSaleOrder(orderId);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        data: { status: 'COMPLETED' },
        include: { items: true },
      });
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const expectedStats = { total: 10, pending: 3, completed: 5, cancelled: 2 };

      prismaService.order.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3)  // pending
        .mockResolvedValueOnce(5)  // completed
        .mockResolvedValueOnce(2); // cancelled

      const result = await service.getOrderStats();

      expect(result).toEqual(expectedStats);
      expect(prismaService.order.count).toHaveBeenCalledTimes(4);
    });

    it('should return user-specific order statistics', async () => {
      const userId = 1;
      const expectedStats = { total: 5, pending: 1, completed: 3, cancelled: 1 };

      prismaService.order.count
        .mockResolvedValueOnce(5) // total
        .mockResolvedValueOnce(1) // pending
        .mockResolvedValueOnce(3) // completed
        .mockResolvedValueOnce(1); // cancelled

      const result = await service.getOrderStats(userId);

      expect(result).toEqual(expectedStats);
      expect(prismaService.order.count).toHaveBeenCalledWith({
        where: { userId: BigInt(userId) },
      });
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order successfully', async () => {
      const orderId = 1;
      const expectedOrder = createTestOrder({ status: 'CONFIRMED' });

      prismaService.order.update.mockResolvedValue(expectedOrder);

      const result = await service.confirmOrder(orderId);

      expect(result).toEqual(expectedOrder);
    });
  });

  describe('startProcessing', () => {
    it('should start processing order successfully', async () => {
      const orderId = 1;
      const existingOrder = createTestOrder();
      const updatedOrder = createTestOrder({ status: 'IN_PROGRESS' });

      prismaService.order.findUnique.mockResolvedValue(existingOrder);
      prismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.startProcessing(orderId);

      expect(result).toEqual(updatedOrder);
    });

    it('should throw error when order not found', async () => {
      const orderId = 999;

      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.startProcessing(orderId)).rejects.toThrow('订单不存在');
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details with relations', async () => {
      const orderId = 1;
      const expectedOrder = createTestOrder();

      prismaService.order.findUnique.mockResolvedValue(expectedOrder);

      const result = await service.getOrderDetails(orderId);

      expect(result).toEqual(expectedOrder);
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        include: {
          items: true,
          assignments: true,
        },
      });
    });
  });

  describe('batchUpdateStatus', () => {
    it('should batch update order status successfully', async () => {
      const orderIds = [1, 2, 3];
      const status = 'CONFIRMED';
      const updatedOrder = createTestOrder({ status: 'CONFIRMED' });

      prismaService.order.update.mockResolvedValue(updatedOrder);

      const result = await service.batchUpdateStatus(orderIds, status);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        orderId: 1,
        success: true,
        data: updatedOrder,
      });
      expect(prismaService.order.update).toHaveBeenCalledTimes(3);
    });

    it('should handle errors in batch update', async () => {
      const orderIds = [1, 2];
      const status = 'CONFIRMED';
      const updatedOrder = createTestOrder({ status: 'CONFIRMED' });
      const error = new Error('Update failed');

      prismaService.order.update
        .mockResolvedValueOnce(updatedOrder)
        .mockRejectedValueOnce(error);

      const result = await service.batchUpdateStatus(orderIds, status);

      expect(result).toHaveLength(2);
      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(false);
      expect(result[1].error).toBe('Update failed');
    });
  });

  describe('getOrderList', () => {
    it('should return paginated order list', async () => {
      const params = { page: 1, limit: 10 };
      const orders = [createTestOrder()];
      const total = 1;

      prismaService.order.findMany.mockResolvedValue(orders);
      prismaService.order.count.mockResolvedValue(total);

      const result = await service.getOrderList(params);

      expect(result.data).toEqual(orders);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter orders by status', async () => {
      const params = { status: 'PENDING' };
      const orders = [createTestOrder()];

      prismaService.order.findMany.mockResolvedValue(orders);
      prismaService.order.count.mockResolvedValue(1);

      await service.getOrderList(params);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('searchOrders', () => {
    it('should search orders by keyword', async () => {
      const keyword = 'ORD123';
      const orders = [createTestOrder()];

      prismaService.order.findMany.mockResolvedValue(orders);

      const result = await service.searchOrders(keyword);

      expect(result).toEqual(orders);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { orderNo: { contains: keyword } },
          ],
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});