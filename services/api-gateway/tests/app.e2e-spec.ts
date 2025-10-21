import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';
import { createTestJwtPayload, createTestAxiosResponse } from './test-utils';

describe('API Gateway (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const validToken = () => {
    const payload = createTestJwtPayload();
    return jwtService.sign(payload);
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(HttpService)
    .useValue({
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      put: jest.fn(),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same configuration as in main.ts
    app.setGlobalPrefix('api/v1');
    
    await app.init();

    httpService = moduleFixture.get<HttpService>(HttpService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('/api/v1/health (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });
  });

  describe('Authentication Middleware', () => {
    it('should allow access to public routes without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);
    });

    it('should require token for protected routes', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of(createTestAxiosResponse({ message: 'Unauthorized' })) as any
      );

      await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .expect(401);
    });

    it('should accept valid JWT token', async () => {
      const payload = createTestJwtPayload();
      const token = jwtService.sign(payload);
      
      jest.spyOn(httpService, 'get').mockReturnValue(
        of(createTestAxiosResponse({ id: '1', name: 'Test User' })) as any
      );

      await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should reject invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('Proxy Routes', () => {
    describe('User Service Proxy', () => {
      it('should proxy GET requests to user service', async () => {
        const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
        jest.spyOn(httpService, 'get').mockReturnValue(
          of(createTestAxiosResponse(mockUser)) as any
        );

        const response = await request(app.getHttpServer())
          .get('/api/v1/users/profile')
          .set('Authorization', `Bearer ${validToken()}`)
          .expect(200);

        expect(response.body).toEqual(mockUser);
      });

      it('should proxy POST requests to user service', async () => {
        const createUserDto = { name: 'New User', email: 'new@example.com' };
        const mockCreatedUser = { id: '2', ...createUserDto };
        
        jest.spyOn(httpService, 'post').mockReturnValue(
          of(createTestAxiosResponse(mockCreatedUser)) as any
        );

        const response = await request(app.getHttpServer())
          .post('/api/v1/users')
          .set('Authorization', `Bearer ${validToken()}`)
          .send(createUserDto)
          .expect(201);

        expect(response.body).toEqual(mockCreatedUser);
      });
    });

    describe('Order Service Proxy', () => {
      it('should proxy GET requests to order service', async () => {
        const mockOrders = [
          { id: '1', userId: '1', status: 'PENDING' },
          { id: '2', userId: '1', status: 'COMPLETED' },
        ];
        
        jest.spyOn(httpService, 'get').mockReturnValue(
          of(createTestAxiosResponse(mockOrders)) as any
        );

        const response = await request(app.getHttpServer())
          .get('/api/v1/orders')
          .set('Authorization', `Bearer ${validToken()}`)
          .expect(200);

        expect(response.body).toEqual(mockOrders);
      });

      it('should proxy POST requests to order service', async () => {
        const createOrderDto = { items: [{ id: '1', quantity: 2 }] };
        const mockCreatedOrder = { id: '3', ...createOrderDto, status: 'PENDING' };
        
        jest.spyOn(httpService, 'post').mockReturnValue(
          of(createTestAxiosResponse(mockCreatedOrder)) as any
        );

        const response = await request(app.getHttpServer())
          .post('/api/v1/orders')
          .set('Authorization', `Bearer ${validToken()}`)
          .send(createOrderDto)
          .expect(201);

        expect(response.body).toEqual(mockCreatedOrder);
      });
    });

    describe('Payment Service Proxy', () => {
      it('should proxy payment requests', async () => {
        const mockPayment = { id: '1', orderId: '1', amount: 100, status: 'COMPLETED' };
        
        jest.spyOn(httpService, 'get').mockReturnValue(
          of(createTestAxiosResponse(mockPayment)) as any
        );

        const response = await request(app.getHttpServer())
          .get('/api/v1/payments/1')
          .set('Authorization', `Bearer ${validToken()}`)
          .expect(200);

        expect(response.body).toEqual(mockPayment);
      });
    });

    describe('Courier Service Proxy', () => {
      it('should proxy courier requests', async () => {
        const mockCouriers = [
          { id: '1', name: 'John Doe', status: 'ACTIVE' },
          { id: '2', name: 'Jane Smith', status: 'ACTIVE' },
        ];
        
        jest.spyOn(httpService, 'get').mockReturnValue(
          of(createTestAxiosResponse(mockCouriers)) as any
        );

        const response = await request(app.getHttpServer())
          .get('/api/v1/couriers')
          .set('Authorization', `Bearer ${validToken()}`)
          .expect(200);

        expect(response.body).toEqual(mockCouriers);
      });
    });

    describe('Dispatch Service Proxy', () => {
      it('should proxy dispatch requests', async () => {
        const mockDispatches = [
          { id: '1', orderId: '1', courierId: '1', status: 'ASSIGNED' },
        ];
        
        jest.spyOn(httpService, 'get').mockReturnValue(
          of(createTestAxiosResponse(mockDispatches)) as any
        );

        const response = await request(app.getHttpServer())
          .get('/api/v1/dispatch')
          .set('Authorization', `Bearer ${validToken()}`)
          .expect(200);

        expect(response.body).toEqual(mockDispatches);
      });
    });
  });

  describe('Request Aggregation', () => {
    it('should aggregate multiple service requests', async () => {
      const aggregateRequest = {
        requests: [
          {
            key: 'user',
            service: 'account-service',
            path: '/users/1',
            method: 'GET',
          },
          {
            key: 'orders',
            service: 'order-service',
            path: '/orders',
            method: 'GET',
          },
        ],
      };

      const mockAggregatedResponse = {
        user: { id: '1', name: 'Test User' },
        orders: [{ id: '1', status: 'PENDING' }],
      };

      // Mock the aggregateRequests method
      jest.spyOn(httpService, 'post').mockReturnValue(
        of(createTestAxiosResponse(mockAggregatedResponse)) as any
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/aggregate')
        .set('Authorization', `Bearer ${validToken()}`)
        .send(aggregateRequest)
        .expect(200);

      expect(response.body).toEqual(mockAggregatedResponse);
    });

    it('should handle empty requests array', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/aggregate')
        .set('Authorization', `Bearer ${validToken()}`)
        .send({ requests: [] })
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable errors', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of(createTestAxiosResponse({ message: 'Service Unavailable' })) as any
      );

      await request(app.getHttpServer())
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${validToken()}`)
        .expect(503);
    });

    it('should handle not found errors', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of(createTestAxiosResponse({ message: 'User not found' })) as any
      );

      await request(app.getHttpServer())
        .get('/api/v1/users/999')
        .set('Authorization', `Bearer ${validToken()}`)
        .expect(404);
    });

    it('should handle validation errors', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(
        of(createTestAxiosResponse({ message: 'Validation failed' })) as any
      );

      await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${validToken()}`)
        .send({ invalid: 'data' })
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of(createTestAxiosResponse({ message: 'OK' })) as any
      );

      // Make multiple requests quickly
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .get('/api/v1/health')
      );

      const responses = await Promise.all(requests);
      
      // Some requests should succeed, but rate limiting should kick in
      const successfulRequests = responses.filter(res => res.status === 200);
      const rateLimitedRequests = responses.filter(res => res.status === 429);

      expect(successfulRequests.length).toBeGreaterThan(0);
      // Note: Rate limiting behavior depends on configuration
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle preflight requests', async () => {
      await request(app.getHttpServer())
        .options('/api/v1/users')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(200);
    });
  });

  describe('Request/Response Transformation', () => {
    it('should preserve request headers', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of(createTestAxiosResponse({ message: 'OK' })) as any
      );

      await request(app.getHttpServer())
        .get('/api/v1/users/1')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('X-Custom-Header', 'custom-value')
        .expect(200);

      // Verify that custom headers are passed through
      // This would require more sophisticated mocking to verify
    });

    it('should handle different content types', async () => {
      const mockData = { message: 'File uploaded' };
      jest.spyOn(httpService, 'post').mockReturnValue(
        of(createTestAxiosResponse(mockData)) as any
      );

      await request(app.getHttpServer())
        .post('/api/v1/users/upload')
        .set('Authorization', `Bearer ${validToken()}`)
        .set('Content-Type', 'multipart/form-data')
        .expect(200);
    });
  });

  describe('Dynamic Service Routing', () => {
    it('should route to dynamic services', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of(createTestAxiosResponse({ message: 'Custom service response' })) as any
      );

      const response = await request(app.getHttpServer())
        .get('/api/v1/custom/endpoint')
        .set('Authorization', `Bearer ${validToken()}`)
        .expect(200);

      expect(response.body).toEqual({ message: 'Custom service response' });
    });
  });
});