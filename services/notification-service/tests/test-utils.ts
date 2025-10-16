import { Test, TestingModule } from '@nestjs/testing';

// Test data generators
export const generateSmsData = (overrides: Partial<{ phoneNumber: string; message: string }> = {}) => ({
  phoneNumber: '+1234567890',
  message: 'Test SMS message',
  ...overrides,
});

export const generateEmailData = (overrides: Partial<{ to: string; subject: string; body: string }> = {}) => ({
  to: 'test@example.com',
  subject: 'Test Email Subject',
  body: 'Test email body content',
  ...overrides,
});

export const generatePushData = (overrides: Partial<{ userId: string; title: string; body: string }> = {}) => ({
  userId: 'user-123',
  title: 'Test Push Title',
  body: 'Test push notification body',
  ...overrides,
});

// Mock response generators
export const generateSmsResponse = (overrides: Partial<{ success: boolean; messageId: string; error?: string }> = {}) => ({
  success: true,
  messageId: 'sms-123456',
  ...overrides,
});

export const generateEmailResponse = (overrides: Partial<{ success: boolean; messageId: string; error?: string }> = {}) => ({
  success: true,
  messageId: 'email-123456',
  ...overrides,
});

export const generatePushResponse = (overrides: Partial<{ success: boolean; messageId: string; error?: string }> = {}) => ({
  success: true,
  messageId: 'push-123456',
  ...overrides,
});

// Mock request and response objects
export const mockRequest = (overrides: any = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: { id: 'user-123', email: 'test@example.com' },
  ...overrides,
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

// Helper function to create testing module
export const createTestingModule = async (providers: any[] = [], controllers: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    controllers,
    providers,
  }).compile();

  return module;
};

// Mock external services
export const mockSmsService = {
  send: jest.fn(),
  validatePhoneNumber: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

export const mockEmailService = {
  send: jest.fn(),
  validateEmail: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

export const mockPushService = {
  send: jest.fn(),
  registerDevice: jest.fn(),
  unregisterDevice: jest.fn(),
  getDeliveryStatus: jest.fn(),
};

// Test constants
export const TEST_CONSTANTS = {
  VALID_PHONE_NUMBER: '+1234567890',
  INVALID_PHONE_NUMBER: 'invalid-phone',
  VALID_EMAIL: 'test@example.com',
  INVALID_EMAIL: 'invalid-email',
  VALID_USER_ID: 'user-123',
  INVALID_USER_ID: '',
  TEST_MESSAGE: 'Test message content',
  TEST_SUBJECT: 'Test subject',
  TEST_TITLE: 'Test title',
};