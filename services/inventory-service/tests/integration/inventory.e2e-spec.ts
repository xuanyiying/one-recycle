import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma.service';
import { cleanupTestDatabase } from '../test-utils';

describe('InventoryController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let warehouseId: bigint;
  let categoryId: bigint;
  let itemId: bigint;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();

    // 创建测试数据
    const warehouse = await prismaService.warehouse.create({
      data: {
        name: '测试仓库',
        address: '测试地址',
        capacity: 1000,
        managerId: BigInt(1),
        managerName: '仓库管理员',
        status: 'ACTIVE',
      },
    });
    warehouseId = warehouse.id;

    // 假设有一个分类表，创建测试分类
    try {
      const category = await prismaService.category.create({
        data: {
          name: '测试分类',
          description: '测试分类描述',
        },
      });
      categoryId = category.id;
    } catch (error) {
      // 如果没有分类表，使用默认值
      categoryId = BigInt(1);
    }
  });

  afterAll(async () => {
    await cleanupTestDatabase(prismaService);
    await app.close();
  });

  describe('/inventory/items (POST)', () => {
    it('should create inventory item', async () => {
      const createDto = {
        warehouseId: Number(warehouseId),
        categoryId: Number(categoryId),
        name: '测试商品',
        description: '测试商品描述',
        unit: '个',
        quantity: 100,
        unitPrice: 10.50,
        location: 'A-01-01',
        itemType: 'ELECTRONICS',
        condition: 'NEW',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/items')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: '测试商品',
        description: '测试商品描述',
        unit: '个',
        quantity: '100',
        unitPrice: '10.5',
        location: 'A-01-01',
        status: 'IN_STOCK',
      });

      itemId = BigInt(response.body.id);
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        warehouseId: Number(warehouseId),
        categoryId: Number(categoryId),
        name: '', // 空名称
        quantity: -1, // 负数量
        unitPrice: -10, // 负价格
      };

      await request(app.getHttpServer())
        .post('/inventory/items')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/inventory/items (GET)', () => {
    it('should return all inventory items', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/items')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter items by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/items?status=IN_STOCK')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((item: any) => {
        expect(item.status).toBe('IN_STOCK');
      });
    });

    it('should filter items by location', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/items?location=A-01')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/inventory/items/:id (GET)', () => {
    it('should return inventory item by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/items/${itemId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: itemId.toString(),
        name: '测试商品',
        description: '测试商品描述',
      });
    });

    it('should return 404 for non-existent item', async () => {
      await request(app.getHttpServer())
        .get('/inventory/items/999999')
        .expect(404);
    });
  });

  describe('/inventory/items/:id (PUT)', () => {
    it('should update inventory item', async () => {
      const updateDto = {
        name: '更新的商品名称',
        description: '更新的描述',
        unitPrice: 15.00,
      };

      const response = await request(app.getHttpServer())
        .put(`/inventory/items/${itemId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        name: '更新的商品名称',
        description: '更新的描述',
        unitPrice: '15',
      });
    });

    it('should return 404 for non-existent item', async () => {
      const updateDto = { name: '更新的商品名称' };

      await request(app.getHttpServer())
        .put('/inventory/items/999999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/inventory/transactions (POST)', () => {
    it('should create IN transaction', async () => {
      const transactionDto = {
        itemId: itemId.toString(),
        type: 'IN',
        quantity: 50,
        unitPrice: 10.50,
        reason: '采购入库',
        operatorId: '1',
        operatorName: '操作员',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/transactions')
        .send(transactionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        type: 'IN',
        quantity: '50',
        unitPrice: '10.5',
        reason: '采购入库',
      });
    });

    it('should create OUT transaction', async () => {
      const transactionDto = {
        itemId: itemId.toString(),
        type: 'OUT',
        quantity: 30,
        unitPrice: 10.50,
        reason: '销售出库',
        operatorId: '1',
        operatorName: '操作员',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/transactions')
        .send(transactionDto)
        .expect(201);

      expect(response.body).toMatchObject({
        type: 'OUT',
        quantity: '30',
        reason: '销售出库',
      });
    });

    it('should return 400 for insufficient stock', async () => {
      const transactionDto = {
        itemId: itemId.toString(),
        type: 'OUT',
        quantity: 10000, // 超过库存
        unitPrice: 10.50,
        reason: '销售出库',
        operatorId: '1',
        operatorName: '操作员',
      };

      await request(app.getHttpServer())
        .post('/inventory/transactions')
        .send(transactionDto)
        .expect(400);
    });
  });

  describe('/inventory/items/:id/transactions (GET)', () => {
    it('should return transactions for item', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/items/${itemId}/transactions`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/inventory/quality-checks (POST)', () => {
    it('should create quality check', async () => {
      const qualityCheckDto = {
        itemId: itemId.toString(),
        checkType: 'INCOMING',
        result: 'PASS',
        score: 95,
        notes: '质量良好',
        checkedBy: '质检员',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/quality-checks')
        .send(qualityCheckDto)
        .expect(201);

      expect(response.body).toMatchObject({
        checkType: 'INCOMING',
        result: 'PASS',
        score: 95,
        notes: '质量良好',
      });
    });
  });

  describe('/inventory/items/:id/quality-checks (GET)', () => {
    it('should return quality checks for item', async () => {
      const response = await request(app.getHttpServer())
        .get(`/inventory/items/${itemId}/quality-checks`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/inventory/sales (POST)', () => {
    it('should record sales', async () => {
      const salesDto = {
        itemId: Number(itemId),
        quantity: 5,
        unitPrice: 15.00,
        orderId: 'ORDER-001',
        customerId: 1,
        notes: '正常销售',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/sales')
        .send(salesDto)
        .expect(201);

      expect(response.body).toMatchObject({
        quantity: '5',
        unitPrice: '15',
        orderId: 'ORDER-001',
        notes: '正常销售',
      });
    });
  });

  describe('/inventory/sales (GET)', () => {
    it('should return sales records', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/sales')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter sales by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const response = await request(app.getHttpServer())
        .get(`/inventory/sales?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/inventory/alerts/low-stock (GET)', () => {
    it('should return low stock items', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/alerts/low-stock?threshold=200')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/inventory/alerts/out-of-stock (GET)', () => {
    it('should return out of stock items', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/alerts/out-of-stock')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/inventory/stats (GET)', () => {
    it('should return inventory statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/stats')
        .expect(200);

      expect(response.body).toHaveProperty('totalItems');
      expect(response.body).toHaveProperty('totalQuantity');
      expect(response.body).toHaveProperty('averagePrice');
      expect(response.body).toHaveProperty('statusBreakdown');
    });
  });

  describe('/inventory/bulk-update (PUT)', () => {
    it('should bulk update items', async () => {
      const bulkUpdateDto = {
        itemIds: [itemId.toString()],
        updates: {
          status: 'IN_STOCK',
          location: 'B-01-01',
        },
      };

      const response = await request(app.getHttpServer())
        .put('/inventory/bulk-update')
        .send(bulkUpdateDto)
        .expect(200);

      expect(response.body).toHaveProperty('updated');
      expect(response.body.updated).toBeGreaterThan(0);
    });
  });

  describe('/inventory/transfer (POST)', () => {
    it('should transfer inventory between warehouses', async () => {
      // 创建另一个仓库
      const warehouse2 = await prismaService.warehouse.create({
        data: {
          name: '测试仓库2',
          address: '测试地址2',
          capacity: 1000,
          managerId: BigInt(2),
          managerName: '仓库管理员2',
          status: 'ACTIVE',
        },
      });

      const transferDto = {
        itemId: itemId.toString(),
        fromWarehouseId: Number(warehouseId),
        toWarehouseId: Number(warehouse2.id),
        quantity: 10,
        reason: '仓库调拨',
        operatorId: '1',
        operatorName: '操作员',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/transfer')
        .send(transferDto)
        .expect(201);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('/inventory/warehouses (POST)', () => {
    it('should create warehouse', async () => {
      const warehouseDto = {
        name: '新测试仓库',
        address: '新测试地址',
        capacity: 2000,
        managerId: '3',
        managerName: '新仓库管理员',
      };

      const response = await request(app.getHttpServer())
        .post('/inventory/warehouses')
        .send(warehouseDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: '新测试仓库',
        address: '新测试地址',
        capacity: 2000,
        status: 'ACTIVE',
      });
    });
  });

  describe('/inventory/warehouses (GET)', () => {
    it('should return all warehouses', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/warehouses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('/inventory/reports/inventory (GET)', () => {
    it('should generate inventory report', async () => {
      const response = await request(app.getHttpServer())
        .get('/inventory/reports/inventory?format=json')
        .expect(200);

      expect(response.body).toHaveProperty('reportId');
      expect(response.body).toHaveProperty('generatedAt');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('/inventory/reports/sales (GET)', () => {
    it('should generate sales report', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const response = await request(app.getHttpServer())
        .get(`/inventory/reports/sales?startDate=${startDate}&endDate=${endDate}&format=json`)
        .expect(200);

      expect(response.body).toHaveProperty('reportId');
      expect(response.body).toHaveProperty('generatedAt');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('/inventory/reports/stock-movement (GET)', () => {
    it('should generate stock movement report', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const response = await request(app.getHttpServer())
        .get(`/inventory/reports/stock-movement?startDate=${startDate}&endDate=${endDate}&format=json`)
        .expect(200);

      expect(response.body).toHaveProperty('reportId');
      expect(response.body).toHaveProperty('generatedAt');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('/inventory/items/:id (DELETE)', () => {
    it('should delete inventory item', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/inventory/items/${itemId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: itemId.toString(),
      });

      // 验证商品已被删除
      await request(app.getHttpServer())
        .get(`/inventory/items/${itemId}`)
        .expect(404);
    });
  });
});