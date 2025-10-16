import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Global setup logic if needed
  console.log('Setting up notification service tests...');
});

// Global test teardown
afterAll(async () => {
  // Global cleanup logic if needed
  console.log('Cleaning up notification service tests...');
});

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset console mocks before each test
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods after each test
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});