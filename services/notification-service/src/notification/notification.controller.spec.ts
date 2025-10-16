import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {
  generateSmsData,
  generateEmailData,
  generatePushData,
  generateSmsResponse,
  generateEmailResponse,
  generatePushResponse,
  TEST_CONSTANTS,
} from '../../tests/test-utils';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;

  const mockNotificationService = {
    sendSms: jest.fn(),
    sendEmail: jest.fn(),
    sendPush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendSms', () => {
    it('should send SMS successfully', async () => {
      const smsData = generateSmsData();
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(smsData);

      expect(service.sendSms).toHaveBeenCalledWith(smsData.phoneNumber, smsData.message);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle SMS with empty phone number', async () => {
      const smsData = generateSmsData({ phoneNumber: '' });
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(smsData);

      expect(service.sendSms).toHaveBeenCalledWith(smsData.phoneNumber, smsData.message);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle SMS with empty message', async () => {
      const smsData = generateSmsData({ message: '' });
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(smsData);

      expect(service.sendSms).toHaveBeenCalledWith(smsData.phoneNumber, smsData.message);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle SMS with international phone number', async () => {
      const smsData = generateSmsData({ phoneNumber: '+86138000000000' });
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(smsData);

      expect(service.sendSms).toHaveBeenCalledWith(smsData.phoneNumber, smsData.message);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle SMS with long message', async () => {
      const smsData = generateSmsData({ message: 'A'.repeat(1000) });
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(smsData);

      expect(service.sendSms).toHaveBeenCalledWith(smsData.phoneNumber, smsData.message);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle SMS service error', async () => {
      const smsData = generateSmsData();
      const error = new Error('SMS service unavailable');

      mockNotificationService.sendSms.mockRejectedValue(error);

      await expect(controller.sendSms(smsData)).rejects.toThrow('SMS service unavailable');
      expect(service.sendSms).toHaveBeenCalledWith(smsData.phoneNumber, smsData.message);
    });

    it('should handle SMS with special characters', async () => {
      const smsData = generateSmsData({ message: 'Test message with special chars: @#$%^&*()' });
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(smsData);

      expect(service.sendSms).toHaveBeenCalledWith(smsData.phoneNumber, smsData.message);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData = generateEmailData();
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(emailData);

      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle email with empty recipient', async () => {
      const emailData = generateEmailData({ to: '' });
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(emailData);

      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle email with empty subject', async () => {
      const emailData = generateEmailData({ subject: '' });
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(emailData);

      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle email with empty body', async () => {
      const emailData = generateEmailData({ body: '' });
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(emailData);

      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle email with HTML content', async () => {
      const emailData = generateEmailData({ 
        body: '<h1>Test HTML Email</h1><p>This is a test email with HTML content.</p>' 
      });
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(emailData);

      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle email with multiple recipients', async () => {
      const emailData = generateEmailData({ to: 'test1@example.com,test2@example.com' });
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(emailData);

      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle email service error', async () => {
      const emailData = generateEmailData();
      const error = new Error('Email service unavailable');

      mockNotificationService.sendEmail.mockRejectedValue(error);

      await expect(controller.sendEmail(emailData)).rejects.toThrow('Email service unavailable');
      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
    });

    it('should handle email with special characters in subject', async () => {
      const emailData = generateEmailData({ subject: 'Subject with special chars: @#$%^&*()' });
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(emailData);

      expect(service.sendEmail).toHaveBeenCalledWith(emailData.to, emailData.subject, emailData.body);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('sendPush', () => {
    it('should send push notification successfully', async () => {
      const pushData = generatePushData();
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle push with empty user ID', async () => {
      const pushData = generatePushData({ userId: '' });
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle push with empty title', async () => {
      const pushData = generatePushData({ title: '' });
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle push with empty body', async () => {
      const pushData = generatePushData({ body: '' });
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle push with long title', async () => {
      const pushData = generatePushData({ title: 'A'.repeat(100) });
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle push with long body', async () => {
      const pushData = generatePushData({ body: 'A'.repeat(500) });
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle push service error', async () => {
      const pushData = generatePushData();
      const error = new Error('Push service unavailable');

      mockNotificationService.sendPush.mockRejectedValue(error);

      await expect(controller.sendPush(pushData)).rejects.toThrow('Push service unavailable');
      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
    });

    it('should handle push with special characters', async () => {
      const pushData = generatePushData({ 
        title: 'Title with special chars: @#$%^&*()',
        body: 'Body with special chars: @#$%^&*()'
      });
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle push with numeric user ID', async () => {
      const pushData = generatePushData({ userId: '12345' });
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(pushData);

      expect(service.sendPush).toHaveBeenCalledWith(pushData.userId, pushData.title, pushData.body);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('error handling', () => {
    it('should handle malformed SMS data', async () => {
      const malformedData = { phoneNumber: null, message: undefined };
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(malformedData as any);

      expect(service.sendSms).toHaveBeenCalledWith(null, undefined);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle malformed email data', async () => {
      const malformedData = { to: null, subject: undefined, body: null };
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(malformedData as any);

      expect(service.sendEmail).toHaveBeenCalledWith(null, undefined, null);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle malformed push data', async () => {
      const malformedData = { userId: null, title: undefined, body: null };
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(malformedData as any);

      expect(service.sendPush).toHaveBeenCalledWith(null, undefined, null);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle missing SMS data properties', async () => {
      const incompleteData = { phoneNumber: TEST_CONSTANTS.VALID_PHONE_NUMBER };
      const expectedResponse = generateSmsResponse();

      mockNotificationService.sendSms.mockResolvedValue(expectedResponse);

      const result = await controller.sendSms(incompleteData as any);

      expect(service.sendSms).toHaveBeenCalledWith(TEST_CONSTANTS.VALID_PHONE_NUMBER, undefined);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle missing email data properties', async () => {
      const incompleteData = { to: TEST_CONSTANTS.VALID_EMAIL };
      const expectedResponse = generateEmailResponse();

      mockNotificationService.sendEmail.mockResolvedValue(expectedResponse);

      const result = await controller.sendEmail(incompleteData as any);

      expect(service.sendEmail).toHaveBeenCalledWith(TEST_CONSTANTS.VALID_EMAIL, undefined, undefined);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle missing push data properties', async () => {
      const incompleteData = { userId: TEST_CONSTANTS.VALID_USER_ID };
      const expectedResponse = generatePushResponse();

      mockNotificationService.sendPush.mockResolvedValue(expectedResponse);

      const result = await controller.sendPush(incompleteData as any);

      expect(service.sendPush).toHaveBeenCalledWith(TEST_CONSTANTS.VALID_USER_ID, undefined, undefined);
      expect(result).toEqual(expectedResponse);
    });
  });
});