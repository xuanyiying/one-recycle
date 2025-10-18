import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { UserStatus } from '@one-recycle/shared';
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {

    // Login to get access token
    await request(app.getHttpServer())
      .post('/auth/send-code')
      .send({ phone: '13800138000' });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ phone: '13800138000', code: '123456' });

    accessToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;
  });

  describe('/user/profile (GET)', () => {
    it('should get user profile successfully', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('mobile', '13800138000');
          expect(res.body).toHaveProperty('status', UserStatus.ACTIVE);
        });
    });

    it('should return 401 without authorization', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/user/profile (PUT)', () => {
    it('should update user profile successfully', () => {
      const updateData = {
        nickname: 'Updated Nickname',
        avatar: 'https://example.com/avatar.jpg',
      };

      return request(app.getHttpServer())
        .put('/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('nickname', updateData.nickname);
          expect(res.body).toHaveProperty('avatar', updateData.avatar);
        });
    });

    it('should return 401 without authorization', () => {
      return request(app.getHttpServer())
        .put('/user/profile')
        .send({ nickname: 'Test' })
        .expect(401);
    });

    it('should validate input data', () => {
      return request(app.getHttpServer())
        .put('/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ mobile: 'invalid-mobile' })
        .expect(400);
    });
  });

  describe('/user/status (PUT)', () => {
    it('should update user status successfully', () => {
      return request(app.getHttpServer())
        .put('/user/status')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: UserStatus.INACTIVE })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', UserStatus.INACTIVE);
        });
    });

    it('should return 401 without authorization', () => {
      return request(app.getHttpServer())
        .put('/user/status')
        .send({ status: UserStatus.INACTIVE })
        .expect(401);
    });

    it('should validate status value', () => {
      return request(app.getHttpServer())
        .put('/user/status')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('/user/account (DELETE)', () => {
    it('should delete user account successfully', () => {
      return request(app.getHttpServer())
        .delete('/user/account')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message', '用户删除成功');
        });
    });

    it('should return 401 without authorization', () => {
      return request(app.getHttpServer())
        .delete('/user/account')
        .expect(401);
    });
  });

  describe('Address management', () => {
    describe('/user/addresses (POST)', () => {
      it('should add address successfully', () => {
        const addressData = {
          name: 'John Doe',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '详细地址123号',
          isDefault: true,
        };

        return request(app.getHttpServer())
          .post('/user/addresses')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(addressData)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('name', addressData.name);
            expect(res.body).toHaveProperty('phone', addressData.phone);
            expect(res.body).toHaveProperty('province', addressData.province);
            expect(res.body).toHaveProperty('isDefault', addressData.isDefault);
            expect(res.body).toHaveProperty('userId', userId);
          });
      });

      it('should return 401 without authorization', () => {
        return request(app.getHttpServer())
          .post('/user/addresses')
          .send({ name: 'Test' })
          .expect(401);
      });

      it('should validate required fields', () => {
        return request(app.getHttpServer())
          .post('/user/addresses')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'John Doe' }) // Missing required fields
          .expect(400);
      });
    });

    describe('/user/addresses/:id (PUT)', () => {
      let addressId: string;

      beforeEach(async () => {
        const addressData = {
          name: 'John Doe',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '详细地址123号',
          isDefault: false,
        };

        const response = await request(app.getHttpServer())
          .post('/user/addresses')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(addressData);

        addressId = response.body.id;
      });

      it('should update address successfully', () => {
        const updateData = {
          name: 'Jane Doe',
          phone: '13900139000',
        };

        return request(app.getHttpServer())
          .put(`/user/addresses/${addressId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('name', updateData.name);
            expect(res.body).toHaveProperty('phone', updateData.phone);
          });
      });

      it('should return 401 without authorization', () => {
        return request(app.getHttpServer())
          .put(`/user/addresses/${addressId}`)
          .send({ name: 'Test' })
          .expect(401);
      });

      it('should return 404 for non-existent address', () => {
        return request(app.getHttpServer())
          .put('/user/addresses/non-existent-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'Test' })
          .expect(404);
      });
    });

    describe('/user/addresses/:id (DELETE)', () => {
      let addressId: string;

      beforeEach(async () => {
        const addressData = {
          name: 'John Doe',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '详细地址123号',
          isDefault: false,
        };

        const response = await request(app.getHttpServer())
          .post('/user/addresses')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(addressData);

        addressId = response.body.id;
      });

      it('should delete address successfully', () => {
        return request(app.getHttpServer())
          .delete(`/user/addresses/${addressId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message', '地址删除成功');
          });
      });

      it('should return 401 without authorization', () => {
        return request(app.getHttpServer())
          .delete(`/user/addresses/${addressId}`)
          .expect(401);
      });

      it('should return 404 for non-existent address', () => {
        return request(app.getHttpServer())
          .delete('/user/addresses/non-existent-id')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404);
      });
    });
  });

  describe('Authorization and security', () => {
    it('should not allow access to other users data', async () => {
      // Create another user
      await request(app.getHttpServer())
        .post('/auth/send-code')
        .send({ phone: '13800138001' });

      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: '13800138001', code: '123456' });

      const otherAccessToken = otherUserResponse.body.accessToken;

      // Create address with first user
      const addressResponse = await request(app.getHttpServer())
        .post('/user/addresses')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'John Doe',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '详细地址123号',
        });

      const addressId = addressResponse.body.id;

      // Try to access with second user's token
      return request(app.getHttpServer())
        .put(`/user/addresses/${addressId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .send({ name: 'Hacker' })
        .expect(404); // Should not find the address
    });

    it('should handle expired tokens', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJpYXQiOjE2MDk0NTkyMDAsImV4cCI6MTYwOTQ1OTIwMH0.invalid';

      return request(app.getHttpServer())
        .get('/user/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });
});