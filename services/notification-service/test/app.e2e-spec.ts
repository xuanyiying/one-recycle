import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  generateSmsData,
  generateEmailData,
  generatePushData,
  generateSmsResponse,
  generateEmailResponse,
  generatePushResponse,
  TEST_CONSTANTS,
} from '../tests/test-utils';

describe('NotificationService (e2e)', () => {
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

  describe('Health Check', () => {
    it('/ (GET) - should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('SMS Notifications', () => {
    it('/notifications/send-sms (POST) - should send SMS successfully', () => {
      const smsData = generateSmsData();

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(smsData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });

    it('/notifications/send-sms (POST) - should handle empty phone number', () => {
      const smsData = generateSmsData({ phoneNumber: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(smsData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });

    it('/notifications/send-sms (POST) - should handle empty message', () => {
      const smsData = generateSmsData({ message: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(smsData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });

    it('/notifications/send-sms (POST) - should handle international phone number', () => {
      const smsData = generateSmsData({ phoneNumber: '+86138000000000' });

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(smsData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });

    it('/notifications/send-sms (POST) - should handle long message', () => {
      const smsData = generateSmsData({ message: 'A'.repeat(1000) });

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(smsData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });

    it('/notifications/send-sms (POST) - should handle special characters in message', () => {
      const smsData = generateSmsData({ message: 'Test message with special chars: @#$%^&*()' });

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(smsData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });

    it('/notifications/send-sms (POST) - should handle malformed request body', () => {
      const malformedData = { phoneNumber: null, message: undefined };

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(malformedData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });

    it('/notifications/send-sms (POST) - should handle missing request body', () => {
      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send({})
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateSmsResponse());
        });
    });
  });

  describe('Email Notifications', () => {
    it('/notifications/send-email (POST) - should send email successfully', () => {
      const emailData = generateEmailData();

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(emailData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle empty recipient', () => {
      const emailData = generateEmailData({ to: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(emailData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle empty subject', () => {
      const emailData = generateEmailData({ subject: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(emailData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle empty body', () => {
      const emailData = generateEmailData({ body: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(emailData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle HTML content in body', () => {
      const emailData = generateEmailData({ 
        body: '<h1>Test HTML Email</h1><p>This is a test email with HTML content.</p>' 
      });

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(emailData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle multiple recipients', () => {
      const emailData = generateEmailData({ to: 'test1@example.com,test2@example.com' });

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(emailData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle special characters in subject', () => {
      const emailData = generateEmailData({ subject: 'Subject with special chars: @#$%^&*()' });

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(emailData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle malformed request body', () => {
      const malformedData = { to: null, subject: undefined, body: null };

      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send(malformedData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });

    it('/notifications/send-email (POST) - should handle missing request body', () => {
      return request(app.getHttpServer())
        .post('/notifications/send-email')
        .send({})
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generateEmailResponse());
        });
    });
  });

  describe('Push Notifications', () => {
    it('/notifications/send-push (POST) - should send push notification successfully', () => {
      const pushData = generatePushData();

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle empty user ID', () => {
      const pushData = generatePushData({ userId: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle empty title', () => {
      const pushData = generatePushData({ title: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle empty body', () => {
      const pushData = generatePushData({ body: '' });

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle long title', () => {
      const pushData = generatePushData({ title: 'A'.repeat(100) });

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle long body', () => {
      const pushData = generatePushData({ body: 'A'.repeat(500) });

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle special characters', () => {
      const pushData = generatePushData({ 
        title: 'Title with special chars: @#$%^&*()',
        body: 'Body with special chars: @#$%^&*()'
      });

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle numeric user ID', () => {
      const pushData = generatePushData({ userId: '12345' });

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(pushData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle malformed request body', () => {
      const malformedData = { userId: null, title: undefined, body: null };

      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send(malformedData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });

    it('/notifications/send-push (POST) - should handle missing request body', () => {
      return request(app.getHttpServer())
        .post('/notifications/send-push')
        .send({})
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(generatePushResponse());
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', () => {
      return request(app.getHttpServer())
        .get('/invalid-route')
        .expect(404);
    });

    it('should handle invalid HTTP methods', () => {
      return request(app.getHttpServer())
        .get('/notifications/send-sms')
        .expect(404);
    });

    it('should handle malformed JSON in request body', () => {
      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('Content Type Handling', () => {
    it('should handle application/json content type', () => {
      const smsData = generateSmsData();

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .set('Content-Type', 'application/json')
        .send(smsData)
        .expect(201);
    });

    it('should handle missing content type', () => {
      const smsData = generateSmsData();

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .send(smsData)
        .expect(201);
    });
  });

  describe('Request Headers', () => {
    it('should handle custom headers', () => {
      const smsData = generateSmsData();

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .set('X-Custom-Header', 'test-value')
        .set('User-Agent', 'test-agent')
        .send(smsData)
        .expect(201);
    });

    it('should handle authorization headers', () => {
      const smsData = generateSmsData();

      return request(app.getHttpServer())
        .post('/notifications/send-sms')
        .set('Authorization', 'Bearer test-token')
        .send(smsData)
        .expect(201);
    });
  });
});