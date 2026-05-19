import { RedisService } from '@/common/redis/redis.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentProvider, PaymentStatus, RefundStatus } from '@prisma/client';
import { PaymentProviderFactory } from './payment-provider.factory';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;
  let paymentProviderFactory: PaymentProviderFactory;

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      if (key === 'NODE_ENV') return 'test';
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
      count: jest.fn(),
      findMany: jest.fn(),
    },
    paymentLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockProvider = {
    transfer: jest.fn(),
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
    mockPrismaService.payment.findFirst.mockResolvedValue(null);
    mockPrismaService.payment.create.mockResolvedValue({
      id: BigInt(1),
      orderId: BigInt(101),
      status: PaymentStatus.PENDING,
    });

    const result = await service.create(input as any);

    expect(prisma.payment.create).toHaveBeenCalled();
    expect(result.status).toBe(PaymentStatus.PENDING);
  });

  it('should block duplicate payment', async () => {
    mockPrismaService.payment.findMany.mockResolvedValue([
      { id: BigInt(1), status: PaymentStatus.SUCCESS },
    ]);
    mockPrismaService.payment.findFirst.mockResolvedValue({
      id: BigInt(1),
      status: PaymentStatus.SUCCESS,
    });

    await expect(
      service.create({
        orderId: '101',
        provider: PaymentProvider.WECHAT,
        amount: 88,
      } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('should update payment status', async () => {
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

  it('should handle payment notify success', async () => {
    mockPrismaService.payment.findFirst.mockResolvedValue({
      id: BigInt(1),
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

  it('should create refund for successful payment', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.SUCCESS,
      total: 100,
    });
    mockPrismaService.refund.findMany.mockResolvedValue([]);
    mockPrismaService.refund.create.mockResolvedValue({
      id: BigInt(20),
      status: RefundStatus.PROCESSING,
    });

    const result = await service.createRefund(BigInt(10), 50, 'reason');

    expect(result.status).toBe(RefundStatus.PROCESSING);
  });

  it('should reject refund when amount exceeds total', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.SUCCESS,
      total: 100,
    });
    mockPrismaService.refund.findMany.mockResolvedValue([]);

    await expect(service.createRefund(BigInt(10), 120)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should reject refund when payment not success', async () => {
    mockPrismaService.payment.findUnique.mockResolvedValue({
      id: BigInt(10),
      status: PaymentStatus.FAILED,
      total: 100,
    });

    await expect(service.createRefund(BigInt(10), 20)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should transfer to user with provider', async () => {
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
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should log failed transfer and throw', async () => {
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

    expect(updateSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
  });
});
