/**
 * 测试工具函数
 */

export const mockPrismaService = {
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  refund: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

export function createTestPaymentDto() {
  return {
    orderId: '123',
    amount: 100.00,
    provider: 'ALIPAY',
    currency: 'CNY',
    method: 'ALIPAY',
    description: 'Test payment',
  };
}

export function createTestPaymentRecord() {
  return {
    id: '1',
    orderId: '123',
    amount: 100.00,
    currency: 'CNY',
    method: 'ALIPAY',
    status: 'PENDING',
    description: 'Test payment',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createTestRefundRecord() {
  return {
    id: '1',
    paymentId: '1',
    amount: 50.00,
    reason: 'Customer request',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}