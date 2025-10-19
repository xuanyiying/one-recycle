import { Test, TestingModule } from '@nestjs/testing';
import { WithdrawalService } from '../src/withdrawal/withdrawal.service';
import { AccountService } from '../src/account/account.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  WithdrawalNotFoundException,
  MinimumWithdrawalAmountException,
  WithdrawalAlreadyProcessedException,
  PaymentCallbackVerificationException,
} from '../src/withdrawal/exceptions/withdrawal.exceptions';
import { InsufficientBalanceException } from '../src/account/exceptions/account.exceptions';
import { WithdrawalStatus, PaymentProvider } from '@prisma/client';
import { PaymentProviderFactory } from '../src/payment-provider';

describe('WithdrawalService', () => {
  let service: WithdrawalService;
  let accountService: AccountService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    withdrawal: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockAccountService = {
    getAccount: jest.fn(),
    freezeBalance: jest.fn(),
    deductFrozenBalance: jest.fn(),
    unfreezeBalance: jest.fn(),
  };

  const mockPaymentProviderFactory = {
    getProvider: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: PaymentProviderFactory,
          useValue: mockPaymentProviderFactory,
        },
      ],
    }).compile();

    service = module.get<WithdrawalService>(WithdrawalService);
    accountService = module.get<AccountService>(AccountService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createWithdrawal', () => {
    const userId = 123;
    const createDto = {
      amount: 100,
      provider: PaymentProvider.WECHAT,
      accountInfo: {
        openid: 'test-openid',
        realName: '测试用户',
      },
    };

    it('should create withdrawal successfully', async () => {
      const mockAccount = {
        id: BigInt(1),
        userId: BigInt(userId),
        availableBalance: 200,
        frozenBalance: 0,
      };

      const mockWithdrawal = {
        id: BigInt(1),
        accountId: BigInt(1),
        userId: BigInt(userId),
        amount: 100,
        provider: PaymentProvider.WECHAT,
        outTradeNo: 'WD1697123456789abcdef',
        status: WithdrawalStatus.PENDING,
        accountInfo: createDto.accountInfo,
        transactionId: null,
        adminId: null,
        processedAt: null,
        rejectedReason: null,
        callbackData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountService.getAccount.mockResolvedValue(mockAccount);
      mockPrismaService.withdrawal.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          withdrawal: {
            create: jest.fn().mockResolvedValue(mockWithdrawal),
          },
        });
      });

      const result = await service.createWithdrawal(userId, createDto);

      expect(result).toBeDefined();
      expect(result.amount).toBe(100);
      expect(result.status).toBe(WithdrawalStatus.PENDING);
      expect(mockAccountService.getAccount).toHaveBeenCalledWith(userId);
    });

    it('should throw error when amount is below minimum', async () => {
      const invalidDto = { ...createDto, amount: 5 };

      await expect(service.createWithdrawal(userId, invalidDto)).rejects.toThrow(
        MinimumWithdrawalAmountException,
      );
    });

    it('should throw error when insufficient balance', async () => {
      const mockAccount = {
        id: BigInt(1),
        userId: BigInt(userId),
        availableBalance: 50,
        frozenBalance: 0,
      };

      mockAccountService.getAccount.mockResolvedValue(mockAccount);

      await expect(service.createWithdrawal(userId, createDto)).rejects.toThrow(
        InsufficientBalanceException,
      );
    });
  });

  describe('getWithdrawals', () => {
    const userId = 123;

    it('should return paginated withdrawals', async () => {
      const mockWithdrawals = [
        {
          id: BigInt(1),
          userId: BigInt(userId),
          amount: 100,
          status: WithdrawalStatus.PENDING,
          createdAt: new Date(),
        },
        {
          id: BigInt(2),
          userId: BigInt(userId),
          amount: 200,
          status: WithdrawalStatus.SUCCESS,
          createdAt: new Date(),
        },
      ];

      mockPrismaService.withdrawal.count.mockResolvedValue(2);
      mockPrismaService.withdrawal.findMany.mockResolvedValue(mockWithdrawals);

      const result = await service.getWithdrawals(userId, {}, 1, 20);

      expect(result.withdrawals).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrismaService.withdrawal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: BigInt(userId) },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should filter by status', async () => {
      mockPrismaService.withdrawal.count.mockResolvedValue(1);
      mockPrismaService.withdrawal.findMany.mockResolvedValue([]);

      await service.getWithdrawals(
        userId,
        { status: WithdrawalStatus.PENDING },
        1,
        20,
      );

      expect(mockPrismaService.withdrawal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: BigInt(userId),
            status: WithdrawalStatus.PENDING,
          },
        }),
      );
    });
  });

  describe('getWithdrawal', () => {
    const withdrawalId = '1';
    const userId = 123;

    it('should return withdrawal by id', async () => {
      const mockWithdrawal = {
        id: BigInt(1),
        userId: BigInt(userId),
        amount: 100,
        status: WithdrawalStatus.PENDING,
      };

      mockPrismaService.withdrawal.findFirst.mockResolvedValue(mockWithdrawal);

      const result = await service.getWithdrawal(withdrawalId, userId);

      expect(result).toBeDefined();
      expect(mockPrismaService.withdrawal.findFirst).toHaveBeenCalledWith({
        where: {
          id: BigInt(withdrawalId),
          userId: BigInt(userId),
        },
      });
    });

    it('should throw error when withdrawal not found', async () => {
      mockPrismaService.withdrawal.findFirst.mockResolvedValue(null);

      await expect(service.getWithdrawal(withdrawalId, userId)).rejects.toThrow(
        WithdrawalNotFoundException,
      );
    });
  });

  describe('getPendingWithdrawals', () => {
    it('should return pending withdrawals ordered by creation time', async () => {
      const mockWithdrawals = [
        {
          id: BigInt(1),
          status: WithdrawalStatus.PENDING,
          createdAt: new Date('2025-10-15T10:00:00Z'),
        },
        {
          id: BigInt(2),
          status: WithdrawalStatus.PENDING,
          createdAt: new Date('2025-10-15T11:00:00Z'),
        },
      ];

      mockPrismaService.withdrawal.count.mockResolvedValue(2);
      mockPrismaService.withdrawal.findMany.mockResolvedValue(mockWithdrawals);

      const result = await service.getPendingWithdrawals(1, 20);

      expect(result.withdrawals).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrismaService.withdrawal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: WithdrawalStatus.PENDING },
          orderBy: { createdAt: 'asc' }, // 升序，优先处理早期申请
        }),
      );
    });
  });

  describe('getWithdrawalByOutTradeNo', () => {
    const outTradeNo = 'WD1697123456789abcdef';

    it('should return withdrawal by outTradeNo', async () => {
      const mockWithdrawal = {
        id: BigInt(1),
        outTradeNo,
        status: WithdrawalStatus.PENDING,
      };

      mockPrismaService.withdrawal.findUnique.mockResolvedValue(mockWithdrawal);

      const result = await service.getWithdrawalByOutTradeNo(outTradeNo);

      expect(result).toBeDefined();
      expect(mockPrismaService.withdrawal.findUnique).toHaveBeenCalledWith({
        where: { outTradeNo },
      });
    });

    it('should throw error when withdrawal not found', async () => {
      mockPrismaService.withdrawal.findUnique.mockResolvedValue(null);

      await expect(service.getWithdrawalByOutTradeNo(outTradeNo)).rejects.toThrow(
        WithdrawalNotFoundException,
      );
    });
  });

  describe('processWithdrawal', () => {
    const withdrawalId = '1';
    const adminId = 999;
    const mockWithdrawal = {
      id: BigInt(1),
      userId: BigInt(123),
      amount: 100,
      provider: PaymentProvider.WECHAT,
      outTradeNo: 'WD1697123456789abcdef',
      status: WithdrawalStatus.PENDING,
      accountInfo: { openid: 'test-openid', realName: '测试用户' },
    };

    it('should process withdrawal successfully', async () => {
      const mockProvider = {
        transfer: jest.fn().mockResolvedValue({
          success: true,
          transactionId: 'WX123456',
        }),
      };

      mockPrismaService.withdrawal.findUnique.mockResolvedValue(mockWithdrawal);
      mockPrismaService.withdrawal.update
        .mockResolvedValueOnce({
          ...mockWithdrawal,
          status: WithdrawalStatus.PROCESSING,
        })
        .mockResolvedValueOnce({
          ...mockWithdrawal,
          status: WithdrawalStatus.SUCCESS,
        });
      mockPaymentProviderFactory.getProvider.mockReturnValue(mockProvider);

      const result = await service.processWithdrawal(withdrawalId, adminId);

      expect(result.status).toBe(WithdrawalStatus.SUCCESS);
      expect(mockProvider.transfer).toHaveBeenCalled();
      expect(mockAccountService.deductFrozenBalance).toHaveBeenCalled();
    });

    it('should throw error when withdrawal not found', async () => {
      mockPrismaService.withdrawal.findUnique.mockResolvedValue(null);

      await expect(service.processWithdrawal(withdrawalId, adminId)).rejects.toThrow(
        WithdrawalNotFoundException,
      );
    });

    it('should throw error when withdrawal already processed', async () => {
      mockPrismaService.withdrawal.findUnique.mockResolvedValue({
        ...mockWithdrawal,
        status: WithdrawalStatus.SUCCESS,
      });

      await expect(service.processWithdrawal(withdrawalId, adminId)).rejects.toThrow(
        WithdrawalAlreadyProcessedException,
      );
    });
  });

  describe('rejectWithdrawal', () => {
    const withdrawalId = '1';
    const adminId = 999;
    const reason = '账户信息不正确';
    const mockWithdrawal = {
      id: BigInt(1),
      userId: BigInt(123),
      amount: 100,
      provider: PaymentProvider.WECHAT,
      outTradeNo: 'WD1697123456789abcdef',
      status: WithdrawalStatus.PENDING,
    };

    it('should reject withdrawal successfully', async () => {
      mockPrismaService.withdrawal.findUnique.mockResolvedValue(mockWithdrawal);
      mockPrismaService.withdrawal.update.mockResolvedValue({
        ...mockWithdrawal,
        status: WithdrawalStatus.REJECTED,
        rejectedReason: reason,
      });

      const result = await service.rejectWithdrawal(withdrawalId, adminId, reason);

      expect(result.status).toBe(WithdrawalStatus.REJECTED);
      expect(mockAccountService.unfreezeBalance).toHaveBeenCalled();
    });

    it('should throw error when withdrawal already processed', async () => {
      mockPrismaService.withdrawal.findUnique.mockResolvedValue({
        ...mockWithdrawal,
        status: WithdrawalStatus.SUCCESS,
      });

      await expect(
        service.rejectWithdrawal(withdrawalId, adminId, reason),
      ).rejects.toThrow(WithdrawalAlreadyProcessedException);
    });
  });

  describe('handlePaymentCallback', () => {
    const outTradeNo = 'WD1697123456789abcdef';
    const mockWithdrawal = {
      id: BigInt(1),
      userId: BigInt(123),
      amount: 100,
      provider: PaymentProvider.WECHAT,
      outTradeNo,
      status: WithdrawalStatus.PROCESSING,
    };

    it('should handle successful callback', async () => {
      const callbackData = {
        result_code: 'SUCCESS',
        transaction_id: 'WX123456',
        out_trade_no: outTradeNo,
      };

      const mockProvider = {
        verifyCallback: jest.fn().mockReturnValue(true),
      };

      mockPrismaService.withdrawal.findUnique.mockResolvedValue(mockWithdrawal);
      mockPaymentProviderFactory.getProvider.mockReturnValue(mockProvider);
      mockPrismaService.withdrawal.update.mockResolvedValue({
        ...mockWithdrawal,
        status: WithdrawalStatus.SUCCESS,
      });

      await service.handlePaymentCallback(outTradeNo, callbackData);

      expect(mockProvider.verifyCallback).toHaveBeenCalledWith(callbackData);
      expect(mockAccountService.deductFrozenBalance).toHaveBeenCalled();
    });

    it('should throw error when signature verification fails', async () => {
      const callbackData = {
        result_code: 'SUCCESS',
        out_trade_no: outTradeNo,
      };

      const mockProvider = {
        verifyCallback: jest.fn().mockReturnValue(false),
      };

      mockPrismaService.withdrawal.findUnique.mockResolvedValue(mockWithdrawal);
      mockPaymentProviderFactory.getProvider.mockReturnValue(mockProvider);

      await expect(
        service.handlePaymentCallback(outTradeNo, callbackData),
      ).rejects.toThrow(PaymentCallbackVerificationException);
    });

    it('should skip processing if already in final status', async () => {
      const callbackData = {
        result_code: 'SUCCESS',
        out_trade_no: outTradeNo,
      };

      mockPrismaService.withdrawal.findUnique.mockResolvedValue({
        ...mockWithdrawal,
        status: WithdrawalStatus.SUCCESS,
      });

      await service.handlePaymentCallback(outTradeNo, callbackData);

      expect(mockAccountService.deductFrozenBalance).not.toHaveBeenCalled();
    });
  });
});
