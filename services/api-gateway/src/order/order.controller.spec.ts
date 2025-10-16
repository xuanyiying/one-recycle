import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { OrderController } from './order.controller';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('OrderController', () => {
  let controller: OrderController;
  let httpService: HttpService;

  const mockAxiosResponse: AxiosResponse = {
    data: {},
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of(mockAxiosResponse)),
            post: jest.fn(() => of(mockAxiosResponse)),
            put: jest.fn(() => of(mockAxiosResponse)),
          },
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should call httpService.post with correct URL and order data', async () => {
      const orderData = { userId: '123', items: [] };
      
      await controller.createOrder(orderData);
      
      expect(httpService.post).toHaveBeenCalledWith(
        'http://order-service:3002/orders',
        orderData
      );
    });
  });

  describe('getOrder', () => {
    it('should call httpService.get with correct URL and ID', async () => {
      const id = '123';
      
      await controller.getOrder(id);
      
      expect(httpService.get).toHaveBeenCalledWith(
        `http://order-service:3002/orders/${id}`
      );
    });
  });

  describe('getOrdersByUser', () => {
    it('should call httpService.get with correct URL and user ID', async () => {
      const userId = '123';
      
      await controller.getOrdersByUser(userId);
      
      expect(httpService.get).toHaveBeenCalledWith(
        `http://order-service:3002/orders/user/${userId}`
      );
    });
  });

  describe('cancelOrder', () => {
    it('should call httpService.put with correct URL and ID', async () => {
      const id = '123';
      
      await controller.cancelOrder(id);
      
      expect(httpService.put).toHaveBeenCalledWith(
        `http://order-service:3002/orders/${id}/cancel`
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should call httpService.put with correct URL, ID and status data', async () => {
      const id = '123';
      const statusData = { status: 'completed' };
      
      await controller.updateOrderStatus(id, statusData);
      
      expect(httpService.put).toHaveBeenCalledWith(
        `http://order-service:3002/orders/${id}/status`,
        statusData
      );
    });
  });

  describe('getUserStatistics', () => {
    it('should call httpService.get with correct URL and user ID', async () => {
      const userId = '123';
      
      await controller.getUserStatistics(userId);
      
      expect(httpService.get).toHaveBeenCalledWith(
        `http://order-service:3002/statistics/user/${userId}`
      );
    });
  });
});