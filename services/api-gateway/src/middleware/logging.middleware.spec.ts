import { Test, TestingModule } from '@nestjs/testing';
import { LoggingMiddleware } from './logging.middleware';
import { createMockRequest, createMockResponse } from '../../tests/test-utils';

// Mock console.log to capture log output
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingMiddleware],
    }).compile();

    middleware = module.get<LoggingMiddleware>(LoggingMiddleware);
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe('use', () => {
    let mockReq: any;
    let mockRes: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = createMockRequest();
      mockRes = createMockResponse();
      mockNext = jest.fn();
    });

    it('should log incoming request', () => {
      mockReq.method = 'GET';
      mockReq.originalUrl = '/api/v1/users';
      mockReq.ip = '127.0.0.1';
      mockReq.get = jest.fn().mockReturnValue('Mozilla/5.0');

      middleware.use(mockReq, mockRes, mockNext);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Incoming request:'),
        expect.objectContaining({
          method: 'GET',
          url: '/api/v1/users',
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          timestamp: expect.any(String),
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log outgoing response', () => {
      mockReq.method = 'POST';
      mockReq.originalUrl = '/api/v1/orders';
      mockReq.ip = '192.168.1.1';
      mockReq.get = jest.fn().mockReturnValue('PostmanRuntime/7.28.4');

      middleware.use(mockReq, mockRes, mockNext);

      // Simulate response finish
      const finishCallback = mockRes.on.mock.calls.find(
        call => call[0] === 'finish'
      )[1];
      
      mockRes.statusCode = 201;
      mockRes.get = jest.fn().mockReturnValue('1024');
      
      finishCallback();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Outgoing response:'),
        expect.objectContaining({
          method: 'POST',
          url: '/api/v1/orders',
          statusCode: 201,
          contentLength: '1024',
          responseTime: expect.any(Number),
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle missing user agent', () => {
      mockReq.method = 'GET';
      mockReq.originalUrl = '/health';
      mockReq.ip = '127.0.0.1';
      mockReq.get = jest.fn().mockReturnValue(undefined);

      middleware.use(mockReq, mockRes, mockNext);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Incoming request:'),
        expect.objectContaining({
          userAgent: 'Unknown',
        })
      );
    });

    it('should handle missing content length in response', () => {
      mockReq.method = 'DELETE';
      mockReq.originalUrl = '/api/v1/users/123';
      mockReq.ip = '10.0.0.1';
      mockReq.get = jest.fn().mockReturnValue('curl/7.68.0');

      middleware.use(mockReq, mockRes, mockNext);

      // Simulate response finish
      const finishCallback = mockRes.on.mock.calls.find(
        call => call[0] === 'finish'
      )[1];
      
      mockRes.statusCode = 204;
      mockRes.get = jest.fn().mockReturnValue(undefined);
      
      finishCallback();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Outgoing response:'),
        expect.objectContaining({
          contentLength: '0',
        })
      );
    });

    it('should calculate response time correctly', (done) => {
      mockReq.method = 'GET';
      mockReq.originalUrl = '/api/v1/payments';
      mockReq.ip = '172.16.0.1';
      mockReq.get = jest.fn().mockReturnValue('axios/0.21.1');

      middleware.use(mockReq, mockRes, mockNext);

      // Simulate some processing time
      setTimeout(() => {
        const finishCallback = mockRes.on.mock.calls.find(
          call => call[0] === 'finish'
        )[1];
        
        mockRes.statusCode = 200;
        mockRes.get = jest.fn().mockReturnValue('512');
        
        finishCallback();

        const logCall = mockConsoleLog.mock.calls.find(
          call => call[0].includes('Outgoing response:')
        );
        
        expect(logCall[1].responseTime).toBeGreaterThan(0);
        done();
      }, 10);
    });

    it('should handle different HTTP methods', () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

      methods.forEach(method => {
        mockReq.method = method;
        mockReq.originalUrl = `/api/v1/test`;
        mockReq.ip = '127.0.0.1';
        mockReq.get = jest.fn().mockReturnValue('TestAgent/1.0');

        middleware.use(mockReq, mockRes, mockNext);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('Incoming request:'),
          expect.objectContaining({
            method: method,
          })
        );

        mockConsoleLog.mockClear();
      });
    });

    it('should handle different status codes', () => {
      const statusCodes = [200, 201, 400, 401, 404, 500];

      statusCodes.forEach(statusCode => {
        mockReq.method = 'GET';
        mockReq.originalUrl = '/api/v1/test';
        mockReq.ip = '127.0.0.1';
        mockReq.get = jest.fn().mockReturnValue('TestAgent/1.0');

        middleware.use(mockReq, mockRes, mockNext);

        const finishCallback = mockRes.on.mock.calls.find(
          call => call[0] === 'finish'
        )[1];
        
        mockRes.statusCode = statusCode;
        mockRes.get = jest.fn().mockReturnValue('100');
        
        finishCallback();

        expect(mockConsoleLog).toHaveBeenCalledWith(
          expect.stringContaining('Outgoing response:'),
          expect.objectContaining({
            statusCode: statusCode,
          })
        );

        mockConsoleLog.mockClear();
        mockRes.on.mockClear();
      });
    });

    it('should handle special characters in URL', () => {
      mockReq.method = 'GET';
      mockReq.originalUrl = '/api/v1/search?q=test%20query&category=电子产品';
      mockReq.ip = '127.0.0.1';
      mockReq.get = jest.fn().mockReturnValue('Mozilla/5.0');

      middleware.use(mockReq, mockRes, mockNext);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Incoming request:'),
        expect.objectContaining({
          url: '/api/v1/search?q=test%20query&category=电子产品',
        })
      );
    });

    it('should handle IPv6 addresses', () => {
      mockReq.method = 'GET';
      mockReq.originalUrl = '/api/v1/users';
      mockReq.ip = '::1';
      mockReq.get = jest.fn().mockReturnValue('Mozilla/5.0');

      middleware.use(mockReq, mockRes, mockNext);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Incoming request:'),
        expect.objectContaining({
          ip: '::1',
        })
      );
    });

    it('should handle very long URLs', () => {
      const longUrl = '/api/v1/search?' + 'param=value&'.repeat(100);
      
      mockReq.method = 'GET';
      mockReq.originalUrl = longUrl;
      mockReq.ip = '127.0.0.1';
      mockReq.get = jest.fn().mockReturnValue('Mozilla/5.0');

      middleware.use(mockReq, mockRes, mockNext);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Incoming request:'),
        expect.objectContaining({
          url: longUrl,
        })
      );
    });
  });
});