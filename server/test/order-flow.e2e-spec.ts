import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CourierStatus, TaskStatus } from '@prisma/client';
import { Job } from 'bull';
import { OrderStatus } from '@/common';
import { OrderProcessor } from '@/modules/queue/processors/order.processor';
import { InventoryServiceClient } from '@/modules/queue/clients/inventory-service.client';
import { OrderServiceClient } from '@/modules/queue/clients/order-service.client';
import { NotificationQueueService } from '@/modules/queue/services/notification-queue.service';
import { OrderCreatedEventDto } from '@/modules/queue/dto/order-events.dto';
import { RedisService } from '@/common/redis/redis.service';
import { OrderQueueService } from '@/modules/queue/services/order-queue.service';

// Fix BigInt serialization for E2E tests
BigInt.prototype.toJSON = function () {
  return this.toString();
};

let slotCounter = 0;

function buildTimeSlot(daysAhead: number = 1) {
  slotCounter += 1;
  const target = new Date(Date.now() + (daysAhead + slotCounter) * 86400000);
  const dateStr = target.toISOString().split('T')[0];
  const slotIndex = Number(String(Date.now()).slice(-3)) % 5;
  return { dateStr, timeSlotId: `slot_${dateStr}_${slotIndex}` };
}

function createMockRedisService() {
  const store = new Map<string, any>();
  return {
    async get<T = any>(key: string): Promise<T | null> {
      const value = store.get(key);
      return value === undefined ? null : (value as T);
    },
    async set(key: string, value: any): Promise<void> {
      store.set(key, value);
    },
    async del(key: string): Promise<void> {
      store.delete(key);
    },
    getClient() {
      return {
        async get(key: string) {
          const value = store.get(key);
          if (value === undefined) return null;
          if (typeof value === 'number') return String(value);
          if (typeof value === 'string') return value;
          return JSON.stringify(value);
        },
        async incr(key: string) {
          const value = (store.get(key) || 0) + 1;
          store.set(key, value);
          return value;
        },
        async decr(key: string) {
          const value = (store.get(key) || 0) - 1;
          store.set(key, value);
          return value;
        },
      };
    },
  };
}

