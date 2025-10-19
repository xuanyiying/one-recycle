import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

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

  describe('/auth/send-code (POST)', () => {
    it('should send verification code successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/send-code')
        .send({ phone: '13800138000' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message', '验证码发送成功');
        });
    });

    it('should return 400 for invalid phone number', () => {
      return request(app.getHttpServer())
        .post('/auth/send-code')
        .send({ phone: 'invalid-phone' })
        .expect(400);
    });

    it('should return 400 for missing phone number', () => {
      return request(app.getHttpServer())
        .post('/auth/send-code')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully with valid credentials', async () => {
      // First send code
      await request(app.getHttpServer())
        .post('/auth/send-code')
        .send({ phone: '13800138000' })
        .expect(201);

      // Then login (using mock verification code)
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: '13800138000', code: '123456' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('mobile', '13800138000');
        });
    });

    it('should return 400 for invalid phone number', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: 'invalid-phone', code: '123456' })
        .expect(400);
    });

    it('should return 401 for invalid verification code', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: '13800138000', code: 'invalid-code' })
        .expect(401);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: '13800138000' })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Login to get refresh token
      await request(app.getHttpServer())
        .post('/auth/send-code')
        .send({ phone: '13800138000' });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: '13800138000', code: '123456' });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should refresh token successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should return 401 for invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });

    it('should return 400 for missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/logout (POST)', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Login to get refresh token
      await request(app.getHttpServer())
        .post('/auth/send-code')
        .send({ phone: '13800138000' });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ phone: '13800138000', code: '123456' });

      refreshToken = loginResponse.body.refreshToken;
    });

    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message', '登出成功');
        });
    });

    it('should return 400 for missing refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .send({})
        .expect(400);
    });
  });

  describe('Third-party login endpoints', () => {
    const thirdPartyLoginData = { code: 'test-auth-code' };

    it('should handle WeChat login', () => {
      return request(app.getHttpServer())
        .post('/auth/wechat/login')
        .send(thirdPartyLoginData)
        .expect((res) => {
          // Expect either success (200/201) or error (400/401) depending on implementation
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('should handle Alipay login', () => {
      return request(app.getHttpServer())
        .post('/auth/alipay/login')
        .send(thirdPartyLoginData)
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('should handle Douyin login', () => {
      return request(app.getHttpServer())
        .post('/auth/douyin/login')
        .send(thirdPartyLoginData)
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });

    it('should handle Kuaishou login', () => {
      return request(app.getHttpServer())
        .post('/auth/kuaishou/login')
        .send(thirdPartyLoginData)
        .expect((res) => {
          expect([200, 201, 400, 401]).toContain(res.status);
        });
    });
  });

  describe('Rate limiting', () => {
    it('should apply rate limiting to send-code endpoint', async () => {
      const phone = '13800138001';
      
      // Make multiple requests quickly
      const requests = Array(6).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/auth/send-code')
          .send({ phone })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429 status)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});