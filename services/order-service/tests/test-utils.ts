import { CreateRecycleOrderDto } from '../src/order/dto/create-recycle-order.dto';
import { CreateSaleOrderDto } from '../src/order/dto/create-sale-order.dto';
import { UpdateOrderDto } from '../src/order/dto/update-order.dto';
import { OrderStatus } from '../src/order/entities/order.entity';

// 生成测试回收订单数据
export const createTestRecycleOrder = (overrides?: Partial<CreateRecycleOrderDto>): CreateRecycleOrderDto => ({
  userId: 1,
  addressId: 1,
  expectPickupTime: '2024-01-15T10:00:00Z',
  remark: '测试回收订单',
  items: [
    {
      categoryId: 1,
      name: '测试物品',
      estimatedQuantity: 1,
      unit: 'kg'
    }
  ],
  ...overrides,
});

// 生成测试销售订单数据
export const createTestSaleOrder = (overrides?: Partial<CreateSaleOrderDto>): CreateSaleOrderDto => ({
  userId: 1,
  addressId: 1,
  expectDeliveryTime: '2024-01-15T14:00:00Z',
  remark: '测试销售订单',
  items: [
    {
      inventoryItemId: 1,
      quantity: 2,
      unitPrice: 25.00
    }
  ],
  ...overrides,
});

// 生成测试订单更新数据
export const createTestUpdateOrder = (overrides?: Partial<UpdateOrderDto>): UpdateOrderDto => ({
  status: OrderStatus.PROCESSING,
  remark: '更新测试订单',
  ...overrides,
});

// 生成测试订单数据
export const createTestOrder = (overrides?: any) => ({
  id: BigInt(1),
  orderNo: 'ORD1234567890123',
  userId: BigInt(1),
  addressId: BigInt(1),
  status: 'PENDING',
  expectPickupTime: new Date('2024-01-15T10:00:00Z'),
  actualPickupTime: null,
  expectDeliveryTime: null,
  actualDeliveryTime: null,
  estimatedAmount: '55.00',
  settlementAmount: null,
  payAmount: null,
  channel: 'APP',
  remark: '测试订单',
  createdAt: new Date(),
  updatedAt: new Date(),
  items: [
    {
      id: BigInt(1),
      orderId: BigInt(1),
      categoryId: BigInt(1),
      inventoryId: null,
      estimatedWeight: '5.5',
      actualWeight: null,
      unitPrice: '10.00',
      quantity: 1,
      totalAmount: '55.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ],
  assignments: [],
  ...overrides,
});

// 生成测试分配数据
export const createTestAssignment = (overrides?: any) => ({
  id: BigInt(1),
  orderId: BigInt(1),
  courierId: BigInt(1),
  status: 'ASSIGNED',
  acceptedAt: null,
  arrivedAt: null,
  finishedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// 模拟PrismaService
export const mockPrismaService = () => ({
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  orderItem: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  assignment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
});

// 模拟InventoryService
export const mockInventoryService = () => ({
  findOne: jest.fn(),
  updateStock: jest.fn(),
  checkStock: jest.fn(),
  reserveStock: jest.fn(),
  releaseStock: jest.fn(),
});

// 模拟DispatchClientService
export const mockDispatchClientService = () => ({
  createDispatchTask: jest.fn(),
  updateDispatchStatus: jest.fn(),
  getDispatchInfo: jest.fn(),
});

// 清理测试数据库
export const cleanupTestDatabase = async (prisma: any) => {
  await prisma.assignment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
};