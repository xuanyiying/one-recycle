import { Test, TestingModule } from '@nestjs/testing';
import { GatewayController } from './gateway.controller';
import { ProxyService } from '../services/proxy.service';
import { LoadBalancerService } from '../services/load-balancer.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GatewayController', () => {
  let controller: GatewayController;
  let proxyService: ProxyService;
  let loadBalancerService: LoadBalancerService;

  const mockProxyService = {
    streamProxy: jest.fn(),
    aggregateRequests: jest.fn(),
  };

  const mockLoadBalancerService = {
    getServicesHealth: jest.fn(() => ({
      'account-service': { status: 'healthy' },
      'order-service': { status: 'healthy' },
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GatewayController],
      providers: [
        {
          provide: ProxyService,
          useValue: mockProxyService,
        },
        {
          provide: LoadBalancerService,
          useValue: mockLoadBalancerService,
        },
      ],
    }).compile();

    controller = module.get<GatewayController>(GatewayController);
    proxyService = module.get<ProxyService>(ProxyService);
    loadBalancerService = module.get<LoadBalancerService>(LoadBalancerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('health', () => {
    it('should return health status', async () => {
      const result = await controller.health();
      
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('services');
      expect(loadBalancerService.getServicesHealth).toHaveBeenCalled();
    });
  });

  describe('aggregate', () => {
    it('should aggregate requests successfully', async () => {
      const requests = [
        {
          key: 'users',
          service: 'account-service',
          path: '/users',
          method: 'GET',
        },
      ];
      const headers = { 'authorization': 'Bearer token' };
      
      mockProxyService.aggregateRequests.mockResolvedValue({ users: [] });

      const result = await controller.aggregate(requests, headers);

      expect(proxyService.aggregateRequests).toHaveBeenCalledWith([
        {
          key: 'users',
          serviceName: 'account-service',
          path: '/users',
          method: 'GET',
          body: undefined,
          headers: { 'authorization': 'Bearer token' },
        },
      ]);
      expect(result).toEqual({ users: [] });
    });

    it('should throw error for invalid requests array', async () => {
      await expect(controller.aggregate([], {})).rejects.toThrow(
        new HttpException('Invalid requests array', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw error for non-array requests', async () => {
      await expect(controller.aggregate(null as any, {})).rejects.toThrow(
        new HttpException('Invalid requests array', HttpStatus.BAD_REQUEST)
      );
    });
  });

  describe('proxy methods', () => {
    const mockReq = {
      path: '/api/v1/users/profile',
      method: 'GET',
      headers: {},
      body: {},
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    } as any;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('proxyToUserService', () => {
      it('should proxy to user service with correct path', async () => {
        mockReq.path = '/api/v1/users/profile';
        
        await controller.proxyToUserService(mockReq, mockRes);

        expect(proxyService.streamProxy).toHaveBeenCalledWith(
          mockReq,
          mockRes,
          'account-service',
          '/users/profile'
        );
      });
    });

    describe('proxyToOrderService', () => {
      it('should proxy to order service with correct path', async () => {
        mockReq.path = '/api/v1/orders/123';
        
        await controller.proxyToOrderService(mockReq, mockRes);

        expect(proxyService.streamProxy).toHaveBeenCalledWith(
          mockReq,
          mockRes,
          'order-service',
          '/orders/123'
        );
      });
    });

    describe('proxyToAuthService', () => {
      it('should proxy to auth service with correct path', async () => {
        mockReq.path = '/api/v1/auth/login';
        
        await controller.proxyToAuthService(mockReq, mockRes);

        expect(proxyService.streamProxy).toHaveBeenCalledWith(
          mockReq,
          mockRes,
          'account-service',
          '/auth/login'
        );
      });
    });

    describe('proxyToService', () => {
      it('should proxy to dynamic service with correct path', async () => {
        mockReq.path = '/api/v1/custom/endpoint';
        
        await controller.proxyToService('custom', mockReq, mockRes);

        expect(proxyService.streamProxy).toHaveBeenCalledWith(
          mockReq,
          mockRes,
          'custom-service',
          '/endpoint'
        );
      });
    });
  });
});