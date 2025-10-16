import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CourierStatus, NotificationPriority } from '../src/modules/courier/entities/courier.entity';

describe('CourierController (e2e)', () => {
  let app: INestApplication;
  let createdCourierId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 启用全局验证管道
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/couriers (POST)', () => {
    it('should create a new courier', () => {
      const courierData = {
        name: '张三',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        workingHours: {
          startTime: '09:00',
          endTime: '18:00',
          workingDays: [1, 2, 3, 4, 5]
        },
        serviceAreas: ['海淀区', '朝阳区']
      };

      return request(app.getHttpServer())
        .post('/couriers')
        .send(courierData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(courierData.name);
          expect(res.body.phone).toBe(courierData.phone);
          expect(res.body.email).toBe(courierData.email);
          expect(res.body.status).toBe(CourierStatus.AVAILABLE);
          createdCourierId = res.body.id;
        });
    });

    it('should return 400 for invalid courier data', () => {
      const invalidCourierData = {
        name: '',
        phone: 'invalid-phone',
        email: 'invalid-email'
      };

      return request(app.getHttpServer())
        .post('/couriers')
        .send(invalidCourierData)
        .expect(400);
    });
  });

  describe('/couriers (GET)', () => {
    beforeEach(async () => {
      // Create a test courier
      const courierData = {
        name: '李四',
        phone: '13800138002',
        email: 'lisi@example.com',
        workingHours: {
          startTime: '08:00',
          endTime: '17:00',
          workingDays: [1, 2, 3, 4, 5, 6]
        },
        serviceAreas: ['西城区']
      };

      const response = await request(app.getHttpServer())
        .post('/couriers')
        .send(courierData);
      
      createdCourierId = response.body.id;
    });

    it('should return all couriers', () => {
      return request(app.getHttpServer())
        .get('/couriers')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter couriers by status', () => {
      return request(app.getHttpServer())
        .get('/couriers?status=AVAILABLE')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(courier => {
            expect(courier.status).toBe('AVAILABLE');
          });
        });
    });

    it('should filter couriers by service area', () => {
      return request(app.getHttpServer())
        .get('/couriers?serviceArea=' + encodeURIComponent('西城区'))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach(courier => {
            expect(courier.serviceAreas).toContain('西城区');
          });
        });
    });
  });

  describe('/couriers/:id (GET)', () => {
    beforeEach(async () => {
      // Create a test courier
      const courierData = {
        name: '王五',
        phone: '13800138003',
        email: 'wangwu@example.com',
        workingHours: {
          startTime: '10:00',
          endTime: '19:00',
          workingDays: [1, 2, 3, 4, 5]
        },
        serviceAreas: ['东城区']
      };

      const response = await request(app.getHttpServer())
        .post('/couriers')
        .send(courierData);
      
      createdCourierId = response.body.id;
    });

    it('should return a courier by id', () => {
      return request(app.getHttpServer())
        .get(`/couriers/${createdCourierId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdCourierId);
          expect(res.body.name).toBe('王五');
        });
    });

    it('should return 404 for non-existent courier', () => {
      return request(app.getHttpServer())
        .get('/couriers/non-existent-id')
        .expect(404);
    });
  });

  describe('/couriers/:id (PUT)', () => {
    beforeEach(async () => {
      // Create a test courier
      const courierData = {
        name: '赵六',
        phone: '13800138004',
        email: 'zhaoliu@example.com',
        workingHours: {
          startTime: '09:00',
          endTime: '18:00',
          workingDays: [1, 2, 3, 4, 5]
        },
        serviceAreas: ['丰台区']
      };

      const response = await request(app.getHttpServer())
        .post('/couriers')
        .send(courierData);
      
      createdCourierId = response.body.id;
    });

    it('should update courier information', () => {
      const updateData = {
        name: '赵六更新',
        phone: '13800138005',
        status: CourierStatus.BUSY
      };

      return request(app.getHttpServer())
        .put(`/couriers/${createdCourierId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.phone).toBe(updateData.phone);
          expect(res.body.status).toBe(updateData.status);
        });
    });

    it('should return 404 for non-existent courier', () => {
      const updateData = {
        name: '不存在的快递员'
      };

      return request(app.getHttpServer())
        .put('/couriers/non-existent-id')
        .send(updateData)
        .expect(404);
    });
  });

  describe('/couriers/:id/location (PUT)', () => {
    beforeEach(async () => {
      // Create a test courier
      const courierData = {
        name: '孙七',
        phone: '13800138006',
        email: 'sunqi@example.com',
        workingHours: {
          startTime: '09:00',
          endTime: '18:00',
          workingDays: [1, 2, 3, 4, 5]
        },
        serviceAreas: ['石景山区']
      };

      const response = await request(app.getHttpServer())
        .post('/couriers')
        .send(courierData);
      
      createdCourierId = response.body.id;
    });

    it('should update courier location', () => {
      const locationData = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市西城区天安门广场'
      };

      return request(app.getHttpServer())
        .put(`/couriers/${createdCourierId}/location`)
        .send(locationData)
        .expect(200)
        .expect((res) => {
          expect(res.body.location.latitude).toBe(locationData.latitude);
          expect(res.body.location.longitude).toBe(locationData.longitude);
          expect(res.body.location.address).toBe(locationData.address);
        });
    });

    it('should return 404 for non-existent courier', () => {
      const locationData = {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市西城区天安门广场'
      };

      return request(app.getHttpServer())
        .put('/couriers/non-existent-id/location')
        .send(locationData)
        .expect(404);
    });
  });

  describe('/couriers/notifications (POST)', () => {
    beforeEach(async () => {
      // Create a test courier
      const courierData = {
        name: '周八',
        phone: '13800138007',
        email: 'zhouba@example.com',
        workingHours: {
          startTime: '09:00',
          endTime: '18:00',
          workingDays: [1, 2, 3, 4, 5]
        },
        serviceAreas: ['通州区']
      };

      const response = await request(app.getHttpServer())
        .post('/couriers')
        .send(courierData);
      
      createdCourierId = response.body.id;
    });

    it('should handle pickup notification', () => {
      const notificationData = {
        taskId: 'task-123',
        orderId: 'order-123',
        orderNo: 'ORD20241011001',
        courierId: createdCourierId,
        senderInfo: {
          name: '张先生',
          phone: '13800138008',
          address: '北京市海淀区中关村大街1号'
        },
        receiverInfo: {
          name: '李女士',
          phone: '13800138009',
          address: '北京市朝阳区建国门外大街1号'
        },
        goodsInfo: [{
          name: '笔记本电脑',
          category: 'electronics',
          weight: 2.5,
          value: 1000,
          fragile: true,
          description: '笔记本电脑'
        }],
        priority: NotificationPriority.HIGH
      };

      return request(app.getHttpServer())
        .post('/couriers/notifications')
        .send(notificationData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.taskId).toBe(notificationData.taskId);
          expect(res.body.courierId).toBe(createdCourierId);
        });
    });

    it('should return 404 for non-existent courier', () => {
      const notificationData = {
        taskId: 'task-456',
        orderId: 'order-456',
        orderNo: 'ORD20241011002',
        courierId: 'non-existent-courier',
        senderInfo: {
          name: '张先生',
          phone: '13800138008',
          address: '北京市海淀区中关村大街1号'
        },
        receiverInfo: {
          name: '李女士',
          phone: '13800138009',
          address: '北京市朝阳区建国门外大街1号'
        },
        goodsInfo: [{
          name: '手机',
          category: 'electronics',
          weight: 0.5,
          value: 500,
          fragile: true,
          description: '智能手机'
        }],
        priority: NotificationPriority.NORMAL
      };

      return request(app.getHttpServer())
        .post('/couriers/notifications')
        .send(notificationData)
        .expect(404);
    });
  });
});