import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set Jest timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3006';
  process.env.ORDER_SERVICE_URL = 'http://localhost:3001';
  process.env.COURIER_SERVICE_URL = 'http://localhost:3002';
  process.env.JD_APP_KEY = 'test-app-key';
  process.env.JD_APP_SECRET = 'test-app-secret';
  process.env.JD_CUSTOMER_CODE = 'test-customer-code';
  process.env.JD_API_BASE_URL = 'https://api-test.jdl.com';
  process.env.JD_API_TIMEOUT = '30000';

  // Mock console methods to reduce test output
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Global test cleanup
afterAll(async () => {
  // Restore console methods
  jest.restoreAllMocks();
});