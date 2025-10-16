import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') });

// Set global Jest timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Global setup logic
});

afterAll(async () => {
  // Global cleanup logic
});

// Per-test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});