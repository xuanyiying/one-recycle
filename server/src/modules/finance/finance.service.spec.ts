import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FinanceService } from './finance.service';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/common/redis/redis.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('FinanceService - Tenant Recharge', () => {
  let service: FinanceService;
  let prisma: any;

  const mockTenantId = '1';
  const mockOrderNo = 'RC1234567890123456789ABCD';
  const mockRechargeAmount = new Prisma.Decimal(1000);
  const mockPayBaseUrl = 'https://mock-pay.com/pay';

  const mockWallet = {
    id: 1,
    balance: new Prisma.Decimal(5000),
    frozenAmount: new Prisma.Decimal(0),
    totalRecharge: new Prisma.Decimal(10000),
    totalPayout: new Prisma.Decimal(0),
    version: 1,
  };

  const mockTenant = {
    id: BigInt(1),
    name: 'Test Tenant',
    code: 'TEST001',
    balance: new Prisma.Decimal(2000),
    frozenBalance: new Prisma.Decimal(0),
    version: 1,
  };

  const mockRechargeOrder = {
    id: BigInt(1),
    orderNo: mockOrderNo,
    amount: mockRechargeAmount,
    paymentMethod: 'ALIPAY',
    status: 'PENDING',
    paidAt: null,
  };

  const mockPrismaService: any = {
    platformWallet: {
      findFirst: jest.fn().mockResolvedValue(mockWallet),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    rechargeOrder: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn().mockResolvedValue(mockTenant),
      update: jest.fn().mockResolvedValue({}),
    },
    platformTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    tenantTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    rechargePlan: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((fn: any) => {
      if (typeof fn === 'function') {
        return fn(mockPrismaService);
      }
      return Promise.resolve({ wallet: {}, tenant: {} });
    }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'payment') {
        return { mockPayBaseUrl };
      }
      return undefined;
    }),
  };

  const mockRedisService = {
    getClient: jest.fn(() => ({
      incr: jest.fn(),
      decr: jest.fn(),
      get: jest.fn(),
    })),
    withLock: jest.fn(async (key: string, fn: () => Promise<any>) => fn()),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
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
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    prisma = module.get(PrismaService);
  });

  describe('createRechargeOrder', () => {
    it('should create a recharge order with tenant ID using ID generator', async () => {
      prisma.rechargeOrder.create.mockResolvedValue(mockRechargeOrder);

      const result = await service.createRechargeOrder(
        { amount: 1000, paymentMethod: 'ALIPAY' },
        mockTenantId,
      );

      expect(result.orderNo).toBeDefined();
      expect(result.orderNo).toMatch(/^RC/);
      expect(result.tenantId).toBe(mockTenantId);
      expect(result.payUrl).toContain(mockPayBaseUrl);
      expect(prisma.rechargeOrder.create).toHaveBeenCalled();
    });

    it('should create a recharge order without tenant ID (platform recharge)', async () => {
      prisma.rechargeOrder.create.mockResolvedValue(mockRechargeOrder);

      const result = await service.createRechargeOrder({
        amount: 1000,
        paymentMethod: 'ALIPAY',
      });

      expect(result.orderNo).toBeDefined();
      expect(result.tenantId).toBeUndefined();
    });

    it('should use configured mock pay URL', async () => {
      prisma.rechargeOrder.create.mockResolvedValue(mockRechargeOrder);

      const result = await service.createRechargeOrder({
        amount: 1000,
        paymentMethod: 'ALIPAY',
      });

      expect(result.payUrl).toContain(mockPayBaseUrl);
    });
  });

  describe('mockPaySuccess - Tenant Recharge', () => {
    it('should update both platform wallet and tenant balance when tenantId is provided', async () => {
      prisma.rechargeOrder.findUnique.mockResolvedValue(mockRechargeOrder);
      prisma.platformWallet.findFirst.mockResolvedValue(mockWallet);
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);

      const updatedWallet = {
        ...mockWallet,
        balance: new Prisma.Decimal(6000),
        version: 2,
      };
      const updatedTenant = {
        ...mockTenant,
        balance: new Prisma.Decimal(3000),
        version: 2,
      };

      prisma.platformWallet.update.mockResolvedValue(updatedWallet);
      prisma.tenant.update.mockResolvedValue(updatedTenant);
      prisma.platformTransaction.create.mockResolvedValue({});
      prisma.tenantTransaction.create.mockResolvedValue({});
      prisma.rechargeOrder.update.mockResolvedValue({
        ...mockRechargeOrder,
        status: 'SUCCESS',
      });

      const result = (await service.mockPaySuccess(
        mockOrderNo,
        mockTenantId,
      )) as any;

      expect(result.wallet).toBeDefined();
      expect(result.tenant).toBeDefined();
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: BigInt(mockTenantId) },
        data: {
          balance: { increment: mockRechargeAmount },
          version: { increment: 1 },
        },
      });
      expect(prisma.tenantTransaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: BigInt(mockTenantId),
          type: 'ADJUSTMENT',
          amount: mockRechargeAmount,
          relatedType: 'RECHARGE',
          relatedId: mockOrderNo,
        }),
      });
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      prisma.rechargeOrder.findUnique.mockResolvedValue(mockRechargeOrder);
      prisma.platformWallet.findFirst.mockResolvedValue(mockWallet);
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.mockPaySuccess(mockOrderNo, mockTenantId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order is already paid', async () => {
      prisma.rechargeOrder.findUnique.mockResolvedValue({
        ...mockRechargeOrder,
        status: 'SUCCESS',
      });

      await expect(
        service.mockPaySuccess(mockOrderNo, mockTenantId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order does not exist', async () => {
      prisma.rechargeOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.mockPaySuccess(mockOrderNo, mockTenantId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('mockPaySuccess - Platform Recharge', () => {
    it('should update only platform wallet when tenantId is not provided', async () => {
      prisma.rechargeOrder.findUnique.mockResolvedValue(mockRechargeOrder);
      prisma.platformWallet.findFirst.mockResolvedValue(mockWallet);

      const updatedWallet = {
        ...mockWallet,
        balance: new Prisma.Decimal(6000),
        version: 2,
      };
      prisma.platformWallet.update.mockResolvedValue(updatedWallet);
      prisma.platformTransaction.create.mockResolvedValue({});
      prisma.rechargeOrder.update.mockResolvedValue({
        ...mockRechargeOrder,
        status: 'SUCCESS',
      });

      const result = await service.mockPaySuccess(mockOrderNo);

      expect(result).toBeDefined();
      expect(prisma.tenant.update).not.toHaveBeenCalled();
      expect(prisma.tenantTransaction.create).not.toHaveBeenCalled();
    });
  });

  describe('getTenantBalance', () => {
    it('should return tenant balance information', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.getTenantBalance(mockTenantId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockTenant.id);
      expect(result.balance).toBe(mockTenant.balance);
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.getTenantBalance(mockTenantId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTenantTransactions', () => {
    it('should return tenant transactions with pagination', async () => {
      const mockTransactions = [
        {
          id: BigInt(1),
          tenantId: BigInt(1),
          type: 'ADJUSTMENT',
          amount: new Prisma.Decimal(1000),
          balanceAfter: new Prisma.Decimal(3000),
          relatedType: 'RECHARGE',
          relatedId: mockOrderNo,
          remark: '充值入账',
          createdAt: new Date(),
        },
      ];

      prisma.tenantTransaction.findMany.mockResolvedValue(mockTransactions);
      prisma.tenantTransaction.count.mockResolvedValue(1);

      const result = await service.getTenantTransactions(mockTenantId, 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('Transaction Consistency', () => {
    it('should execute all operations within a transaction for tenant recharge', async () => {
      const transactionSpy = jest.fn((fn: any) => fn(prisma));
      prisma.$transaction = transactionSpy;

      prisma.rechargeOrder.findUnique.mockResolvedValue(mockRechargeOrder);
      prisma.platformWallet.findFirst.mockResolvedValue(mockWallet);
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);

      await service.mockPaySuccess(mockOrderNo, mockTenantId);

      expect(transactionSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should use default mock pay URL when config is not available', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FinanceService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
          {
            provide: ConfigService,
            useValue: { get: jest.fn(() => undefined) },
          },
          {
            provide: RedisService,
            useValue: mockRedisService,
          },
        ],
      }).compile();

      const serviceWithDefaultConfig =
        module.get<FinanceService>(FinanceService);
      prisma.rechargeOrder.create.mockResolvedValue(mockRechargeOrder);

      const result = await serviceWithDefaultConfig.createRechargeOrder({
        amount: 1000,
        paymentMethod: 'ALIPAY',
      });

      expect(result.payUrl).toContain('https://mock-pay.com/pay');
    });
  });
});
