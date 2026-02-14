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
      create: jest.fn(),
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

    it('should create user and trigger account creation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: BigInt(1),
        email: 'user@example.com',
        ...createUserDto,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockAccountService.createAccount.mockResolvedValue({ id: BigInt(1) });

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockAccountService.createAccount).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBeDefined();
      expect(result.email).toBe('user@example.com');
    });

    it('should throw error if mobile already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: BigInt(1) });

      await expect(service.create(createUserDto)).rejects.toThrow(
        '手机号已被注册',
      );
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });
});
