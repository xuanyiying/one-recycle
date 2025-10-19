import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from '../src/account/account.controller';
import { AccountService } from '../src/account/account.service';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { AdminGuard } from '../src/common/guards/admin.guard';
import { TransactionType } from '@prisma/client';

describe('AccountController', () => {
  let controller: AccountController;
  let service: AccountService;

  const mockAccountService = {
    getAccount: jest.fn(),
    getTransactions: jest.fn(),
    getAccountStats: jest.fn(),
    createAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyAccount', () => {
    it('should return account for current user', async () => {
      const mockUser = { id: 1, phone: '13800138000', role: 'USER' };
      const mockAccount = {
        id: BigInt(1),
        userId: BigInt(1),
        availableBalance: 100.5,
        frozenBalance: 0,
        totalIncome: 100.5,
        totalWithdrawal: 0,
        version: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountService.getAccount.mockResolvedValue(mockAccount);

      const result = await controller.getMyAccount(mockUser);

      expect(result).toEqual(mockAccount);
      expect(mockAccountService.getAccount).toHaveBeenCalledWith(1);
    });
  });

  describe('getMyTransactions', () => {
    it('should return transactions for current user', async () => {
      const mockUser = { id: 1, phone: '13800138000', role: 'USER' };
      const mockTransactions = {
        transactions: [
          {
            id: BigInt(1),
            accountId: BigInt(1),
            type: TransactionType.ORDER_INCOME,
            amount: 50.0,
            balanceBefore: 0,
            balanceAfter: 50.0,
            orderId: 'ORDER123',
            withdrawalId: null,
            description: '订单收入',
            createdAt: new Date(),
          },
        ],
        total: 1,
      };

      mockAccountService.getTransactions.mockResolvedValue(mockTransactions);

      const filters = { page: 1, limit: 50 };
      const result = await controller.getMyTransactions(mockUser, filters);

      expect(result).toEqual(mockTransactions);
      expect(mockAccountService.getTransactions).toHaveBeenCalledWith(
        1,
        {
          type: undefined,
          startDate: undefined,
          endDate: undefined,
        },
        1,
        50,
      );
    });

    it('should convert date strings to Date objects', async () => {
      const mockUser = { id: 1, phone: '13800138000', role: 'USER' };
      const mockTransactions = { transactions: [], total: 0 };

      mockAccountService.getTransactions.mockResolvedValue(mockTransactions);

      const filters = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        page: 1,
        limit: 50,
      };
      
      await controller.getMyTransactions(mockUser, filters as any);

      expect(mockAccountService.getTransactions).toHaveBeenCalledWith(
        1,
        {
          type: undefined,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
        },
        1,
        50,
      );
    });
  });

  describe('getMyStats', () => {
    it('should return stats for current user', async () => {
      const mockUser = { id: 1, phone: '13800138000', role: 'USER' };
      const mockStats = {
        totalIncome: 100.5,
        totalWithdrawal: 0,
        totalOrders: 2,
        successfulWithdrawals: 0,
        availableBalance: 100.5,
        frozenBalance: 0,
      };

      mockAccountService.getAccountStats.mockResolvedValue(mockStats);

      const result = await controller.getMyStats(mockUser);

      expect(result).toEqual(mockStats);
      expect(mockAccountService.getAccountStats).toHaveBeenCalledWith(1);
    });
  });

  describe('getAccount (Admin)', () => {
    it('should allow admin to get any user account', async () => {
      const mockAccount = {
        id: BigInt(1),
        userId: BigInt(2),
        availableBalance: 200.0,
        frozenBalance: 0,
        totalIncome: 200.0,
        totalWithdrawal: 0,
        version: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAccountService.getAccount.mockResolvedValue(mockAccount);

      const result = await controller.getAccount('2');

      expect(result).toEqual(mockAccount);
      expect(mockAccountService.getAccount).toHaveBeenCalledWith(2);
    });
  });

  describe('getTransactions (Admin)', () => {
    it('should allow admin to get any user transactions', async () => {
      const mockTransactions = {
        transactions: [],
        total: 0,
      };

      mockAccountService.getTransactions.mockResolvedValue(mockTransactions);

      const filters = { page: 1, limit: 50 };
      const result = await controller.getTransactions('2', filters);

      expect(result).toEqual(mockTransactions);
      expect(mockAccountService.getTransactions).toHaveBeenCalledWith(
        2,
        {
          type: undefined,
          startDate: undefined,
          endDate: undefined,
        },
        1,
        50,
      );
    });
  });
});
