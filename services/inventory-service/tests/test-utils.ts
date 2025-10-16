import { PrismaService } from '../src/prisma.service';
import { Decimal } from '../prisma/generated/client/runtime/library';

/**
 * 创建测试用的库存商品数据
 */
export function createTestInventoryItem(overrides: any = {}) {
  return {
    id: BigInt(1),
    warehouseId: BigInt(1),
    categoryId: BigInt(1),
    name: '测试商品',
    description: '测试商品描述',
    unit: '个',
    quantity: new Decimal(100),
    availableQty: new Decimal(100),
    unitPrice: new Decimal(10.50),
    totalPrice: new Decimal(1050),
    location: 'A-01-01',
    status: 'IN_STOCK',
    itemType: 'ELECTRONICS',
    condition: 'NEW',
    processingStatus: 'PROCESSED',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * 创建测试用的仓库数据
 */
export function createTestWarehouse(overrides: any = {}) {
  return {
    id: BigInt(1),
    name: '测试仓库',
    address: '测试地址',
    contactPerson: '张三',
    contactPhone: '13800138000',
    capacity: new Decimal(10000),
    currentLoad: new Decimal(5000),
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * 创建测试用的库存交易数据
 */
export function createTestInventoryTransaction(overrides: any = {}) {
  return {
    id: BigInt(1),
    itemId: BigInt(1),
    type: 'IN',
    quantity: new Decimal(50),
    unitPrice: new Decimal(10.50),
    totalPrice: new Decimal(525),
    reason: '采购入库',
    operatorId: BigInt(1),
    operatorName: '操作员',
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * 创建测试用的质量检查数据
 */
export function createTestQualityCheck(overrides: any = {}) {
  return {
    id: BigInt(1),
    itemId: BigInt(1),
    checkType: 'INCOMING',
    result: 'PASS',
    score: 95,
    notes: '质量良好',
    checkedBy: '质检员',
    checkedAt: new Date(),
    ...overrides,
  };
}

/**
 * 创建测试用的销售记录数据
 */
export function createTestSalesRecord(overrides: any = {}) {
  return {
    id: BigInt(1),
    itemId: BigInt(1),
    quantity: new Decimal(5),
    unitPrice: new Decimal(15.00),
    totalPrice: new Decimal(75),
    orderId: 'ORDER-001',
    customerId: BigInt(1),
    soldAt: new Date(),
    notes: '正常销售',
    ...overrides,
  };
}

/**
 * 模拟Prisma服务
 */
export function createMockPrismaService() {
  return {
    inventoryItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    warehouse: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    inventoryTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      groupBy: jest.fn(),
    },
    qualityCheck: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    salesRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    stockAlert: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

/**
 * 清理测试数据库
 */
export async function cleanupTestDatabase(prisma: PrismaService) {
  // 按照外键依赖顺序删除数据
  await prisma['salesRecord'].deleteMany();
  await prisma['qualityCheck'].deleteMany();
  await prisma['inventoryTransaction'].deleteMany();
  await prisma['stockAlert'].deleteMany();
  await prisma['reservation'].deleteMany();
  await prisma['inventoryItem'].deleteMany();
  await prisma['warehouse'].deleteMany();
}