import { Test, TestingModule } from '@nestjs/testing';
import { OrderGrpcController } from './order.grpc.controller';
import { OrderService } from './order.service';
import {
  GetOrderRequest,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  GetUserStatisticsRequest,
} from '../proto/order.pb';
import { createTestOrder } from '../../tests/test-utils';

describe('OrderGrpcController', () => {
  let controller: OrderGrpcController;
  let orderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    const mockOrderService = {
      findOne: jest.fn(),
      createRecycleOrder: jest.fn(),
      updateOrderStatus: jest.fn(),
      cancel: jest.fn(),
      getOrderStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderGrpcController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderGrpcController>(OrderGrpcController);
    orderService = module.get(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOrder', () => {
    it('should get order successfully', async () => {
      const request: GetOrderRequest = { id: 1 };
      const order = createTestOrder();

      orderService.findOne.mockResolvedValue(order);

      const result = await controller.getOrder(request);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.orderNo).toBe('ORD1234567890123');
      expect(result.status).toBe('PENDING');
      expect(orderService.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle order not found', async () => {
      const request: GetOrderRequest = { id: 999 };

      orderService.findOne.mockResolvedValue(null);

      await expect(controller.getOrder(request)).rejects.toThrow();
    });

    it('should handle service errors', async () => {
      const request: GetOrderRequest = { id: 1 };
      const error = new Error('Database error');

      orderService.findOne.mockRejectedValue(error);

      await expect(controller.getOrder(request)).rejects.toThrow();
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const request: CreateOrderRequest = {
        userId: 1,
        addressId: 1,
        expectPickupTime: '2024-01-15T10:00:00Z',
        channel: 'APP',
        remark: '测试订单',
        items: [
          {
            categoryId: 1,
            estimatedWeight: '5.5',
            unitPrice: '10.00',
          },
        ],
      };
      const order = createTestOrder();

      orderService.createRecycleOrder.mockResolvedValue(order);

      const result = await controller.createOrder(request);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.orderNo).toBe('ORD1234567890123');
      expect(orderService.createRecycleOrder).toHaveBeenCalledWith({
        userId: 1,
        addressId: 1,
        expectPickupTime: new Date('2024-01-15T10:00:00Z'),
        channel: 'APP',
        remark: '测试订单',
        items: [
          {
            categoryId: 1,
            estimatedWeight: '5.5',
            unitPrice: '10.00',
          },
        ],
      });
    });

    it('should handle creation errors', async () => {
      const request: CreateOrderRequest = {
        userId: 1,
        addressId: 1,
        expectPickupTime: '2024-01-15T10:00:00Z',
        channel: 'APP',
        remark: '测试订单',
        items: [],
      };
      const error = new Error('Validation error');

      orderService.createRecycleOrder.mockRejectedValue(error);

      await expect(controller.createOrder(request)).rejects.toThrow();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const request: UpdateOrderStatusRequest = {
        id: 1,
        status: 'IN_PROGRESS',
      };
      const order = createTestOrder({ status: 'IN_PROGRESS' });

      orderService.updateOrderStatus.mockResolvedValue(order);

      const result = await controller.updateOrderStatus(request);

      expect(result).toBeDefined();
      expect(result.status).toBe('IN_PROGRESS');
      expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, 'IN_PROGRESS');
    });

    it('should handle update errors', async () => {
      const request: UpdateOrderStatusRequest = {
        id: 999,
        status: 'IN_PROGRESS',
      };
      const error = new Error('Order not found');

      orderService.updateOrderStatus.mockRejectedValue(error);

      await expect(controller.updateOrderStatus(request)).rejects.toThrow();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const request: CancelOrderRequest = {
        id: 1,
        reason: '用户取消',
      };
      const order = createTestOrder({ status: 'CANCELLED' });

      orderService.cancel.mockResolvedValue(order);

      const result = await controller.cancelOrder(request);

      expect(result).toBeDefined();
      expect(result.status).toBe('CANCELLED');
      expect(orderService.cancel).toHaveBeenCalledWith(1);
    });

    it('should handle cancellation errors', async () => {
      const request: CancelOrderRequest = {
        id: 999,
        reason: '用户取消',
      };
      const error = new Error('Order not found');

      orderService.cancel.mockRejectedValue(error);

      await expect(controller.cancelOrder(request)).rejects.toThrow();
    });
  });

  describe('getUserStatistics', () => {
    it('should get user statistics successfully', async () => {
      const request: GetUserStatisticsRequest = {
        userId: 1,
      };
      const stats = {
        total: 10,
        pending: 3,
        completed: 5,
        cancelled: 2,
      };

      orderService.getOrderStats.mockResolvedValue(stats);

      const result = await controller.getUserStatistics(request);

      expect(result).toBeDefined();
      expect(result.totalOrders).toBe(10);
      expect(result.totalAmount).toBe(0); // 默认值
      expect(result.savedCarbon).toBe(0); // 默认值
      expect(orderService.getOrderStats).toHaveBeenCalledWith(1);
    });

    it('should handle statistics errors', async () => {
      const request: GetUserStatisticsRequest = {
        userId: 999,
      };
      const error = new Error('User not found');

      orderService.getOrderStats.mockRejectedValue(error);

      await expect(controller.getUserStatistics(request)).rejects.toThrow();
    });
  });

  describe('mapToOrderResponse', () => {
    it('should map order to response correctly', async () => {
      const order = createTestOrder();
      const request: GetOrderRequest = { id: 1 };

      orderService.findOne.mockResolvedValue(order);

      const result = await controller.getOrder(request);

      expect(result.id).toBe(Number(order.id));
      expect(result.orderNo).toBe(order.orderNo);
      expect(result.userId).toBe(Number(order.userId));
      expect(result.addressId).toBe(Number(order.addressId));
      expect(result.status).toBe(order.status);
      expect(result.channel).toBe(order.channel);
      expect(result.remark).toBe(order.remark);
      expect(result.estimatedAmount).toBe(order.estimatedAmount);
    });

    it('should handle null values in mapping', async () => {
      const order = createTestOrder({
        actualPickupTime: null,
        settlementAmount: null,
        payAmount: null,
      });
      const request: GetOrderRequest = { id: 1 };

      orderService.findOne.mockResolvedValue(order);

      const result = await controller.getOrder(request);

      expect(result.actualPickupTime).toBe('');
      expect(result.settlementAmount).toBe('');
      expect(result.payAmount).toBe('');
    });
  });

  describe('handleGrpcError', () => {
    it('should handle different error types', async () => {
      const request: GetOrderRequest = { id: 1 };

      // Test with different error types
      const errors = [
        new Error('Generic error'),
        { message: 'Custom error', code: 'NOT_FOUND' },
        'String error',
      ];

      for (const error of errors) {
        orderService.findOne.mockRejectedValue(error);
        await expect(controller.getOrder(request)).rejects.toThrow();
      }
    });
  });
});