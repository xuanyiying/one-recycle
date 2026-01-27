import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

describe('AccountService', () => {
  let service: AccountService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    account: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      if (key === 'CARBON_SAVING_RATE') return 0.02;
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const userId = BigInt(1);

    it('should create an account successfully', async () => {
      const mockAccount = {
        id: BigInt(1),
        userId,
        accountType: 'WALLET',
        availableBalance: 0,
        frozenBalance: 0,
        totalIncome: 0,
        totalWithdrawal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.account.create.mockResolvedValue(mockAccount);

      const result = await service.createAccount(userId);

      expect(result).toEqual(mockAccount);
      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          userId,
          accountType: 'WALLET',
          accountDetails: {},
          availableBalance: 0,
          frozenBalance: 0,
          totalIncome: 0,
          totalWithdrawal: 0,
        },
      });
    });

    it('should use provided transaction client', async () => {
      const mockTx = {
        account: {
          create: jest.fn().mockResolvedValue({ id: BigInt(1) }),
        },
      } as unknown as Prisma.TransactionClient;

      await service.createAccount(userId, mockTx);

      expect(mockTx.account.create).toHaveBeenCalled();
      expect(mockPrismaService.account.create).not.toHaveBeenCalled();
    });

    it('should throw error if creation fails', async () => {
      const error = new Error('Database error');
      mockPrismaService.account.create.mockRejectedValue(error);

      await expect(service.createAccount(userId)).rejects.toThrow(error);
    });
  });

  describe('findAccountByUserId', () => {
    const userId = BigInt(1);

    it('should return account if found', async () => {
      const mockAccount = { id: BigInt(1), userId };
      mockPrismaService.account.findFirst.mockResolvedValue(mockAccount);

      const result = await service.findAccountByUserId(userId);

      expect(result).toEqual(mockAccount);
      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should auto-create account if not found', async () => {
      mockPrismaService.account.findFirst.mockResolvedValue(null);
      const mockCreatedAccount = { id: BigInt(1), userId };
      jest.spyOn(service, 'createAccount').mockResolvedValue(mockCreatedAccount as any);

      const result = await service.findAccountByUserId(userId);

      expect(result).toEqual(mockCreatedAccount);
      expect(service.createAccount).toHaveBeenCalledWith(userId);
    });
  });
});
