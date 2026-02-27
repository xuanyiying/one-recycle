import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RedisService } from '@/common/redis/redis.service';
import { InventoryService } from '@/modules/inventory/services/inventory.service';
import { AccountService } from '@/modules/account/account.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { OrderQueueService } from '@/modules/queue/services/order-queue.service';
import { PaymentProvider, Prisma } from '@prisma/client';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;
  let orderQueueService: OrderQueueService;
  let inventoryService: InventoryService;
  let accountService: AccountService;

  const mockRedisClient = {
    incr: jest.fn(),
    decr: jest.fn(),
    get: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn(() => mockRedisClient),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    address: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    orderItem: {
      update: jest.fn(),
    },
    orderTimeline: {
      create: jest.fn(),
    },
    logisticsOrder: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    reservation: {
      update: jest.fn(),
    },
    inventoryItem: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inventoryTransaction: {
      create: jest.fn(),
    },
    warehouse: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    inboundReceipt: {
      upsert: jest.fn(),
    },
    orderPhoto: {
      createMany: jest.fn(),
    },
    storage: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => defaultValue),
  };

  const mockInventoryService = {
    createFromOrder: jest.fn(),
  };

  const mockAccountService = {
    deposit: jest.fn(),
  };

  const mockPaymentService = {
    transferToUser: jest.fn(),
  };

  const mockOrderQueueService = {
    handleOrderCreated: jest.fn(),
    handleOrderStatusChanged: jest.fn(),
  };

  const baseOrder = {
    id: 1,
    orderNo: 'ORD-1',
    userId: 1,
    addressId: 1,
    status: OrderStatus.PENDING,
    orderType: 'RECYCLE',
    estimatedAmount: 100,
    settlementAmount: 0,
    payAmount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 10,
        orderId: 1,
        categoryId: 1,
        estimatedWeight: 5,
        unitPrice: 10,
        quantity: 1,
        amount: 50,
        createdAt: new Date(),
      },
    ],
    assignments: [],
    address: {
      detail: 'Test Address',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: OrderQueueService,
          useValue: mockOrderQueueService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
    orderQueueService = module.get<OrderQueueService>(OrderQueueService);
    inventoryService = module.get<InventoryService>(InventoryService);
    accountService = module.get<AccountService>(AccountService);
    (service as any).idGenerator = {
      nextId: jest.fn(async () => 123456),
      initialize: jest.fn(),
    };

    mockPrismaService.$transaction.mockImplementation(async (cb: any) =>
      cb(mockPrismaService),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockPrismaService.order.update.mockReset();
    mockPrismaService.order.findUnique.mockReset();
  });

  describe('create', () => {
    it('should create order and publish queue event', async () => {
      const createOrderDto = {
        userId: '1',
        addressId: '1',
        items: [
          { categoryId: 1, estimatedWeight: 5, unitPrice: 10, quantity: 1 },
        ],
        timeSlotId: 'slot_2026-02-11_0',
        channel: 'APP',
      };

      mockRedisClient.incr.mockResolvedValue(1);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrismaService.address.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrismaService.storage.findMany.mockResolvedValue([]);
      mockPrismaService.$transaction.mockImplementation(async (cb: any) =>
        cb({
          order: {
            create: jest.fn().mockResolvedValue({
              ...baseOrder,
              id: BigInt(1),
              userId: BigInt(1),
              addressId: BigInt(1),
              items: [
                {
                  id: BigInt(10),
                  orderId: BigInt(1),
                  categoryId: 1,
                  estimatedWeight: 5,
                  unitPrice: 10,
                  quantity: 1,
                  amount: 50,
                },
              ],
              address: { detail: 'Test Address' },
            }),
          },
          storage: mockPrismaService.storage,
          orderPhoto: mockPrismaService.orderPhoto,
        }),
      );

      const result = await service.create(createOrderDto as any);

      expect(prisma.user.findUnique).toHaveBeenCalled();
      expect(orderQueueService.handleOrderCreated).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.PENDING);
    });

    it('should throw when address is missing', async () => {
      const createOrderDto = {
        userId: '1',
        addressId: '99',
        items: [
          { categoryId: 1, estimatedWeight: 5, unitPrice: 10, quantity: 1 },
        ],
        timeSlotId: 'slot_2026-02-11_0',
        channel: 'APP',
      };

      mockRedisClient.incr.mockResolvedValue(1);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrismaService.address.findUnique.mockResolvedValue(null);

      await expect(
        service.create(createOrderDto as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should not throw when queue publish fails', async () => {
      const createOrderDto = {
        userId: '1',
        addressId: '1',
        items: [
          { categoryId: 1, estimatedWeight: 5, unitPrice: 10, quantity: 1 },
        ],
        timeSlotId: 'slot_2026-02-11_0',
        channel: 'APP',
      };

      mockRedisClient.incr.mockResolvedValue(1);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrismaService.address.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrismaService.storage.findMany.mockResolvedValue([]);
      mockOrderQueueService.handleOrderCreated.mockRejectedValue(
        new Error('queue down'),
      );
      mockPrismaService.$transaction.mockImplementation(async (cb: any) =>
        cb({
          order: {
            create: jest.fn().mockResolvedValue({
              ...baseOrder,
              id: BigInt(1),
              userId: BigInt(1),
              addressId: BigInt(1),
              items: [
                {
                  id: BigInt(10),
                  orderId: BigInt(1),
                  categoryId: 1,
                  estimatedWeight: 5,
                  unitPrice: 10,
                  quantity: 1,
                  amount: 50,
                },
              ],
              address: { detail: 'Test Address' },
            }),
          },
          storage: mockPrismaService.storage,
          orderPhoto: mockPrismaService.orderPhoto,
        }),
      );

      const result = await service.create(createOrderDto as any);

      expect(result.status).toBe(OrderStatus.PENDING);
      expect(orderQueueService.handleOrderCreated).toHaveBeenCalledTimes(3);
    });
  });

  describe('dispatch', () => {
    it('should save dispatch result and update order status', async () => {
      const orderId = '1';
      const logisticsCreate = jest.fn().mockResolvedValue({
        id: BigInt(9),
      });
      const orderUpdate = jest.fn().mockResolvedValue({
        id: BigInt(orderId),
        status: OrderStatus.PENDING_PICKUP,
      });
      mockPrismaService.$transaction.mockImplementation(async (cb: any) =>
        cb({
          logisticsOrder: {
            create: logisticsCreate,
          },
          order: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ status: OrderStatus.PENDING }),
            update: orderUpdate,
          },
          orderTimeline: {
            create: jest.fn().mockResolvedValue({}),
          },
        }),
      );

      await service.saveDispatchResult(orderId, {
        logisticsNo: 'JD123',
        logisticsCompany: 'JD',
        status: 'CREATED',
        senderName: 'Sender',
        senderPhone: '13800000000',
        receiverName: 'Receiver',
        receiverPhone: '13900000000',
        receiverAddress: 'Test Address',
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(logisticsCreate).toHaveBeenCalledWith({
        data: {
          orderId: BigInt(orderId),
          logisticsNo: 'JD123',
          logisticsCompany: 'JD',
          status: 'CREATED',
          senderName: 'Sender',
          senderPhone: '13800000000',
          senderAddress: undefined,
          receiverName: 'Receiver',
          receiverPhone: '13900000000',
          receiverAddress: 'Test Address',
          estimatedPickupTime: undefined,
          estimatedDeliveryTime: undefined,
          providerData: undefined,
        },
      });
      expect(orderUpdate).toHaveBeenCalledWith({
        where: { id: BigInt(orderId) },
        data: { status: OrderStatus.PENDING_PICKUP },
      });
    });
  });

  describe('status transitions', () => {
    it('should move PENDING to PENDING_PICKUP', async () => {
      const order = { ...baseOrder, status: OrderStatus.PENDING };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.PENDING_PICKUP,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.confirmOrder(order.id);

      expect(result.status).toBe(OrderStatus.PENDING_PICKUP);
    });

    it('should move PENDING_PICKUP to PICKED_UP with pickup time', async () => {
      const order = { ...baseOrder, status: OrderStatus.PENDING_PICKUP };
      const pickupTime = new Date();
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.PICKED_UP,
        actualPickupTime: pickupTime,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.courierPickUp(order.id, pickupTime);

      expect(result.status).toBe(OrderStatus.PICKED_UP);
      expect(new Date(result.actualPickupTime as any).toISOString()).toBe(
        pickupTime.toISOString(),
      );
    });

    it('should move PICKED_UP to IN_TRANSIT', async () => {
      const order = { ...baseOrder, status: OrderStatus.PICKED_UP };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.IN_TRANSIT,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.startTransport(order.id);

      expect(result.status).toBe(OrderStatus.IN_TRANSIT);
    });

    it('should move IN_TRANSIT to PENDING_RECEIPT', async () => {
      const order = { ...baseOrder, status: OrderStatus.IN_TRANSIT };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.PENDING_RECEIPT,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.arriveAtStation(order.id);

      expect(result.status).toBe(OrderStatus.PENDING_RECEIPT);
    });

    it('should move PENDING_RECEIPT to INSPECTING', async () => {
      const order = { ...baseOrder, status: OrderStatus.PENDING_RECEIPT };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.INSPECTING,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.confirmReceipt(order.id);

      expect(result.status).toBe(OrderStatus.INSPECTING);
    });

    it('should move INSPECTING to INSPECTED with settlement amount', async () => {
      const order = { ...baseOrder, status: OrderStatus.INSPECTING };
      const updatedOrder = {
        ...order,
        status: OrderStatus.INSPECTED,
        settlementAmount: 88,
      };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.$transaction.mockImplementation(async (cb: any) =>
        cb({
          order: {
            update: jest.fn().mockResolvedValue({
              ...updatedOrder,
              id: BigInt(order.id),
              userId: BigInt(order.userId),
              addressId: BigInt(order.addressId),
              settlementAmount: new Prisma.Decimal(88),
            }),
          },
          orderItem: {
            update: jest.fn().mockResolvedValue({}),
          },
          orderTimeline: {
            create: jest.fn().mockResolvedValue({}),
          },
        }),
      );
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...updatedOrder,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
        settlementAmount: new Prisma.Decimal(88),
      });

      const result = await service.finishInspection(order.id, {
        actualAmount: 88,
        items: [
          { id: 10, actualWeight: 4.5, unitPrice: 12, condition: 'GOOD' },
        ],
      });

      expect(result.status).toBe(OrderStatus.INSPECTED);
      expect(result.settlementAmount).toBe(88);
    });

    it('should move INSPECTING to INSPECTION_EXCEPTION with remark', async () => {
      const order = { ...baseOrder, status: OrderStatus.INSPECTING };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.INSPECTION_EXCEPTION,
        remark: 'Exception: mismatch',
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.handleInspectionException(
        order.id,
        'mismatch',
      );

      expect(result.status).toBe(OrderStatus.INSPECTION_EXCEPTION);
      expect(result.remark).toContain('mismatch');
    });

    it('should move INSPECTION_EXCEPTION to MANUAL_PROCESSING', async () => {
      const order = { ...baseOrder, status: OrderStatus.INSPECTION_EXCEPTION };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.MANUAL_PROCESSING,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.resolveException(order.id, 'MANUAL');

      expect(result.status).toBe(OrderStatus.MANUAL_PROCESSING);
    });

    it('should move INSPECTED to PENDING_INBOUND', async () => {
      const order = { ...baseOrder, status: OrderStatus.INSPECTED };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.PENDING_INBOUND,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.updateStatus(order.id, {
        status: OrderStatus.PENDING_INBOUND,
      });

      expect(result.status).toBe(OrderStatus.PENDING_INBOUND);
    });

    it('should move PENDING_INBOUND to INBOUNDED then PENDING_SETTLEMENT', async () => {
      const order = { ...baseOrder, status: OrderStatus.PENDING_INBOUND };
      mockPrismaService.warehouse.findFirst.mockResolvedValue({
        id: BigInt(1),
      });
      mockPrismaService.inboundReceipt.upsert.mockResolvedValue({});
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update
        .mockResolvedValueOnce({
          ...order,
          status: OrderStatus.INBOUNDED,
          id: BigInt(order.id),
          userId: BigInt(order.userId),
          addressId: BigInt(order.addressId),
        })
        .mockResolvedValueOnce({
          ...order,
          status: OrderStatus.PENDING_SETTLEMENT,
          id: BigInt(order.id),
          userId: BigInt(order.userId),
          addressId: BigInt(order.addressId),
        });

      const result = await service.confirmInbound(order.id);

      expect(inventoryService.createFromOrder).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.PENDING_SETTLEMENT);
    });

    it('should complete settlement and move to COMPLETED', async () => {
      const order = {
        ...baseOrder,
        status: OrderStatus.PENDING_SETTLEMENT,
        settlementAmount: 66,
      };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
        settlementAmount: new Prisma.Decimal(66),
      });
      mockPrismaService.$transaction.mockImplementation(async (cb: any) =>
        cb({
          order: {
            findUnique: jest.fn().mockResolvedValue({
              ...order,
              id: BigInt(order.id),
              userId: BigInt(order.userId),
              addressId: BigInt(order.addressId),
              settlementAmount: new Prisma.Decimal(66),
            }),
            update: jest.fn().mockResolvedValue({
              ...order,
              status: OrderStatus.COMPLETED,
              id: BigInt(order.id),
              userId: BigInt(order.userId),
              addressId: BigInt(order.addressId),
            }),
          },
          orderTimeline: {
            create: jest.fn().mockResolvedValue({}),
          },
        }),
      );

      const result = await service.completeSettlement(order.id, {
        method: PaymentProvider.BALANCE,
      });

      expect(accountService.deposit).toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should cancel from IN_TRANSIT', async () => {
      const order = { ...baseOrder, status: OrderStatus.IN_TRANSIT };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        reservations: [],
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...order,
        status: OrderStatus.CANCELLED,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      const result = await service.cancel(order.id);

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('exceptions and guards', () => {
    it('should reject invalid transition', async () => {
      const order = { ...baseOrder, status: OrderStatus.PENDING };
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...order,
        id: BigInt(order.id),
        userId: BigInt(order.userId),
        addressId: BigInt(order.addressId),
      });

      await expect(
        service.updateStatus(order.id, { status: OrderStatus.IN_TRANSIT }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: OrderStatus.CANCELLED }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('state machine matrix', () => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.PENDING_PICKUP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PENDING_PICKUP]: [
        OrderStatus.PICKED_UP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
      [OrderStatus.IN_TRANSIT]: [
        OrderStatus.PENDING_RECEIPT,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PENDING_RECEIPT]: [OrderStatus.INSPECTING],
      [OrderStatus.INSPECTING]: [
        OrderStatus.INSPECTED,
        OrderStatus.INSPECTION_EXCEPTION,
      ],
      [OrderStatus.INSPECTION_EXCEPTION]: [
        OrderStatus.MANUAL_PROCESSING,
        OrderStatus.INSPECTING,
      ],
      [OrderStatus.MANUAL_PROCESSING]: [
        OrderStatus.INSPECTED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.INSPECTED]: [OrderStatus.PENDING_INBOUND],
      [OrderStatus.PENDING_INBOUND]: [OrderStatus.INBOUNDED],
      [OrderStatus.INBOUNDED]: [OrderStatus.PENDING_SETTLEMENT],
      [OrderStatus.PENDING_SETTLEMENT]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    const allStatuses = Object.values(OrderStatus);

    it.each(allStatuses)('should have transitions for %s', (status) => {
      expect(transitions[status]).toBeDefined();
    });

    it.each(
      allStatuses.flatMap((from) => transitions[from].map((to) => [from, to])),
    )('should allow %s -> %s', async (from, to) => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...baseOrder,
        status: from,
        id: BigInt(baseOrder.id),
        userId: BigInt(baseOrder.userId),
        addressId: BigInt(baseOrder.addressId),
      });
      mockPrismaService.order.update.mockResolvedValue({
        ...baseOrder,
        status: to,
        id: BigInt(baseOrder.id),
        userId: BigInt(baseOrder.userId),
        addressId: BigInt(baseOrder.addressId),
      });

      const result = await service.updateStatus(baseOrder.id, { status: to });

      expect(result.status).toBe(to);
    });

    it.each(
      allStatuses.flatMap((from) =>
        allStatuses
          .filter((to) => to !== from && !transitions[from].includes(to))
          .map((to) => [from, to]),
      ),
    )('should reject %s -> %s', async (from, to) => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...baseOrder,
        status: from,
        id: BigInt(baseOrder.id),
        userId: BigInt(baseOrder.userId),
        addressId: BigInt(baseOrder.addressId),
      });

      await expect(
        service.updateStatus(baseOrder.id, { status: to }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