describe('Order Flow (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  let userId: bigint;
  let addressId: bigint;
  let courierId: string;
  let categoryId: number;
  const orderIds: number[] = [];
  const paymentIds: string[] = [];
  const dispatchAssignmentIds: bigint[] = [];
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisService)
      .useValue(createMockRedisService())
      .overrideProvider(OrderQueueService)
      .useValue({
        handleOrderCreated: async () => {},
        handleOrderStatusChanged: async () => {},
        handleOrderCanceled: async () => {},
        handleOrderCompleted: async () => {},
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = app.get(PrismaService);
    jwtService = app.get(JwtService);

    // Setup: Create User
    // Use a random ID to avoid collision with autoincrement sequence
    const randomId = BigInt(Date.now());
    const user = await prismaService.user.create({
      data: {
        id: randomId,
        mobile: `138${Date.now().toString().slice(-8)}`,
        nickname: 'E2E Test User',
      },
    });
    userId = user.id;

    // Setup: Create Address
    const address = await prismaService.address.create({
      data: {
        userId: userId,
        name: 'Test User',
        mobile: '13800000000',
        province: 'Test Province',
        city: 'Test City',
        district: 'Test District',
        town: 'Test Town',
        street: 'Test Street',
        zipCode: '100000',
        detail: 'Test Detail Address',
        isDefault: true,
      },
    });
    addressId = address.id;

    // Setup: Create Courier
    const courier = await prismaService.courier.create({
      data: {
        id: `courier-${Date.now()}`,
        name: 'E2E Courier',
        phone: `139${Date.now().toString().slice(-8)}`,
        status: CourierStatus.AVAILABLE,
      },
    });
    courierId = courier.id;

    const category = await prismaService.category.create({
      data: {
        name: 'E2E Category',
        description: 'E2E',
        type: 'PRODUCT',
        priceInfo: '{}',
        seo: '{}',
        sortOrder: 0,
        isVisible: true,
        isFeatured: false,
        attributes: null,
        level: 0,
        path: '0',
      },
    });
    categoryId = category.id;

    // Setup: Generate Token
    // We need to cast userId to string for the token payload if expected, usually sub is string or number
    token = jwtService.sign({ sub: userId.toString(), role: 'USER' });
  });

  afterAll(async () => {
    // Cleanup - Delete dependent records first
    if (dispatchAssignmentIds.length > 0) {
      await prismaService.orderAssignment
        .deleteMany({
          where: { id: { in: dispatchAssignmentIds } },
        })
        .catch(() => {});
    }

    // Clean up Payment related data
    if (orderIds.length > 0) {
      await prismaService.paymentLog
        .deleteMany({
          where: { orderId: { in: orderIds.map((id) => BigInt(id)) } },
        })
        .catch(() => {});
    }

    if (paymentIds.length > 0) {
      await prismaService.payment
        .deleteMany({
          where: { id: { in: paymentIds.map((id) => BigInt(id)) } },
        })
        .catch(() => {});
    }

    if (orderIds.length > 0) {
      // Clean up Order related data
      await prismaService.orderTimeline
        .deleteMany({
          where: { orderId: { in: orderIds.map((id) => BigInt(id)) } },
        })
        .catch(() => {});
      await prismaService.orderItem
        .deleteMany({
          where: { orderId: { in: orderIds.map((id) => BigInt(id)) } },
        })
        .catch(() => {});
      await prismaService.order
        .deleteMany({
          where: { id: { in: orderIds.map((id) => BigInt(id)) } },
        })
        .catch(() => {});
    }

    if (addressId) {
      await prismaService.address
        .deleteMany({ where: { id: addressId } })
        .catch(() => {});
    }
    if (userId) {
      // Clean up User related data (identities, etc if any created implicitly)
      await prismaService.userIdentity
        .deleteMany({ where: { userId: userId } })
        .catch(() => {});
      await prismaService.user
        .deleteMany({ where: { id: userId } })
        .catch(() => {});
    }
    if (courierId) {
      await prismaService.courier
        .deleteMany({ where: { id: courierId } })
        .catch(() => {});
    }
    if (categoryId) {
      await prismaService.category
        .deleteMany({ where: { id: categoryId } })
        .catch(() => {});
    }

    await app.close();
  });

  it('should complete the order submission -> payment -> dispatch flow', async () => {
    // 1. Submit Order (Client Step 3)
    const { dateStr, timeSlotId } = buildTimeSlot(1);

    const createOrderDto = {
      userId: userId.toString(),
      addressId: addressId.toString(),
      timeSlotId: timeSlotId, // Use timeSlotId instead of direct time
      channel: 'APP',
      items: [
        {
          categoryId: categoryId,
          estimatedWeight: 5,
          unitPrice: 10,
          quantity: 1,
        },
      ],
      estimatedAmount: 50,
    };

    const createOrderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(createOrderDto)
      .expect(201);

    const createOrderBody = createOrderResponse.body as {
      id: number | string;
      status: OrderStatus;
      expectPickupTime?: string;
    };
    const orderId = Number(createOrderBody.id);
    orderIds.push(orderId);
    expect(orderId).toBeDefined();
    expect(createOrderBody.status).toBe(OrderStatus.PENDING);

    expect(createOrderBody.expectPickupTime).toBeDefined();
    expect(
      new Date(createOrderBody.expectPickupTime as string).toISOString(),
    ).toContain(dateStr);

    // 2. Create Payment
    const createPaymentDto = {
      orderId: orderId.toString(),
      amount: 50,
      provider: 'ALIPAY', // Enum string
      method: 'ALIPAY',
    };

    const createPaymentResponse = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(createPaymentDto)
      .expect(201);

    const createPaymentBody = createPaymentResponse.body as {
      id: string;
      transactionId?: string;
    };
    const paymentId = createPaymentBody.id;
    paymentIds.push(paymentId);
    expect(paymentId).toBeDefined();

    // 3. Update Payment Status to SUCCESS
    // Use the ID returned (which should be transactionId or id)
    // The controller uses :transactionId
    // If create returns Payment entity, it has transactionId.
    // If it returns id, we might need to query it or use id if transactionId is same (usually distinct).
    // Let's inspect response body structure if we could, but here we assume 'id' is transactionId or we use transactionId from body.
    // Actually, createPaymentResponse.body likely contains transactionId.
    const transactionId = createPaymentBody.transactionId || paymentId;

    await request(app.getHttpServer())
      .put(`/payments/${transactionId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'SUCCESS' })
      .expect(200);

    // 4. Dispatch Order
    const assignData = {
      orderId: orderId.toString(),
      courierId: courierId,
    };

    await request(app.getHttpServer())
      .post('/dispatch/assign')
      .set('Authorization', `Bearer ${token}`)
      .send(assignData)
      .expect(201);

    // Verify assignment in DB
    const assignment = await prismaService.orderAssignment.findFirst({
      where: { orderId: BigInt(orderId) },
    });
    expect(assignment).toBeDefined();
    dispatchAssignmentIds.push(assignment!.id);
    expect(assignment!.courierId).toBe(courierId);
    expect(assignment!.status).toBe(TaskStatus.ASSIGNED);
  });

  it('should cancel order after in-transit status', async () => {
    const { timeSlotId } = buildTimeSlot(1);

    const createOrderDto = {
      userId: userId.toString(),
      addressId: addressId.toString(),
      timeSlotId: timeSlotId,
      channel: 'APP',
      items: [
        {
          categoryId: categoryId,
          estimatedWeight: 5,
          unitPrice: 10,
          quantity: 1,
        },
      ],
      estimatedAmount: 50,
    };

    const createOrderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(createOrderDto)
      .expect(201);

    const createOrderBody = createOrderResponse.body as { id: number | string };
    const orderId = Number(createOrderBody.id);
    orderIds.push(orderId);

    await request(app.getHttpServer())
      .put(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: OrderStatus.PENDING_PICKUP })
      .expect(200);

    await request(app.getHttpServer())
      .put(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: OrderStatus.PICKED_UP })
      .expect(200);

    await request(app.getHttpServer())
      .put(`/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: OrderStatus.IN_TRANSIT })
      .expect(200);

    const cancelResponse = await request(app.getHttpServer())
      .patch(`/orders/${orderId}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect((cancelResponse.body as { status: OrderStatus }).status).toBe(
      OrderStatus.CANCELLED,
    );
  });

  it('should reject duplicate payment for same order', async () => {
    const { timeSlotId } = buildTimeSlot(1);

    const createOrderDto = {
      userId: userId.toString(),
      addressId: addressId.toString(),
      timeSlotId: timeSlotId,
      channel: 'APP',
      items: [
        {
          categoryId: categoryId,
          estimatedWeight: 5,
          unitPrice: 10,
          quantity: 1,
        },
      ],
      estimatedAmount: 50,
    };

    const createOrderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(createOrderDto)
      .expect(201);

    const createOrderBody = createOrderResponse.body as { id: number | string };
    const orderId = Number(createOrderBody.id);
    orderIds.push(orderId);

    const createPaymentDto = {
      orderId: orderId.toString(),
      amount: 50,
      provider: 'ALIPAY',
      method: 'ALIPAY',
    };

    const createPaymentResponse = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(createPaymentDto)
      .expect(201);

    const createPaymentBody = createPaymentResponse.body as {
      id: string;
      transactionId: string;
    };
    const paymentId = createPaymentBody.id;
    paymentIds.push(paymentId);

    await request(app.getHttpServer())
      .put(`/payments/${createPaymentBody.transactionId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'SUCCESS' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(createPaymentDto)
      .expect(409);
  });

  it('should handle payment notify callback', async () => {
    const { timeSlotId } = buildTimeSlot(1);

    const createOrderDto = {
      userId: userId.toString(),
      addressId: addressId.toString(),
      timeSlotId: timeSlotId,
      channel: 'APP',
      items: [
        {
          categoryId: categoryId,
          estimatedWeight: 5,
          unitPrice: 10,
          quantity: 1,
        },
      ],
      estimatedAmount: 50,
    };

    const createOrderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(createOrderDto)
      .expect(201);

    const createOrderBody = createOrderResponse.body as { id: number | string };
    const orderId = Number(createOrderBody.id);
    orderIds.push(orderId);

    const createPaymentDto = {
      orderId: orderId.toString(),
      amount: 50,
      provider: 'ALIPAY',
      method: 'ALIPAY',
    };

    const createPaymentResponse = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send(createPaymentDto)
      .expect(201);

    const createPaymentBody = createPaymentResponse.body as {
      id: string;
      outTradeNo: string;
      transactionId: string;
    };
    const paymentId = createPaymentBody.id;
    paymentIds.push(paymentId);

    const notifyPayload = {
      outTradeNo: createPaymentBody.outTradeNo,
      transactionId: createPaymentBody.transactionId,
      tradeState: 'SUCCESS',
      notifyRaw: JSON.stringify({ mock: true }),
    };

    const notifyResponse = await request(app.getHttpServer())
      .post('/payments/notify')
      .send(notifyPayload)
      .expect(201);

    expect((notifyResponse.body as { status: string }).status).toBe('SUCCESS');
  });

  it('should handle inventory insufficient in order processor', async () => {
    const processor = app.get(OrderProcessor);
    const inventoryClient = app.get(InventoryServiceClient);
    const orderClient = app.get(OrderServiceClient);
    const notificationClient = app.get(NotificationQueueService);

    const checkInventorySpy = jest
      .spyOn(inventoryClient, 'checkInventory')
      .mockResolvedValue({
        available: false,
        items: [],
      });
    const releaseInventorySpy = jest
      .spyOn(inventoryClient, 'releaseInventory')
      .mockResolvedValue(true);
    const updateStatusSpy = jest
      .spyOn(orderClient, 'updateOrderStatus')
      .mockResolvedValue({} as any);
    const updateAmountSpy = jest
      .spyOn(orderClient, 'updateOrderAmount')
      .mockResolvedValue({} as any);
    const notificationSpy = jest
      .spyOn(notificationClient, 'sendOrderStatusNotification')
      .mockResolvedValue(undefined);

    const job = {
      data: {
        orderId: 'inv-order-1',
        userId: userId.toString(),
        items: [
          {
            categoryId: 'cat-1',
            quantity: 1,
            estimatedPrice: 10,
          },
        ],
        address: {
          id: addressId.toString(),
          fullAddress: 'Test Address',
        },
        scheduledTime: new Date().toISOString(),
        orderType: 'SALE',
      },
    } as unknown as Job<OrderCreatedEventDto>;

    await expect(processor.handleOrderCreated(job)).rejects.toThrow(
      'Insufficient inventory',
    );

    expect(updateStatusSpy).toHaveBeenCalledWith(
      'inv-order-1',
      OrderStatus.INSPECTION_EXCEPTION,
    );
    expect(releaseInventorySpy).toHaveBeenCalledWith('inv-order-1');
    expect(checkInventorySpy).toHaveBeenCalled();
    expect(updateAmountSpy).not.toHaveBeenCalled();
    expect(notificationSpy).not.toHaveBeenCalled();
  });

  it('should update full lifecycle status sequence', async () => {
    const { timeSlotId } = buildTimeSlot(1);

    const createOrderDto = {
      userId: userId.toString(),
      addressId: addressId.toString(),
      timeSlotId: timeSlotId,
      channel: 'APP',
      items: [
        {
          categoryId: categoryId,
          estimatedWeight: 5,
          unitPrice: 10,
          quantity: 1,
        },
      ],
      estimatedAmount: 50,
    };

    const createOrderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(createOrderDto)
      .expect(201);

    const orderId = Number(
      (createOrderResponse.body as { id: number | string }).id,
    );
    orderIds.push(orderId);

    const statuses = [
      OrderStatus.PENDING_PICKUP,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
      OrderStatus.PENDING_RECEIPT,
      OrderStatus.INSPECTING,
      OrderStatus.INSPECTED,
      OrderStatus.PENDING_INBOUND,
      OrderStatus.INBOUNDED,
      OrderStatus.PENDING_SETTLEMENT,
      OrderStatus.COMPLETED,
    ];

    for (const status of statuses) {
      const response = await request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status })
        .expect(200);
      expect((response.body as { status: OrderStatus }).status).toBe(status);
    }
  });
});
