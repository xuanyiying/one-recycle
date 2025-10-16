import { Test, TestingModule } from '@nestjs/testing';
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

describe('NotificationService', () => {
  let service: NotificationService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendSms', () => {
    it('should send SMS successfully', async () => {
      const phoneNumber = TEST_CONSTANTS.VALID_PHONE_NUMBER;
      const message = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendSms(phoneNumber, message);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending SMS to ${phoneNumber}: ${message}`);
    });

    it('should handle empty phone number', async () => {
      const phoneNumber = '';
      const message = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendSms(phoneNumber, message);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending SMS to ${phoneNumber}: ${message}`);
    });

    it('should handle empty message', async () => {
      const phoneNumber = TEST_CONSTANTS.VALID_PHONE_NUMBER;
      const message = '';

      const result = await service.sendSms(phoneNumber, message);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending SMS to ${phoneNumber}: ${message}`);
    });

    it('should handle special characters in message', async () => {
      const phoneNumber = TEST_CONSTANTS.VALID_PHONE_NUMBER;
      const message = 'Test message with special chars: @#$%^&*()';

      const result = await service.sendSms(phoneNumber, message);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending SMS to ${phoneNumber}: ${message}`);
    });

    it('should handle long message', async () => {
      const phoneNumber = TEST_CONSTANTS.VALID_PHONE_NUMBER;
      const message = 'A'.repeat(1000);

      const result = await service.sendSms(phoneNumber, message);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending SMS to ${phoneNumber}: ${message}`);
    });

    it('should handle international phone number', async () => {
      const phoneNumber = '+86138000000000';
      const message = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendSms(phoneNumber, message);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending SMS to ${phoneNumber}: ${message}`);
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const to = TEST_CONSTANTS.VALID_EMAIL;
      const subject = TEST_CONSTANTS.TEST_SUBJECT;
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendEmail(to, subject, body);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Email to ${to} with subject: ${subject}`);
    });

    it('should handle empty email address', async () => {
      const to = '';
      const subject = TEST_CONSTANTS.TEST_SUBJECT;
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendEmail(to, subject, body);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Email to ${to} with subject: ${subject}`);
    });

    it('should handle empty subject', async () => {
      const to = TEST_CONSTANTS.VALID_EMAIL;
      const subject = '';
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendEmail(to, subject, body);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Email to ${to} with subject: ${subject}`);
    });

    it('should handle empty body', async () => {
      const to = TEST_CONSTANTS.VALID_EMAIL;
      const subject = TEST_CONSTANTS.TEST_SUBJECT;
      const body = '';

      const result = await service.sendEmail(to, subject, body);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Email to ${to} with subject: ${subject}`);
    });

    it('should handle HTML content in body', async () => {
      const to = TEST_CONSTANTS.VALID_EMAIL;
      const subject = TEST_CONSTANTS.TEST_SUBJECT;
      const body = '<h1>Test HTML Email</h1><p>This is a test email with HTML content.</p>';

      const result = await service.sendEmail(to, subject, body);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Email to ${to} with subject: ${subject}`);
    });

    it('should handle multiple recipients', async () => {
      const to = 'test1@example.com,test2@example.com';
      const subject = TEST_CONSTANTS.TEST_SUBJECT;
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendEmail(to, subject, body);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Email to ${to} with subject: ${subject}`);
    });

    it('should handle special characters in subject', async () => {
      const to = TEST_CONSTANTS.VALID_EMAIL;
      const subject = 'Test Subject with Special Chars: @#$%^&*()';
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendEmail(to, subject, body);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Email to ${to} with subject: ${subject}`);
    });
  });

  describe('sendPush', () => {
    it('should send push notification successfully', async () => {
      const userId = TEST_CONSTANTS.VALID_USER_ID;
      const title = TEST_CONSTANTS.TEST_TITLE;
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });

    it('should handle empty user ID', async () => {
      const userId = '';
      const title = TEST_CONSTANTS.TEST_TITLE;
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });

    it('should handle empty title', async () => {
      const userId = TEST_CONSTANTS.VALID_USER_ID;
      const title = '';
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });

    it('should handle empty body', async () => {
      const userId = TEST_CONSTANTS.VALID_USER_ID;
      const title = TEST_CONSTANTS.TEST_TITLE;
      const body = '';

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });

    it('should handle long title', async () => {
      const userId = TEST_CONSTANTS.VALID_USER_ID;
      const title = 'A'.repeat(100);
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });

    it('should handle long body', async () => {
      const userId = TEST_CONSTANTS.VALID_USER_ID;
      const title = TEST_CONSTANTS.TEST_TITLE;
      const body = 'A'.repeat(500);

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });

    it('should handle special characters in title and body', async () => {
      const userId = TEST_CONSTANTS.VALID_USER_ID;
      const title = 'Title with special chars: @#$%^&*()';
      const body = 'Body with special chars: @#$%^&*()';

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });

    it('should handle numeric user ID', async () => {
      const userId = '12345';
      const title = TEST_CONSTANTS.TEST_TITLE;
      const body = TEST_CONSTANTS.TEST_MESSAGE;

      const result = await service.sendPush(userId, title, body);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith(`Sending Push to user ${userId} with title: ${title}`);
    });
  });

  describe('error handling', () => {
    it('should handle null parameters in sendSms', async () => {
      const result = await service.sendSms(null as any, null as any);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith('Sending SMS to null: null');
    });

    it('should handle null parameters in sendEmail', async () => {
      const result = await service.sendEmail(null as any, null as any, null as any);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith('Sending Email to null with subject: null');
    });

    it('should handle null parameters in sendPush', async () => {
      const result = await service.sendPush(null as any, null as any, null as any);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith('Sending Push to user null with title: null');
    });

    it('should handle undefined parameters in sendSms', async () => {
      const result = await service.sendSms(undefined as any, undefined as any);

      expect(result).toEqual(generateSmsResponse());
      expect(consoleSpy).toHaveBeenCalledWith('Sending SMS to undefined: undefined');
    });

    it('should handle undefined parameters in sendEmail', async () => {
      const result = await service.sendEmail(undefined as any, undefined as any, undefined as any);

      expect(result).toEqual(generateEmailResponse());
      expect(consoleSpy).toHaveBeenCalledWith('Sending Email to undefined with subject: undefined');
    });

    it('should handle undefined parameters in sendPush', async () => {
      const result = await service.sendPush(undefined as any, undefined as any, undefined as any);

      expect(result).toEqual(generatePushResponse());
      expect(consoleSpy).toHaveBeenCalledWith('Sending Push to user undefined with title: undefined');
    });
  });
});