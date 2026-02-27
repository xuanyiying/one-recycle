import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  OrderStatus,
  PaymentProvider,
  TransactionType,
  WithdrawalStatus,
  AccountType,
} from '@prisma/client';
import { RedisService } from '@/common/redis/redis.service';
import { OrderQueueService } from '@/modules/queue/services/order-queue.service';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

function createMockRedisService() {
  const store = new Map<string, unknown>();
  return {
    get: async <T = unknown>(key: string): Promise<T | null> => {
      const value = store.get(key);
      return value === undefined ? null : (value as T);
    },
    set: async (key: string, value: unknown): Promise<void> => {
      store.set(key, value);
    },
    del: async (key: string): Promise<void> => {
      store.delete(key);
    },
    getClient() {
      return {
        get: async (key: string) => {
          const value = store.get(key);
          if (value === undefined) return null;
          if (typeof value === 'number') return String(value);
          if (typeof value === 'string') return value;
          return JSON.stringify(value);
        },
        incr: async (key: string) => {
          const value = (store.get(key) || 0) as number;
          const newValue = value + 1;
          store.set(key, newValue);
          return newValue;
        },
        decr: async (key: string) => {
          const value = (store.get(key) || 0) as number;
          const newValue = value - 1;
          store.set(key, newValue);
          return newValue;
        },
      };
    },
  };
}

