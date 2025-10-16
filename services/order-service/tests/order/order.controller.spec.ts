import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import {
  createTestRecycleOrder,
  createTestSaleOrder,
  createTestUpdateOrder,
  createTestOrder,
} from '../../tests/test-utils';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const mockOrderService = {
      createRecycleOrder: jest.fn(),
      createSaleOrder: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      remove: jest.fn(),
      assignToWorker: jest.fn(),
      updateOrderStatus: jest.fn(),
      completeRecycleOrder: jest.fn(),
      completeSaleOrder: jest.fn(),
      getOrderStats: jest.fn(),
      confirmOrder: jest.fn(),
      startProcessing: jest.fn(),
      getOrderDetails: jest.fn(),
      batchUpdateStatus: jest.fn(),
      getOrderList: jest.fn(),
      searchOrders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRecycleOrder', () => {
    it('should create a recycle order', async () => {
      const createOrderDto = createTestRecycleOrder();
      const expectedOrder = createTestOrder();

      orderService.createRecycleOrder.mockResolvedValue(expectedOrder);

      const result = await controller.createRecycleOrder(createOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(orderService.createRecycleOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('createSaleOrder', () => {
    it('should create a sale order', async () => {
      const createOrderDto = createTestSaleOrder();
      const expectedOrder = createTestOrder();

      orderService.createSaleOrder.mockResolvedValue(expectedOrder);

      const result = await controller.createSaleOrder(createOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(orderService.createSaleOrder).toHaveBeenCalledWith(createOrderDto);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const expectedOrders = [createTestOrder()];

      orderService.findAll.mockResolvedValue(expectedOrders);

      const result = await controller.findAll();

      expect(result).toEqual(expectedOrders);
      expect(orderService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const orderId = '1';
      const expectedOrder = createTestOrder();

      orderService.findOne.mockResolvedValue(expectedOrder);

      const result = await controller.findOne(orderId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByUserId', () => {
    it('should return orders by user id', async () => {
      const userId = '1';
      const expectedOrders = [createTestOrder()];

      orderService.findByUserId.mockResolvedValue(expectedOrders);

      const result = await controller.findByUserId(userId);

      expect(result).toEqual(expectedOrders);
      expect(orderService.findByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const orderId = '1';
      const updateOrderDto = createTestUpdateOrder();
      const expectedOrder = createTestOrder({ status: 'IN_PROGRESS' });

      orderService.update.mockResolvedValue(expectedOrder);

      const result = await controller.update(orderId, updateOrderDto);

      expect(result).toEqual(expectedOrder);
      expect(orderService.update).toHaveBeenCalledWith(1, updateOrderDto);
    });
  });

  describe('cancel', () => {
    it('should cancel an order', async () => {
      const orderId = '1';
      const expectedOrder = createTestOrder({ status: 'CANCELLED' });

      orderService.cancel.mockResolvedValue(expectedOrder);

      const result = await controller.cancel(orderId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.cancel).toHaveBeenCalledWith(1);
    });
  });

  describe('remove', () => {
    it('should delete an order', async () => {
      const orderId = '1';
      const expectedOrder = createTestOrder();

      orderService.remove.mockResolvedValue(expectedOrder);

      const result = await controller.remove(orderId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('assignToWorker', () => {
    it('should assign order to worker', async () => {
      const orderId = '1';
      const courierId = '2';
      const expectedOrder = createTestOrder({ status: 'ASSIGNED' });

      orderService.assignToWorker.mockResolvedValue(expectedOrder);

      const result = await controller.assignToWorker(orderId, courierId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.assignToWorker).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('completeRecycleOrder', () => {
    it('should complete recycle order', async () => {
      const orderId = '1';
      const actualWeights = [{ itemId: 1, actualWeight: '5.0' }];
      const expectedOrder = createTestOrder({ status: 'COMPLETED' });

      orderService.completeRecycleOrder.mockResolvedValue(expectedOrder);

      const result = await controller.completeRecycleOrder(orderId, actualWeights);

      expect(result).toEqual(expectedOrder);
      expect(orderService.completeRecycleOrder).toHaveBeenCalledWith(1, actualWeights);
    });
  });

  describe('completeSaleOrder', () => {
    it('should complete sale order', async () => {
      const orderId = '1';
      const expectedOrder = createTestOrder({ status: 'COMPLETED' });

      orderService.completeSaleOrder.mockResolvedValue(expectedOrder);

      const result = await controller.completeSaleOrder(orderId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.completeSaleOrder).toHaveBeenCalledWith(1);
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const expectedStats = { total: 10, pending: 3, completed: 5, cancelled: 2 };

      orderService.getOrderStats.mockResolvedValue(expectedStats);

      const result = await controller.getOrderStats();

      expect(result).toEqual(expectedStats);
      expect(orderService.getOrderStats).toHaveBeenCalled();
    });

    it('should return user-specific order statistics', async () => {
      const userId = '1';
      const expectedStats = { total: 5, pending: 1, completed: 3, cancelled: 1 };

      orderService.getOrderStats.mockResolvedValue(expectedStats);

      const result = await controller.getUserOrderStats(userId);

      expect(result).toEqual(expectedStats);
      expect(orderService.getOrderStats).toHaveBeenCalledWith(1);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const orderId = '1';
      const body = { status: 'IN_PROGRESS', reason: 'Processing started' };
      const expectedOrder = createTestOrder({ status: 'IN_PROGRESS' });

      orderService.updateOrderStatus.mockResolvedValue(expectedOrder);

      const result = await controller.updateOrderStatus(orderId, body);

      expect(result).toEqual(expectedOrder);
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, 'IN_PROGRESS', 'Processing started');
    });
  });

  describe('confirmOrder', () => {
    it('should confirm order', async () => {
      const orderId = '1';
      const expectedOrder = createTestOrder({ status: 'CONFIRMED' });

      orderService.confirmOrder.mockResolvedValue(expectedOrder);

      const result = await controller.confirmOrder(orderId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.confirmOrder).toHaveBeenCalledWith(1);
    });
  });

  describe('startProcessing', () => {
    it('should start processing order', async () => {
      const orderId = '1';
      const expectedOrder = createTestOrder({ status: 'IN_PROGRESS' });

      orderService.startProcessing.mockResolvedValue(expectedOrder);

      const result = await controller.startProcessing(orderId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.startProcessing).toHaveBeenCalledWith(1);
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details', async () => {
      const orderId = '1';
      const expectedOrder = createTestOrder();

      orderService.getOrderDetails.mockResolvedValue(expectedOrder);

      const result = await controller.getOrderDetails(orderId);

      expect(result).toEqual(expectedOrder);
      expect(orderService.getOrderDetails).toHaveBeenCalledWith(1);
    });
  });

  describe('batchUpdateStatus', () => {
    it('should batch update order status', async () => {
      const body = { orderIds: [1, 2, 3], status: 'CONFIRMED' };
      const expectedResults = [
        { orderId: 1, success: true, data: createTestOrder() },
        { orderId: 2, success: true, data: createTestOrder() },
        { orderId: 3, success: true, data: createTestOrder() },
      ];

      orderService.batchUpdateStatus.mockResolvedValue(expectedResults);

      const result = await controller.batchUpdateStatus(body);

      expect(result).toEqual(expectedResults);
      expect(orderService.batchUpdateStatus).toHaveBeenCalledWith([1, 2, 3], 'CONFIRMED');
    });
  });

  describe('getOrderList', () => {
    it('should return paginated order list', async () => {
      const query = { page: '1', limit: '10', status: 'PENDING' };
      const expectedResult = {
        data: [createTestOrder()],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      orderService.getOrderList.mockResolvedValue(expectedResult);

      const result = await controller.getOrderList(query);

      expect(result).toEqual(expectedResult);
      expect(orderService.getOrderList).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: 'PENDING',
      });
    });

    it('should handle query parameters conversion', async () => {
      const query = {
        page: '2',
        limit: '20',
        userId: '5',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      orderService.getOrderList.mockResolvedValue({
        data: [],
        pagination: { page: 2, limit: 20, total: 0, totalPages: 0 },
      });

      await controller.getOrderList(query);

      expect(orderService.getOrderList).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        userId: 5,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });
  });

  describe('searchOrders', () => {
    it('should search orders by keyword', async () => {
      const query = { keyword: 'ORD123' };
      const expectedOrders = [createTestOrder()];

      orderService.searchOrders.mockResolvedValue(expectedOrders);

      const result = await controller.searchOrders(query);

      expect(result).toEqual(expectedOrders);
      expect(orderService.searchOrders).toHaveBeenCalledWith('ORD123');
    });
  });
});