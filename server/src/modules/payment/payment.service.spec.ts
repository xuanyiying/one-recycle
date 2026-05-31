import { QUEUE_NAMES, RedisService } from '@/common';
import { PrismaService } from '@/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bull';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PaymentProvider,
  PaymentStatus,
  Prisma,
  RefundStatus,
} from '@prisma/client';
import { PaymentProviderFactory } from './payment-provider.factory';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;
  let paymentProviderFactory: PaymentProviderFactory;

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      if (key === 'NODE_ENV') return 'test';
      if (key === 'PAYMENT_TIMEOUT_MINUTES') return 30;
      if (key === 'PAYMENT_NUMBER_PREFIX') return 'OUT';
      if (key === 'PAYMENT_WORKER_ID') return 9;
      if (key === 'DATACENTER_ID') return 1;
      return defaultValue;
    }),
  };

  const mockRedisService = {
    getClient: jest.fn(() => ({
      incr: jest.fn(),
      decr: jest.fn(),
      get: jest.fn(),
    })),
  };

  const mockPrismaService = {
    payment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    refund: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    paymentLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockPaymentTimeoutQueue = {
    add: jest.fn(),
  };

  const mockProvider = {
    transfer: jest.fn(),
    refund: jest.fn(),
  };

  const mockPaymentProviderFactory = {
    getProvider: jest.fn(() => mockProvider),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
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
          provide: PaymentProviderFactory,
          useValue: mockPaymentProviderFactory,
        },
        {
          provide: getQueueToken(QUEUE_NAMES.PAYMENT_TIMEOUT),
          useValue: mockPaymentTimeoutQueue,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
    paymentProviderFactory = module.get<PaymentProviderFactory>(
      PaymentProviderFactory,
    );
    (service as any).idGenerator = {
      nextId: jest.fn(() => 9001),
      initialize: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create payment when no success record exists', async () => {
    const input = {
      orderId: '101',
      provider: PaymentProvider.WECHAT,
      amount: 88,
    };
    mockPrismaService.payment.findMany.mockResolvedValue([]);
    mockPrismaService.payment.create.mockResolvedValue({
      id: BigInt(1),
      orderId: BigInt(101),
      status: PaymentStatus.PENDING,
    });

    const result = await service.create(input as any);

    expect(prisma.payment.create).toHaveBeenCalled();
    expect(mockPaymentTimeoutQueue.add).toHaveBeenCalledWith(
      'payment-timeout',
      { paymentId: BigInt(1) },
      { delay: 30 * 60 * 1000 },
    );
    expect(result.status).toBe(PaymentStatus.PENDING);
  });

  it('should block duplicate payment', async () => {
    mockPrismaService.payment.findMany.mockResolvedValue([
      { id: BigInt(1), status: PaymentStatus.SUCCESS },
    ]);

    await expect(
      service.create({
        orderId: '101',
        provider: PaymentProvider.WECHAT,
        amount: 88,
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('should close expired PENDING payment and create new one', async () => {
    const expiredDate = new Date(Date.now() - 31 * 60 * 1000);
    mockPrismaService.payment.findMany.mockResolvedValue([
      { id: BigInt(1), status: PaymentStatus.PENDING, createdAt: expiredDate },
    ]);
    mockPrismaService.payment.update.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.FAILED,
    });
    mockPrismaService.payment.create.mockResolvedValue({
      id: BigInt(2),
      status: PaymentStatus.PENDING,
    });

    const result = await service.create({
      orderId: '101',
      provider: PaymentProvider.WECHAT,
      amount: 88,
    } as any);

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: BigInt(1) },
      data: { status: PaymentStatus.FAILED, closedAt: expect.any(Date) },
    });
    expect(prisma.payment.create).toHaveBeenCalled();
    expect(mockPaymentTimeoutQueue.add).toHaveBeenCalled();
    expect(result.status).toBe(PaymentStatus.PENDING);
  });

  it('should return existing PENDING payment if not expired', async () => {
    const recentDate = new Date(Date.now() - 5 * 60 * 1000);
    const existingPending = {
      id: BigInt(1),
      status: PaymentStatus.PENDING,
      createdAt: recentDate,
    };
    mockPrismaService.payment.findMany.mockResolvedValue([existingPending]);

    const result = await service.create({
      orderId: '101',
      provider: PaymentProvider.WECHAT,
      amount: 88,
    } as any);

    expect(result).toBe(existingPending);
    expect(prisma.payment.create).not.toHaveBeenCalled();
  });

  it('should update payment status with valid transition', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.PENDING,
    });
    mockPrismaService.payment.update.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.SUCCESS,
    });

    const result = await service.updatePaymentStatus(
      BigInt(10001),
      PaymentStatus.SUCCESS,
    );

    expect(result.status).toBe(PaymentStatus.SUCCESS);
  });

  it('should reject update for missing payment', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue(null);

    await expect(
      service.updatePaymentStatus(BigInt(10001), PaymentStatus.SUCCESS),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject invalid payment status transition', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.FAILED,
    });

    await expect(
      service.updatePaymentStatus(BigInt(10001), PaymentStatus.SUCCESS),
    ).rejects.toThrow(ConflictException);
  });

  it('should handle payment notify success', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.WECHAT,
    });
    mockPrismaService.payment.updateMany.mockResolvedValue({
      count: 1,
    });
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.SUCCESS,
    });

    const result = await service.handlePaymentNotify({
      outTradeNo: 'OUT9001',
      tradeState: 'SUCCESS',
      transactionId: '123456',
      notifyRaw: '{}',
    });

    expect(result?.status).toBe(PaymentStatus.SUCCESS);
  });

  it('should throw on notify when payment not found', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue(null);

    await expect(
      service.handlePaymentNotify({
        outTradeNo: 'OUT9001',
        tradeState: 'SUCCESS',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return already processed payment on notify', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.SUCCESS,
      provider: PaymentProvider.WECHAT,
    });
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.SUCCESS,
    });

    const result = await service.handlePaymentNotify({
      outTradeNo: 'OUT9001',
      tradeState: 'SUCCESS',
      transactionId: '123456',
      notifyRaw: '{}',
    });

    expect(result!.status).toBe(PaymentStatus.SUCCESS);
    expect(prisma.payment.updateMany).not.toHaveBeenCalled();
  });

  it('should create refund for successful payment', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.SUCCESS,
      total: new Prisma.Decimal(100),
      provider: PaymentProvider.WECHAT,
      outTradeNo: 'OUT9001',
    });
    mockPrismaService.refund.findMany.mockResolvedValue([]);
    mockPrismaService.refund.create.mockResolvedValue({
      id: BigInt(20),
      status: RefundStatus.PROCESSING,
    });
    mockProvider.refund.mockResolvedValue({
      success: true,
      refundId: 'REF123',
    });
    mockPrismaService.refund.update.mockResolvedValue({
      id: BigInt(20),
      status: RefundStatus.SUCCESS,
      notifyRaw: JSON.stringify({ refundId: 'REF123' }),
    });

    const result = await service.createRefund(BigInt(10), 50, 'reason');

    expect(result.status).toBe(RefundStatus.SUCCESS);
    expect(mockProvider.refund).toHaveBeenCalledWith(
      'OUT9001',
      'REF9001',
      100,
      50,
      'reason',
    );
  });

  it('should reject refund when amount exceeds total', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.SUCCESS,
      total: new Prisma.Decimal(100),
    });

    await expect(service.createRefund(BigInt(10), 120)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should reject refund when payment not success', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.FAILED,
      total: new Prisma.Decimal(100),
    });

    await expect(service.createRefund(BigInt(10), 20)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should reject refund when amount is zero or negative', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.SUCCESS,
      total: new Prisma.Decimal(100),
    });

    await expect(service.createRefund(BigInt(10), 0)).rejects.toThrow(
      ConflictException,
    );
    await expect(service.createRefund(BigInt(10), -10)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should mark refund FAILED when provider refund returns failure', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.SUCCESS,
      total: new Prisma.Decimal(100),
      provider: PaymentProvider.WECHAT,
      outTradeNo: 'OUT9001',
    });
    mockPrismaService.refund.findMany.mockResolvedValue([]);
    mockPrismaService.refund.create.mockResolvedValue({
      id: BigInt(20),
      status: RefundStatus.PROCESSING,
    });
    mockProvider.refund.mockResolvedValue({
      success: false,
      message: 'bank rejected',
    });

    await expect(
      service.createRefund(BigInt(10), 50, 'reason'),
    ).rejects.toThrow(ConflictException);

    expect(mockPrismaService.refund.update).toHaveBeenCalledWith({
      where: { id: BigInt(20) },
      data: { status: RefundStatus.FAILED },
    });
  });

  it('should mark refund FAILED when provider refund throws', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.SUCCESS,
      total: new Prisma.Decimal(100),
      provider: PaymentProvider.WECHAT,
      outTradeNo: 'OUT9001',
    });
    mockPrismaService.refund.findMany.mockResolvedValue([]);
    mockPrismaService.refund.create.mockResolvedValue({
      id: BigInt(20),
      status: RefundStatus.PROCESSING,
    });
    mockProvider.refund.mockRejectedValue(new Error('network error'));

    await expect(
      service.createRefund(BigInt(10), 50, 'reason'),
    ).rejects.toThrow('network error');

    expect(mockPrismaService.refund.update).toHaveBeenCalledWith({
      where: { id: BigInt(20) },
      data: { status: RefundStatus.FAILED },
    });
  });

  it('should reject invalid refund status transitions', async () => {
    mockPrismaService.refund.findUnique.mockResolvedValue({
      id: BigInt(1),
      status: RefundStatus.SUCCESS,
    });

    await expect(
      service.updateRefundStatus(BigInt(1), RefundStatus.PROCESSING),
    ).rejects.toThrow(ConflictException);
  });

  it('should allow valid refund status transition', async () => {
    mockPrismaService.refund.findUnique.mockResolvedValue({
      id: BigInt(1),
      status: RefundStatus.PROCESSING,
    });
    mockPrismaService.refund.update.mockResolvedValue({
      id: BigInt(1),
      status: RefundStatus.SUCCESS,
    });

    const result = await service.updateRefundStatus(
      BigInt(1),
      RefundStatus.SUCCESS,
    );

    expect(result.status).toBe(RefundStatus.SUCCESS);
  });

  it('should update payment to REFUNDED when full refund succeeds', async () => {
    mockPrismaService.refund.findFirst.mockResolvedValue({
      id: BigInt(1),
      outRefundNo: 'REF9001',
      status: RefundStatus.PROCESSING,
      paymentId: BigInt(10),
      payment: {
        id: BigInt(10),
        provider: PaymentProvider.WECHAT,
        total: new Prisma.Decimal(100),
      },
    });
    mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.refund.findMany.mockResolvedValue([
      { refundAmount: 100 },
    ]);
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      total: new Prisma.Decimal(100),
    });
    mockPrismaService.payment.update.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.REFUNDED,
    });
    mockPrismaService.refund.findUnique.mockResolvedValue({
      id: BigInt(1),
      status: RefundStatus.SUCCESS,
      payment: { id: BigInt(10), status: PaymentStatus.REFUNDED },
    });

    await service.handleRefundNotify({
      outRefundNo: 'REF9001',
      refundStatus: 'SUCCESS',
    });

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: BigInt(10) },
      data: { status: PaymentStatus.REFUNDED },
    });
  });

  it('should not update payment to REFUNDED when partial refund', async () => {
    mockPrismaService.refund.findFirst.mockResolvedValue({
      id: BigInt(1),
      outRefundNo: 'REF9001',
      status: RefundStatus.PROCESSING,
      paymentId: BigInt(10),
      payment: {
        id: BigInt(10),
        provider: PaymentProvider.WECHAT,
        total: new Prisma.Decimal(100),
      },
    });
    mockPrismaService.refund.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.refund.findMany.mockResolvedValue([{ refundAmount: 50 }]);
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      total: new Prisma.Decimal(100),
    });
    mockPrismaService.refund.findUnique.mockResolvedValue({
      id: BigInt(1),
      status: RefundStatus.SUCCESS,
      payment: { id: BigInt(10) },
    });

    await service.handleRefundNotify({
      outRefundNo: 'REF9001',
      refundStatus: 'SUCCESS',
    });

    expect(prisma.payment.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: PaymentStatus.REFUNDED }),
      }),
    );
  });

  it('should throw on refund notify when refund not found', async () => {
    mockPrismaService.refund.findFirst.mockResolvedValue(null);

    await expect(
      service.handleRefundNotify({
        outRefundNo: 'REF9001',
        refundStatus: 'SUCCESS',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return already processed refund on notify', async () => {
    mockPrismaService.refund.findFirst.mockResolvedValue({
      id: BigInt(1),
      outRefundNo: 'REF9001',
      status: RefundStatus.SUCCESS,
      paymentId: BigInt(10),
      payment: {
        id: BigInt(10),
        provider: PaymentProvider.WECHAT,
      },
    });
    mockPrismaService.refund.findUnique.mockResolvedValue({
      id: BigInt(1),
      status: RefundStatus.SUCCESS,
      payment: { id: BigInt(10) },
    });

    const result = await service.handleRefundNotify({
      outRefundNo: 'REF9001',
      refundStatus: 'SUCCESS',
    });

    expect(result!.status).toBe(RefundStatus.SUCCESS);
    expect(prisma.refund.updateMany).not.toHaveBeenCalled();
  });

  it('should transfer to user with provider', async () => {
    mockPrismaService.payment.create.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.PENDING,
    });
    mockProvider.transfer.mockResolvedValue({ success: true });
    const updateSpy = jest
      .spyOn(service, 'updatePaymentStatus')
      .mockResolvedValue({} as any);

    await service.transferToUser(
      BigInt(1),
      10,
      PaymentProvider.WECHAT,
      { openid: 'openid-1', realName: 'A' },
      'Order Settlement',
      BigInt(9),
    );

    expect(paymentProviderFactory.getProvider).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith(
      expect.any(BigInt),
      PaymentStatus.SUCCESS,
    );
  });

  it('should log failed transfer and throw', async () => {
    mockPrismaService.payment.create.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.PENDING,
    });
    mockProvider.transfer.mockResolvedValue({
      success: false,
      message: 'fail',
    });
    const updateSpy = jest
      .spyOn(service, 'updatePaymentStatus')
      .mockResolvedValue({} as any);
    const logSpy = jest
      .spyOn(service, 'createPaymentLog')
      .mockResolvedValue({} as any);

    await expect(
      service.transferToUser(
        BigInt(1),
        10,
        PaymentProvider.WECHAT,
        { openid: 'openid-1', realName: 'A' },
        'Order Settlement',
        BigInt(9),
      ),
    ).rejects.toThrow('fail');

    expect(updateSpy).toHaveBeenCalledWith(
      expect.any(BigInt),
      PaymentStatus.FAILED,
    );
    expect(logSpy).toHaveBeenCalled();
  });

  it('should not update to FAILED if already SUCCESS in transferToUser catch', async () => {
    mockPrismaService.payment.create.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.PENDING,
    });
    mockProvider.transfer.mockRejectedValue(
      new Error('Network error after success'),
    );
    mockPrismaService.payment.findFirst.mockResolvedValue({
      status: PaymentStatus.SUCCESS,
    });
    const updateSpy = jest
      .spyOn(service, 'updatePaymentStatus')
      .mockResolvedValue({} as any);

    await expect(
      service.transferToUser(
        BigInt(1),
        10,
        PaymentProvider.WECHAT,
        { openid: 'openid-1', realName: 'A' },
        'Order Settlement',
        BigInt(9),
      ),
    ).rejects.toThrow('Network error after success');

    expect(updateSpy).not.toHaveBeenCalled();
  });
});