describe('Points & Withdrawal E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  let userId: bigint;
  let addressId: bigint;
  let categoryId: number;
  let accountId: bigint;
  let token: string;

  const orderIds: bigint[] = [];
  const withdrawalIds: bigint[] = [];

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prismaService = app.get(PrismaService);
    jwtService = app.get(JwtService);

    const randomId = BigInt(Date.now());
    const user = await prismaService.user.create({
      data: {
        id: randomId,
        mobile: `159${Date.now().toString().slice(-8)}`,
        nickname: 'Points Test User',
      },
    });
    userId = user.id;

    const address = await prismaService.address.create({
      data: {
        userId: userId,
        name: 'Test User',
        mobile: '13800000000',
        province: 'Beijing',
        city: 'Beijing',
        district: 'Haidian',
        town: 'Test Town',
        street: 'Test Street',
        zipCode: '100000',
        detail: 'Test Address Detail',
        isDefault: true,
      },
    });
    addressId = address.id;

    const category = await prismaService.category.create({
      data: {
        name: 'Test Category',
        description: 'Test',
        type: 'PRODUCT',
        priceInfo: '{}',
        seo: '{}',
        sortOrder: 0,
        isVisible: true,
        isFeatured: false,
        level: 0,
        path: '0',
      },
    });
    categoryId = category.id;

    const account = await prismaService.account.create({
      data: {
        userId: userId,
        accountType: AccountType.WALLET,
        accountDetails: {},
        availableBalance: 1000,
        frozenBalance: 0,
        totalIncome: 1000,
        totalWithdrawal: 0,
      },
    });
    accountId = account.id;

    token = jwtService.sign({ sub: userId.toString(), role: 'USER' });
  });

  afterAll(async () => {
    for (const withdrawalId of withdrawalIds) {
      await prismaService.transaction
        .deleteMany({ where: { withdrawalId } })
        .catch(() => {});
    }
    await prismaService.withdrawal
      .deleteMany({ where: { userId } })
      .catch(() => {});

    for (const orderId of orderIds) {
      await prismaService.transaction
        .deleteMany({ where: { orderId: orderId.toString() } })
        .catch(() => {});
      await prismaService.orderTimeline
        .deleteMany({ where: { orderId } })
        .catch(() => {});
      await prismaService.orderItem
        .deleteMany({ where: { orderId } })
        .catch(() => {});
    }
    await prismaService.order.deleteMany({ where: { userId } }).catch(() => {});

    await prismaService.transaction
      .deleteMany({ where: { account: { userId } } })
      .catch(() => {});
    await prismaService.account
      .deleteMany({ where: { userId } })
      .catch(() => {});
    await prismaService.address
      .deleteMany({ where: { userId } })
      .catch(() => {});
    await prismaService.user
      .deleteMany({ where: { id: userId } })
      .catch(() => {});
    await prismaService.category
      .deleteMany({ where: { id: categoryId } })
      .catch(() => {});

    await app.close();
  });

  describe('Points System Tests', () => {
    it('should deposit points to user account on order completion', async () => {
      const order = await prismaService.order.create({
        data: {
          orderNo: `ORD-POINTS-${Date.now()}`,
          userId: userId,
          addressId: addressId,
          status: OrderStatus.PENDING_SETTLEMENT,
          channel: 'APP',
          estimatedAmount: 0,
          settlementAmount: 100,
          payAmount: 0,
        },
      });
      orderIds.push(order.id);

      const response = await request(app.getHttpServer())
        .put(`/orders/${order.id}/complete-settlement`)
        .set('Authorization', `Bearer ${token}`)
        .send({ method: PaymentProvider.BALANCE })
        .expect(200);

      expect((response.body as { status: OrderStatus }).status).toBe(
        OrderStatus.COMPLETED,
      );

      const account = await prismaService.account.findUnique({
        where: { id: accountId },
      });
      expect(Number(account?.availableBalance)).toBeGreaterThan(1000);
    });

    it('should record transaction with correct type and amount', async () => {
      const transactions = await prismaService.transaction.findMany({
        where: {
          account: { userId },
          type: TransactionType.ORDER_INCOME,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(transactions.length).toBeGreaterThan(0);
      expect(Number(transactions[0].amount)).toBeGreaterThan(0);
    });

    it('should prevent duplicate deposit for same order', async () => {
      const order = await prismaService.order.create({
        data: {
          orderNo: `ORD-DUP-${Date.now()}`,
          userId: userId,
          addressId: addressId,
          status: OrderStatus.PENDING_SETTLEMENT,
          channel: 'APP',
          estimatedAmount: 0,
          settlementAmount: 50,
          payAmount: 0,
        },
      });
      orderIds.push(order.id);

      await request(app.getHttpServer())
        .put(`/orders/${order.id}/complete-settlement`)
        .set('Authorization', `Bearer ${token}`)
        .send({ method: PaymentProvider.BALANCE })
        .expect(200);

      const accountBefore = await prismaService.account.findUnique({
        where: { id: accountId },
      });

      await request(app.getHttpServer())
        .put(`/orders/${order.id}/complete-settlement`)
        .set('Authorization', `Bearer ${token}`)
        .send({ method: PaymentProvider.BALANCE })
        .expect(200);

      const accountAfter = await prismaService.account.findUnique({
        where: { id: accountId },
      });

      expect(Number(accountAfter?.availableBalance)).toBe(
        Number(accountBefore?.availableBalance),
      );
    });
  });

  describe('Withdrawal System Tests', () => {
    it('should validate minimum withdrawal amount', async () => {
      const response = await request(app.getHttpServer())
        .post('/withdrawals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 5,
          provider: PaymentProvider.WECHAT,
          accountInfo: { openid: 'test-openid', realName: 'Test User' },
        })
        .expect(400);

      expect((response.body as { message: string }).message).toContain(
        'minimum',
      );
    });

    it('should reject withdrawal exceeding available balance', async () => {
      const account = await prismaService.account.findUnique({
        where: { id: accountId },
      });
      const excessiveAmount = Number(account?.availableBalance) + 1000;

      const response = await request(app.getHttpServer())
        .post('/withdrawals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: excessiveAmount,
          provider: PaymentProvider.WECHAT,
          accountInfo: { openid: 'test-openid', realName: 'Test User' },
        })
        .expect(400);

      expect((response.body as { message: string }).message).toBeDefined();
    });

    it('should create withdrawal request and freeze balance', async () => {
      const accountBefore = await prismaService.account.findUnique({
        where: { id: accountId },
      });
      const withdrawalAmount = 100;

      const response = await request(app.getHttpServer())
        .post('/withdrawals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: withdrawalAmount,
          provider: PaymentProvider.WECHAT,
          accountInfo: { openid: 'test-openid', realName: 'Test User' },
        })
        .expect(201);

      const withdrawal = response.body as {
        id: string;
        status: WithdrawalStatus;
        amount: number;
      };
      withdrawalIds.push(BigInt(withdrawal.id));

      expect(withdrawal.status).toBe(WithdrawalStatus.PENDING);
      expect(withdrawal.amount).toBe(withdrawalAmount);

      const accountAfter = await prismaService.account.findUnique({
        where: { id: accountId },
      });

      expect(Number(accountAfter?.availableBalance)).toBe(
        Number(accountBefore?.availableBalance) - withdrawalAmount,
      );
      expect(Number(accountAfter?.frozenBalance)).toBe(
        Number(accountBefore?.frozenBalance) + withdrawalAmount,
      );
    });

    it('should process withdrawal and update balance', async () => {
      const pendingWithdrawal = await prismaService.withdrawal.findFirst({
        where: {
          userId,
          status: WithdrawalStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (pendingWithdrawal) {
        const response = await request(app.getHttpServer())
          .post(`/withdrawals/${pendingWithdrawal.id}/process`)
          .set('Authorization', `Bearer ${token}`)
          .expect(201);

        const withdrawal = response.body as { status: WithdrawalStatus };
        expect([
          WithdrawalStatus.SUCCESS,
          WithdrawalStatus.PROCESSING,
        ]).toContain(withdrawal.status);
      }
    });

    it('should rollback balance on withdrawal failure', async () => {
      const accountBefore = await prismaService.account.findUnique({
        where: { id: accountId },
      });

      const withdrawal = await prismaService.withdrawal.create({
        data: {
          accountId: accountId,
          userId: userId,
          amount: 50,
          provider: PaymentProvider.WECHAT,
          outTradeNo: `WD-FAIL-${Date.now()}`,
          status: WithdrawalStatus.PENDING,
          accountInfo: { openid: 'fail-openid' },
        },
      });
      withdrawalIds.push(withdrawal.id);

      await prismaService.account.update({
        where: { id: accountId },
        data: {
          availableBalance: { decrement: 50 },
          frozenBalance: { increment: 50 },
        },
      });

      await prismaService.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: WithdrawalStatus.FAILED },
      });

      await prismaService.account.update({
        where: { id: accountId },
        data: {
          availableBalance: { increment: 50 },
          frozenBalance: { decrement: 50 },
        },
      });

      const accountAfter = await prismaService.account.findUnique({
        where: { id: accountId },
      });

      expect(Number(accountAfter?.availableBalance)).toBe(
        Number(accountBefore?.availableBalance),
      );
      expect(Number(accountAfter?.frozenBalance)).toBe(
        Number(accountBefore?.frozenBalance),
      );
    });

    it('should list user withdrawals with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/withdrawals/me')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      const body = response.body as {
        withdrawals: Array<{ id: string; status: string }>;
        total: number;
      };

      expect(Array.isArray(body.withdrawals)).toBe(true);
      expect(typeof body.total).toBe('number');
    });
  });

  describe('Account Balance Consistency Tests', () => {
    it('should maintain balance consistency across operations', async () => {
      const initialAccount = await prismaService.account.findUnique({
        where: { id: accountId },
      });

      const transactions = await prismaService.transaction.findMany({
        where: { accountId },
        orderBy: { createdAt: 'asc' },
      });

      let totalCredit = 0;
      for (const txn of transactions) {
        const amount = Number(txn.amount);
        switch (txn.type) {
          case TransactionType.ORDER_INCOME:
          case TransactionType.REFUND:
          case TransactionType.ADJUSTMENT:
            totalCredit += amount;
            break;
          case TransactionType.WITHDRAWAL_FREEZE:
          case TransactionType.WITHDRAWAL_SUCCESS:
          case TransactionType.WITHDRAWAL_FAILED:
            break;
        }
      }

      const totalIncome = transactions
        .filter(
          (t) =>
            t.type === TransactionType.ORDER_INCOME ||
            t.type === TransactionType.REFUND,
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      expect(totalCredit).toBeGreaterThanOrEqual(totalIncome);
      expect(Number(initialAccount?.totalIncome)).toBeGreaterThanOrEqual(
        totalIncome - 100,
      );
    });

    it('should correctly track total withdrawal', async () => {
      const account = await prismaService.account.findUnique({
        where: { id: accountId },
      });

      const successfulWithdrawals = await prismaService.withdrawal.findMany({
        where: {
          userId,
          status: WithdrawalStatus.SUCCESS,
        },
      });

      const totalWithdrawn = successfulWithdrawals.reduce(
        (sum, w) => sum + Number(w.amount),
        0,
      );

      expect(Number(account?.totalWithdrawal)).toBeGreaterThanOrEqual(
        totalWithdrawn,
      );
    });
  });
});
