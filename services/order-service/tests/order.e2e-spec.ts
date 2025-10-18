import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrderModule } from '../src/order/order.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { InventoryService } from '../src/inventory/inventory.service';
import { DispatchClientService } from '../src/dispatch-client.service';
import {
  createTestRecycleOrder,
  createTestSaleOrder,
  createTestUpdateOrder,
  cleanupTestDatabase,
} from './test-utils';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let createdOrderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrderModule],
      providers: [
        PrismaService,
        {
          provide: InventoryService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1, stock: 100 }),
            checkStock: jest.fn().mockResolvedValue(true),
            updateStock: jest.fn().mockResolvedValue(true),
            reserveStock: jest.fn().mockResolvedValue(true),
            releaseStock: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: DispatchClientService,
          useValue: {
            createDispatchTask: jest.fn().mockResolvedValue({ id: 1 }),
            updateDispatchStatus: jest.fn().mockResolvedValue(true),
            getDispatchInfo: jest.fn().mockResolvedValue({ status: 'PENDING' }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  beforeEach(async () => {
    // 清理测试数据
    await cleanupTestDatabase(prismaService);
  });

  afterAll(async () => {
    await cleanupTestDatabase(prismaService);
    await app.close();
  });

  describe('/orders/recycle (POST)', () => {
    it('should create a recycle order', async () => {
      const createOrderDto = createTestRecycleOrder();

      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNo');
      expect(response.body.userId).toBe(createOrderDto.userId.toString());
      expect(response.body.status).toBe('PENDING');
      expect(response.body.channel).toBe(createOrderDto.channel);

      createdOrderId = parseInt(response.body.id);
    });

    it('should return 400 for invalid recycle order data', async () => {
      const invalidOrderDto = {
        // Missing required fields
        channel: 'APP',
      };

      await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(invalidOrderDto)
        .expect(400);
    });
  });

  describe('/orders/sale (POST)', () => {
    it('should create a sale order', async () => {
      const createOrderDto = createTestSaleOrder();

      const response = await request(app.getHttpServer())
        .post('/orders/sale')
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('orderNo');
      expect(response.body.userId).toBe(createOrderDto.userId.toString());
      expect(response.body.status).toBe('PENDING');
      expect(response.body.channel).toBe(createOrderDto.channel);
    });

    it('should return 400 for invalid sale order data', async () => {
      const invalidOrderDto = {
        // Missing required fields
        channel: 'WEB',
      };

      await request(app.getHttpServer())
        .post('/orders/sale')
        .send(invalidOrderDto)
        .expect(400);
    });
  });

  describe('/orders (GET)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should return all orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('orderNo');
      expect(response.body[0]).toHaveProperty('status');
    });
  });

  describe('/orders/:id (GET)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should return an order by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${createdOrderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId.toString());
      expect(response.body).toHaveProperty('orderNo');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('items');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/999999')
        .expect(404);
    });
  });

  describe('/orders/user/:userId (GET)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should return orders for a specific user', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .get(`/orders/user/${userId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('userId');
        expect(response.body[0].userId).toBe(userId.toString());
      }
    });
  });

  describe('/orders/:id (PUT)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should update an order', async () => {
      const updateOrderDto = createTestUpdateOrder();

      const response = await request(app.getHttpServer())
        .put(`/orders/${createdOrderId}`)
        .send(updateOrderDto)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId.toString());
      expect(response.body.status).toBe(updateOrderDto.status);
      expect(response.body.remark).toBe(updateOrderDto.remark);
    });

    it('should return 404 for non-existent order', async () => {
      const updateOrderDto = createTestUpdateOrder();

      await request(app.getHttpServer())
        .put('/orders/999999')
        .send(updateOrderDto)
        .expect(404);
    });
  });

  describe('/orders/:id/cancel (PUT)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should cancel an order', async () => {
      const response = await request(app.getHttpServer())
        .put(`/orders/${createdOrderId}/cancel`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId.toString());
      expect(response.body.status).toBe('CANCELLED');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .put('/orders/999999/cancel')
        .expect(404);
    });
  });

  describe('/orders/:id (DELETE)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should delete an order', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/orders/${createdOrderId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId.toString());

      // 验证订单已被删除
      await request(app.getHttpServer())
        .get(`/orders/${createdOrderId}`)
        .expect(404);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .delete('/orders/999999')
        .expect(404);
    });
  });

  describe('/orders/:orderId/assign/:courierId (POST)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should assign order to worker', async () => {
      const courierId = 1;

      const response = await request(app.getHttpServer())
        .post(`/orders/${createdOrderId}/assign/${courierId}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId.toString());
      expect(response.body.status).toBe('ASSIGNED');
      expect(response.body).toHaveProperty('assignments');
    });

    it('should return 404 for non-existent order', async () => {
      const courierId = 1;

      await request(app.getHttpServer())
        .post(`/orders/999999/assign/${courierId}`)
        .expect(404);
    });
  });

  describe('/orders/:id/complete-recycle (PUT)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should complete recycle order', async () => {
      const actualWeights = [{ itemId: 1, actualWeight: '5.0' }];

      const response = await request(app.getHttpServer())
        .put(`/orders/${createdOrderId}/complete-recycle`)
        .send(actualWeights)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId.toString());
      expect(response.body.status).toBe('COMPLETED');
    });
  });

  describe('/orders/stats (GET)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
    });

    it('should return order statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/stats')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pending');
      expect(response.body).toHaveProperty('completed');
      expect(response.body).toHaveProperty('cancelled');
      expect(typeof response.body.total).toBe('number');
      expect(typeof response.body.pending).toBe('number');
      expect(typeof response.body.completed).toBe('number');
      expect(typeof response.body.cancelled).toBe('number');
    });
  });

  describe('/orders/:id/status (PUT)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      const response = await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
      createdOrderId = parseInt(response.body.id);
    });

    it('should update order status', async () => {
      const statusUpdate = { status: 'IN_PROGRESS', reason: 'Processing started' };

      const response = await request(app.getHttpServer())
        .put(`/orders/${createdOrderId}/status`)
        .send(statusUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(createdOrderId.toString());
      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('should return 400 for invalid status', async () => {
      const statusUpdate = { status: 'INVALID_STATUS' };

      await request(app.getHttpServer())
        .put(`/orders/${createdOrderId}/status`)
        .send(statusUpdate)
        .expect(400);
    });
  });

  describe('/orders/batch/status (PUT)', () => {
    let orderIds: number[];

    beforeEach(async () => {
      // 创建多个测试订单
      orderIds = [];
      for (let i = 0; i < 3; i++) {
        const createOrderDto = createTestRecycleOrder();
        const response = await request(app.getHttpServer())
          .post('/orders/recycle')
          .send(createOrderDto);
        orderIds.push(parseInt(response.body.id));
      }
    });

    it('should batch update order status', async () => {
      const batchUpdate = { orderIds, status: 'CONFIRMED' };

      const response = await request(app.getHttpServer())
        .put('/orders/batch/status')
        .send(batchUpdate)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);
      response.body.forEach((result: any) => {
        expect(result).toHaveProperty('orderId');
        expect(result).toHaveProperty('success');
        expect(result.success).toBe(true);
      });
    });
  });

  describe('/orders/list (GET)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
    });

    it('should return paginated order list', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/list?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should filter orders by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/list?status=PENDING')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      if (response.body.data.length > 0) {
        response.body.data.forEach((order: any) => {
          expect(order.status).toBe('PENDING');
        });
      }
    });
  });

  describe('/orders/search (GET)', () => {
    beforeEach(async () => {
      // 创建测试订单
      const createOrderDto = createTestRecycleOrder();
      await request(app.getHttpServer())
        .post('/orders/recycle')
        .send(createOrderDto);
    });

    it('should search orders by keyword', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/search?keyword=ORD')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        response.body.forEach((order: any) => {
          expect(order.orderNo).toContain('ORD');
        });
      }
    });
  });
});