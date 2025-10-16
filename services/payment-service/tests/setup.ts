// Jest setup file for payment-service tests
// This file runs before all tests

// Set test timeout
jest.setTimeout(30000);

// Mock environment variables if needed
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/payment_db';
