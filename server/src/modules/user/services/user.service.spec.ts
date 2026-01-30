import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AccountService } from '@/modules/account/account.service';
import { CreateUserDto } from '../dto';

describe('UserService', () => {
  let service: UserService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockAccountService = {
    createAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      mobile: '13800138000',
      nickname: 'TestUser',
      avatarUrl: 'http://example.com/avatar.jpg',
    };

    it('should create user and account in a transaction', async () => {
      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValue({
            id: BigInt(1),
            email: 'user@example.com',
            ...createUserDto,
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        },
      };

      // Mock findUnique to return null (user doesn't exist)
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Mock $transaction to execute the callback
      mockPrismaService.$transaction.mockImplementation(
        (callback: (tx: typeof mockTx) => Promise<unknown>) => callback(mockTx),
      );

      const result = await service.create(createUserDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockTx.user.create).toHaveBeenCalled();
      expect(mockAccountService.createAccount).toHaveBeenCalledWith(
        BigInt(1),
        mockTx,
      );
      expect(result).toBeDefined();
      expect(result.email).toBe('user@example.com');
    });

    it('should throw error if mobile already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: BigInt(1) });

      await expect(service.create(createUserDto)).rejects.toThrow(
        '手机号已被注册',
      );
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });
  });
});
