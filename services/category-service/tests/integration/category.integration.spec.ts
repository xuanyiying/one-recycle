import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma.service';
import { CategoryModule } from '../../src/modules/category/category.module';
import { ValidationPipe } from '@nestjs/common';
import { ImageProcessingService } from '../../src/upload/image-processing.service';
import {
  createTestCategory,
  createTestCreateCategoryDto,
  createTestUpdateCategoryDto,
  createTestPrismaCategoryData,
  createMockPrismaService,
} from '../test-utils';
import { PriceType } from '../../src/modules/category/entities/category.entity';

describe('Category Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let createdCategoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CategoryModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.category.deleteMany();
  });

  afterAll(async () => {
    // Clean up database after all tests
    await prismaService.category.deleteMany();
    await prismaService.$disconnect();
    await app.close();
  });

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const createCategoryDto = createTestCreateCategoryDto();

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(createCategoryDto)
        .expect(201);

      expect(response.body).toMatchObject({
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        type: createCategoryDto.type,
        priceInfo: createCategoryDto.priceInfo,
        isVisible: createCategoryDto.isVisible,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      createdCategoryId = response.body.id;
    });

    it('should create category with minimal required fields', async () => {
      const minimalDto = { name: '最小分类' };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(minimalDto)
        .expect(201);

      expect(response.body.name).toBe(minimalDto.name);
      expect(response.body.isVisible).toBe(true); // Default value
      expect(response.body.priceInfo).toBeDefined(); // Default value
    });

    it('should validate required fields', async () => {
      const invalidDto = {}; // Missing required name field

      await request(app.getHttpServer())
        .post('/categories')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate field types and constraints', async () => {
      const invalidDto = {
        name: '', // Empty name
        priceInfo: { unitPrice: -1 }, // Negative price
        sortOrder: 'invalid', // Invalid type
      };

      await request(app.getHttpServer())
        .post('/categories')
        .send(invalidDto)
        .expect(400);
    });

    it('should handle duplicate category names', async () => {
      const categoryDto = createTestCreateCategoryDto();

      // Create first category
      await request(app.getHttpServer())
        .post('/categories')
        .send(categoryDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/categories')
        .send(categoryDto)
        .expect(409); // Conflict
    });

    it('should handle special characters in category data', async () => {
      const specialCharDto = {
        name: '特殊字符分类!@#$%',
        description: '包含特殊字符的描述：《》？：""{} []',
        unitPrice: 15.99,
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(specialCharDto)
        .expect(201);

      expect(response.body.name).toBe(specialCharDto.name);
      expect(response.body.description).toBe(specialCharDto.description);
    });
  });

  describe('GET /categories', () => {
    beforeEach(async () => {
      // Create test categories
      const categories = [
        createTestPrismaCategoryData({ name: '塑料', description: '塑料制品', priceInfo: { type: 'UNIT', unitPrice: 2.5, unit: 'kg', currency: 'CNY' }, isVisible: true }),
        createTestPrismaCategoryData({ name: '金属', description: '金属制品', priceInfo: { type: 'UNIT', unitPrice: 5.0, unit: 'kg', currency: 'CNY' }, isVisible: true }),
        createTestPrismaCategoryData({ name: '纸张', description: '纸质制品', priceInfo: { type: 'UNIT', unitPrice: 1.0, unit: 'kg', currency: 'CNY' }, isVisible: false }),
      ];

      for (const category of categories) {
        await prismaService.category.create({ data: category });
      }
    });

    it('should return all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('priceInfo');
      expect(response.body[0]).toHaveProperty('isVisible');
    });

    it('should return empty array when no categories exist', async () => {
      await prismaService.category.deleteMany();

      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /categories/active', () => {
    beforeEach(async () => {
      const categories = [
        createTestPrismaCategoryData({ name: '活跃分类1', isVisible: true, priceInfo: { type: 'UNIT', unitPrice: 2.5, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '活跃分类2', isVisible: true, priceInfo: { type: 'UNIT', unitPrice: 3.0, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '非活跃分类', isVisible: false, priceInfo: { type: 'UNIT', unitPrice: 1.0, unit: 'kg', currency: 'CNY' } }),
      ];

      for (const category of categories) {
        await prismaService.category.create({ data: category });
      }
    });

    it('should return only active categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/active')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(cat => cat.isVisible)).toBe(true);
    });
  });

  describe('GET /categories/recycle', () => {
    beforeEach(async () => {
      const categories = [
        createTestPrismaCategoryData({ name: '回收分类1', type: 'RECYCLE', priceInfo: { type: 'UNIT', unitPrice: 2.5, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '回收分类2', type: 'RECYCLE', priceInfo: { type: 'UNIT', unitPrice: 3.0, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '销售分类', type: 'SALE', priceInfo: { type: 'UNIT', unitPrice: 10.0, unit: 'kg', currency: 'CNY' } }),
      ];

      for (const category of categories) {
        await prismaService.category.create({ data: category });
      }
    });

    it('should return only recycle categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/recycle')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(cat => cat.type === 'RECYCLE')).toBe(true);
    });
  });

  describe('GET /categories/sale', () => {
    beforeEach(async () => {
      const categories = [
        createTestPrismaCategoryData({ name: '销售分类1', type: 'SALE', priceInfo: { type: 'UNIT', unitPrice: 15.0, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '销售分类2', type: 'SALE', priceInfo: { type: 'UNIT', unitPrice: 20.0, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '回收分类', type: 'RECYCLE', priceInfo: { type: 'UNIT', unitPrice: 2.5, unit: 'kg', currency: 'CNY' } }),
      ];

      for (const category of categories) {
        await prismaService.category.create({ data: category });
      }
    });

    it('should return only sale categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/sale')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(cat => cat.type === 'SALE')).toBe(true);
    });
  });

  describe('GET /categories/search', () => {
    beforeEach(async () => {
      const categories = [
        createTestPrismaCategoryData({ name: '塑料瓶', description: '塑料制品', priceInfo: { type: 'UNIT', unitPrice: 2.5, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '塑料袋', description: '塑料制品', priceInfo: { type: 'UNIT', unitPrice: 1.0, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '金属罐', description: '金属制品', priceInfo: { type: 'UNIT', unitPrice: 5.0, unit: 'kg', currency: 'CNY' } }),
        createTestPrismaCategoryData({ name: '纸箱', description: '纸质制品', priceInfo: { type: 'UNIT', unitPrice: 1.5, unit: 'kg', currency: 'CNY' } }),
      ];

      for (const category of categories) {
        await prismaService.category.create({ data: category });
      }
    });

    it('should search categories by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/search')
        .query({ keyword: '塑料' })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every(cat => cat.name.includes('塑料'))).toBe(true);
    });

    it('should search categories by description', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/search')
        .query({ keyword: '金属制品' })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].description).toContain('金属制品');
    });

    it('should return empty array for non-matching search', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/search')
        .query({ keyword: '不存在的分类' })
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle empty search keyword', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/search')
        .query({ keyword: '' })
        .expect(200);

      expect(response.body).toHaveLength(4); // Should return all categories
    });
  });

  describe('GET /categories/:id', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await prismaService.category.create({
        data: createTestPrismaCategoryData(),
      });
      categoryId = category.id.toString();
    });

    it('should return a category by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
    });

    it('should return 404 for non-existent category', async () => {
      const nonExistentId = '999999';

      await request(app.getHttpServer())
        .get(`/categories/${nonExistentId}`)
        .expect(404);
    });

    it('should handle invalid id format', async () => {
      await request(app.getHttpServer())
        .get('/categories/invalid-id')
        .expect(400);
    });
  });

  describe('PATCH /categories/:id', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await prismaService.category.create({
        data: createTestPrismaCategoryData(),
      });
      categoryId = category.id.toString();
    });

    it('should update a category', async () => {
      const updateDto = createTestUpdateCategoryDto({
        name: '更新后的分类',
        priceInfo: { type: PriceType.FIXED, unitPrice: 99.99, unit: 'kg', currency: 'CNY' },
      });

      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.priceInfo.unitPrice).toBe(updateDto.priceInfo.unitPrice);
      expect(response.body.updatedAt).not.toBe(response.body.createdAt);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: '部分更新' };

      const response = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.name).toBe(partialUpdate.name);
      // Other fields should remain unchanged
      expect(response.body.description).toBeDefined();
    });

    it('should return 404 for non-existent category', async () => {
      const updateDto = createTestUpdateCategoryDto();

      await request(app.getHttpServer())
        .patch('/categories/999999')
        .send(updateDto)
        .expect(404);
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        unitPrice: -1, // Invalid negative price
        sortOrder: 'invalid', // Invalid type
      };

      await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .send(invalidUpdate)
        .expect(400);
    });
  });

  describe('DELETE /categories/:id', () => {
    let categoryId: string;

    beforeEach(async () => {
      const category = await prismaService.category.create({
        data: createTestPrismaCategoryData(),
      });
      categoryId = category.id.toString();
    });

    it('should delete a category', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);

      // Verify category is deleted
      await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(404);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/categories/999999')
        .expect(404);
    });

    it('should handle deletion of category with dependencies', async () => {
      // This test would depend on your business logic
      // For example, if categories have related items, deletion might be restricted
      
      const response = await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .expect(200);

      expect(response.body.id).toBe(categoryId);
    });
  });

  describe('Performance and Load Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const createRequests = Array.from({ length: 10 }, (_, index) => 
        request(app.getHttpServer())
          .post('/categories')
          .send({
            name: `并发分类${index}`,
            unitPrice: index * 1.5,
          })
      );

      const responses = await Promise.all(createRequests);
      
      expect(responses).toHaveLength(10);
      expect(responses.every(res => res.status === 201)).toBe(true);
    });

    it('should handle large dataset queries efficiently', async () => {
      // Create many categories
      const categories = Array.from({ length: 100 }, (_, index) => 
        createTestPrismaCategoryData({
          name: `大量数据分类${index}`,
          priceInfo: { type: PriceType.FIXED, unitPrice: index * 0.1, unit: 'kg', currency: 'CNY' },
        })
      );

      for (const category of categories) {
        await prismaService.category.create({ data: category });
      }

      const startTime = Date.now();
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);
      const endTime = Date.now();

      expect(response.body).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Data Integrity Tests', () => {
    it('should maintain data consistency during updates', async () => {
      const category = await prismaService.category.create({
        data: createTestPrismaCategoryData(),
      });

      const originalCreatedAt = category.createdAt;

      // Update the category
      const response = await request(app.getHttpServer())
        .patch(`/categories/${category.id}`)
        .send({ name: '更新后的名称' })
        .expect(200);

      expect(response.body.createdAt).toBe(originalCreatedAt.toISOString());
      expect(new Date(response.body.updatedAt)).toBeInstanceOf(Date);
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(
        originalCreatedAt.getTime()
      );
    });

    it('should handle database constraints properly', async () => {
      // Test unique constraints, foreign key constraints, etc.
      const categoryData = createTestCreateCategoryDto();

      // Create first category
      await request(app.getHttpServer())
        .post('/categories')
        .send(categoryData)
        .expect(201);

      // Try to create duplicate (if name should be unique)
      await request(app.getHttpServer())
        .post('/categories')
        .send(categoryData)
        .expect(409);
    });
  });
});