import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '../src/account/account.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionType } from '@prisma/client';

describe('AccountService - Query Methods (Integration)', () => {
  let service: AccountService;
  let prisma: PrismaService;
  const testUserId = 999999;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService, PrismaService],
    }).compile();

    service = module.get<AccountService>(AccountService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    const account = await prisma.account.findUnique({
      where: { userId: BigInt(testUserId) },
    });

    if (account) {
      await prisma.transaction.deleteMany({
        where: { accountId: account.id },
      });
      await prisma.account.delete({
        where: { id: account.id },
      });
    }

    await prisma.$disconnect();
  });

  describe('getTransactions', () => {
    it('should return empty list for non-existent account', async () => {
      const result = await service.getTransactions(testUserId + 1);
      expect(result.transactions).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return transactions with pagination', async () => {
      // Create account and transactions
      await service.createAccount(testUserId);
      await service.increaseBalance(
        testUserId,
        100,
        'test-order-1',
        'Test order 1',
      );
      await service.increaseBalance(
        testUserId,
        200,
        'test-order-2',
        'Test order 2',
      );

      // Get transactions
      const result = await service.getTransactions(testUserId, {}, 1, 10);

      expect(result.transactions.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.transactions[0].type).toBe(TransactionType.ORDER_INCOME);
    });

    it('should filter transactions by type', async () => {
      const result = await service.getTransactions(
        testUserId,
        { type: TransactionType.ORDER_INCOME },
        1,
        10,
      );

      expect(result.transactions.length).toBe(2);
      expect(result.transactions.every((t) => t.type === TransactionType.ORDER_INCOME)).toBe(true);
    });

    it('should filter transactions by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const result = await service.getTransactions(
        testUserId,
        { startDate: yesterday, endDate: tomorrow },
        1,
        10,
      );

      expect(result.transactions.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const page1 = await service.getTransactions(testUserId, {}, 1, 1);
      const page2 = await service.getTransactions(testUserId, {}, 2, 1);

      expect(page1.transactions.length).toBe(1);
      expect(page2.transactions.length).toBe(1);
      expect(page1.transactions[0].id).not.toBe(page2.transactions[0].id);
    });
  });

  describe('getAccountStats', () => {
    it('should return zero stats for non-existent account', async () => {
      const stats = await service.getAccountStats(testUserId + 1);

      expect(stats.totalIncome).toBe(0);
      expect(stats.totalWithdrawal).toBe(0);
      expect(stats.totalOrders).toBe(0);
      expect(stats.successfulWithdrawals).toBe(0);
      expect(stats.availableBalance).toBe(0);
      expect(stats.frozenBalance).toBe(0);
    });

    it('should return correct stats for existing account', async () => {
      const stats = await service.getAccountStats(testUserId);

      expect(stats.totalIncome).toBe(300); // 100 + 200 from previous tests
      expect(stats.totalWithdrawal).toBe(0);
      expect(stats.totalOrders).toBe(2);
      expect(stats.successfulWithdrawals).toBe(0);
      expect(stats.availableBalance).toBe(300);
      expect(stats.frozenBalance).toBe(0);
    });

    it('should update stats after withdrawal', async () => {
      // Freeze some balance
      await service.freezeBalance(testUserId, 50, 'test-withdrawal-1');

      const stats = await service.getAccountStats(testUserId);

      expect(stats.availableBalance).toBe(250);
      expect(stats.frozenBalance).toBe(50);
    });
  });
});
