import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ProxyService } from './proxy.service';
import { LoadBalancerService } from './load-balancer.service';
import { 
  createMockHttpService, 
  createMockRequest, 
  createMockResponse, 
  createTestServiceConfig,
  createTestAxiosResponse,
  createTestAggregateRequest
} from '../../tests/test-utils';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ProxyService', () => {
  let service: ProxyService;
  let httpService: HttpService;
  let loadBalancerService: LoadBalancerService;

  const mockLoadBalancerService = {
    getServiceInstance: jest.fn(),
    markInstanceUnhealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: HttpService,
          useValue: createMockHttpService(),
        },
        {
          provide: LoadBalancerService,
          useValue: mockLoadBalancerService,
        },
      ],
    }).compile();

    service = module.get<ProxyService>(ProxyService);
    httpService = module.get<HttpService>(HttpService);
    loadBalancerService = module.get<LoadBalancerService>(LoadBalancerService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadBalancerService.getServiceInstance.mockReturnValue({
      config: createTestServiceConfig(),
      isHealthy: true,
      currentWeight: 1,
      lastHealthCheck: new Date(),
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('proxyRequest', () => {
    it('should proxy GET request successfully', async () => {
      const mockResponse = createTestAxiosResponse({ data: 'test' });
      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse));

      const result = await service.proxyRequest('test-service', '/test', 'GET');

      expect(result).toEqual(mockResponse);
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:3001/test',
        headers: {},
        timeout: 5000,
      });
    });

    it('should proxy POST request with body', async () => {
      const mockResponse = createTestAxiosResponse({ success: true });
      const requestBody = { name: 'test' };
      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse));

      const result = await service.proxyRequest('test-service', '/test', 'POST', requestBody);

      expect(result).toEqual(mockResponse);
      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/test',
        data: requestBody,
        headers: {},
        timeout: 5000,
      });
    });

    it('should include custom headers', async () => {
      const mockResponse = createTestAxiosResponse({ success: true });
      const customHeaders = { 'X-Custom': 'value' };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      await service.proxyRequest('test-service', '/test', 'GET', undefined, customHeaders);

      expect(httpService.get).toHaveBeenCalledWith(
        'http://localhost:3001/test',
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders),
        })
      );
    });

    it('should throw error when no healthy instance available', async () => {
      mockLoadBalancerService.getServiceInstance.mockReturnValue(null);

      await expect(
        service.proxyRequest('test-service', '/test', 'GET')
      ).rejects.toThrow(HttpException);
    });

    it('should mark instance unhealthy on request failure', async () => {
      jest.spyOn(httpService, 'request').mockReturnValue(
        throwError(() => new Error('Request failed'))
      );

      await expect(
        service.proxyRequest('test-service', '/test', 'GET')
      ).rejects.toThrow();

      expect(mockLoadBalancerService.markInstanceUnhealthy).toHaveBeenCalledWith(
        'test-service',
        'test-service-1'
      );
    });

    it('should use custom timeout', async () => {
      const mockResponse = createTestAxiosResponse({ success: true });
      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse));

      await service.proxyRequest('test-service', '/test', 'GET', undefined, {
        timeout: '10000',
      });

      expect(httpService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:3001/test',
        headers: {},
        timeout: 10000,
      });
    });
  });

  describe('streamProxy', () => {
    it('should stream proxy request successfully', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockResponse = {
        data: 'test data',
        status: 200,
        headers: { 'content-type': 'application/json' },
        pipe: jest.fn(),
      };

      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse as any));

      await service.streamProxy(req as any, res as any, 'test-service', '/test');

      expect(httpService.request).toHaveBeenCalled();
      expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/json');
    });

    it('should handle streaming errors', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      jest.spyOn(httpService, 'request').mockReturnValue(
        throwError(() => new Error('Stream error'))
      );

      await service.streamProxy(req as any, res as any, 'test-service', '/test');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Service temporarily unavailable',
      });
    });

    it('should forward request headers', async () => {
      const req = createMockRequest({
        headers: {
          'authorization': 'Bearer token',
          'content-type': 'application/json',
          'x-custom': 'value',
        },
      });
      const res = createMockResponse();
      const mockResponse = {
        data: 'test',
        status: 200,
        headers: {},
        pipe: jest.fn(),
      };

      jest.spyOn(httpService, 'request').mockReturnValue(of(mockResponse as any));

      await service.streamProxy(req as any, res as any, 'test-service', '/test');

      expect(httpService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': 'Bearer token',
            'content-type': 'application/json',
            'x-custom': 'value',
          }),
        })
      );
    });
  });

  describe('aggregateRequests', () => {
    it('should aggregate multiple requests successfully', async () => {
      const requests = [
        {
          key: 'request1',
          serviceName: 'test-service',
          path: '/test1',
          method: 'GET',
          headers: {},
        },
        {
          key: 'request2',
          serviceName: 'test-service',
          path: '/test2',
          method: 'POST',
          body: { data: 'test' },
          headers: {},
        },
      ];

      const mockResponse1 = createTestAxiosResponse({ result: 'test1' });
      const mockResponse2 = createTestAxiosResponse({ result: 'test2' });

      jest.spyOn(httpService, 'request')
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.aggregateRequests(requests);

      expect(result).toEqual({
        request1: { result: 'test1' },
        request2: { result: 'test2' },
      });
    });

    it('should handle partial failures in aggregation', async () => {
      const requests = [
        {
          key: 'success',
          serviceName: 'test-service',
          path: '/success',
          method: 'GET',
          headers: {},
        },
        {
          key: 'failure',
          serviceName: 'test-service',
          path: '/failure',
          method: 'GET',
          headers: {},
        },
      ];

      const mockSuccessResponse = createTestAxiosResponse({ result: 'success' });

      jest.spyOn(httpService, 'request')
        .mockReturnValueOnce(of(mockSuccessResponse))
        .mockReturnValueOnce(throwError(() => new Error('Request failed')));

      const result = await service.aggregateRequests(requests);

      expect(result).toEqual({
        success: { result: 'success' },
        failure: {
          error: 'Service Error',
          message: 'Request failed',
        },
      });
    });

    it('should handle empty requests array', async () => {
      const result = await service.aggregateRequests([]);
      expect(result).toEqual({});
    });

    it('should handle service unavailable in aggregation', async () => {
      mockLoadBalancerService.getServiceInstance.mockReturnValue(null);

      const requests = [
        {
          key: 'test',
          serviceName: 'unavailable-service',
          path: '/test',
          method: 'GET',
          headers: {},
        },
      ];

      const result = await service.aggregateRequests(requests);

      expect(result).toEqual({
        test: {
          error: 'Service Unavailable',
          message: 'No healthy instances available for service: unavailable-service',
        },
      });
    });
  });

  describe('error handling', () => {
    it('should handle network timeout', async () => {
      jest.spyOn(httpService, 'request').mockReturnValue(
        throwError(() => ({ code: 'ECONNABORTED', message: 'timeout' }))
      );

      await expect(
        service.proxyRequest('test-service', '/test', 'GET')
      ).rejects.toThrow(HttpException);
    });

    it('should handle connection refused', async () => {
      jest.spyOn(httpService, 'request').mockReturnValue(
        throwError(() => ({ code: 'ECONNREFUSED', message: 'connection refused' }))
      );

      await expect(
        service.proxyRequest('test-service', '/test', 'GET')
      ).rejects.toThrow(HttpException);
    });

    it('should handle HTTP error responses', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      };

      jest.spyOn(httpService, 'request').mockReturnValue(
        throwError(() => errorResponse)
      );

      await expect(
        service.proxyRequest('test-service', '/test', 'GET')
      ).rejects.toThrow(HttpException);
    });
  });
});