import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';
import {
  AccountNotFoundException,
  InsufficientBalanceException,
  InsufficientFrozenBalanceException,
  OptimisticLockException,
  DuplicateOrderIncomeException,
} from './exceptions/account.exceptions';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  private readonly MAX_RETRIES = 3;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建账户
   * 为新用户自动创建积分账户，初始余额为0
   */
  async createAccount(userId: number): Promise<Account> {
    this.logger.log(`Creating account for user ${userId}`);

    try {
      const account = await this.prisma.account.create({
        data: {
          userId: BigInt(userId),
          availableBalance: new Prisma.Decimal(0),
          frozenBalance: new Prisma.Decimal(0),
          totalIncome: new Prisma.Decimal(0),
          totalWithdrawal: new Prisma.Decimal(0),
          version: 0,
        },
      });

      this.logger.log(`Account created successfully for user ${userId}`);
      return this.mapAccountToEntity(account);
    } catch (error: any) {
      // 如果账户已存在，返回现有账户
      if (error.code === 'P2002') {
        this.logger.log(`Account already exists for user ${userId}`);
        return this.getAccount(userId);
      }
      throw error;
    }
  }

  /**
   * 查询账户信息
   * 如果账户不存在，自动创建
   */
  async getAccount(userId: number): Promise<Account> {
    this.logger.log(`Getting account for user ${userId}`);

    const account = await this.prisma.account.findUnique({
      where: { userId: BigInt(userId) },
    });

    if (!account) {
      // 自动创建账户
      return this.createAccount(userId);
    }

    return this.mapAccountToEntity(account);
  }

  /**
   * 增加余额（订单收入）
   * 使用事务确保原子性，实现乐观锁防止并发冲突
   */
  async increaseBalance(
    userId: number,
    amount: number,
    orderId: string,
    description: string,
  ): Promise<Transaction> {
    this.logger.log(
      `Increasing balance for user ${userId}, amount: ${amount}, orderId: ${orderId}`,
    );

    // 验证金额
    if (amount <= 0) {
      throw new InsufficientBalanceException(0, amount);
    }

    // 检查订单是否已入账（幂等性）
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        orderId,
        type: TransactionType.ORDER_INCOME,
      },
    });

    if (existingTransaction) {
      throw new DuplicateOrderIncomeException(orderId);
    }

    // 使用重试机制处理乐观锁冲突
    return this.retryOnOptimisticLock(async () => {
      return this.prisma.$transaction(async (tx) => {
        // 获取或创建账户
        let account = await tx.account.findUnique({
          where: { userId: BigInt(userId) },
        });

        if (!account) {
          account = await tx.account.create({
            data: {
              userId: BigInt(userId),
              availableBalance: new Prisma.Decimal(0),
              frozenBalance: new Prisma.Decimal(0),
              totalIncome: new Prisma.Decimal(0),
              totalWithdrawal: new Prisma.Decimal(0),
              version: 0,
            },
          });
        }

        const currentVersion = account.version;
        const balanceBefore = Number(account.availableBalance);
        const balanceAfter = balanceBefore + amount;

        // 更新账户余额（使用乐观锁）
        const updatedAccount = await tx.account.updateMany({
          where: {
            userId: BigInt(userId),
            version: currentVersion,
          },
          data: {
            availableBalance: new Prisma.Decimal(balanceAfter),
            totalIncome: {
              increment: new Prisma.Decimal(amount),
            },
            version: {
              increment: 1,
            },
          },
        });

        // 检查是否更新成功（乐观锁检查）
        if (updatedAccount.count === 0) {
          throw new OptimisticLockException(userId);
        }

        // 创建交易记录
        const transaction = await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.ORDER_INCOME,
            amount: new Prisma.Decimal(amount),
            balanceBefore: new Prisma.Decimal(balanceBefore),
            balanceAfter: new Prisma.Decimal(balanceAfter),
            orderId,
            description,
          },
        });

        this.logger.log(
          `Balance increased successfully for user ${userId}, new balance: ${balanceAfter}`,
        );

        return this.mapTransactionToEntity(transaction);
      });
    });
  }

  /**
   * 冻结余额（提现申请）
   * 使用事务确保原子性，实现乐观锁防止并发冲突
   */
  async freezeBalance(
    userId: number,
    amount: number,
    withdrawalId: string,
    txClient?: Prisma.TransactionClient,
  ): Promise<Transaction> {
    this.logger.log(
      `Freezing balance for user ${userId}, amount: ${amount}, withdrawalId: ${withdrawalId}`,
    );

    // 验证金额
    if (amount <= 0) {
      throw new InsufficientBalanceException(0, amount);
    }

    // 内部执行函数
    const executeFreeze = async (tx: Prisma.TransactionClient) => {
      // 获取账户
      const account = await tx.account.findUnique({
        where: { userId: BigInt(userId) },
      });

      if (!account) {
        throw new AccountNotFoundException(userId);
      }

      const currentVersion = account.version;
      const availableBalance = Number(account.availableBalance);

      // 检查可用余额是否足够
      if (availableBalance < amount) {
        throw new InsufficientBalanceException(availableBalance, amount);
      }

      const balanceBefore = availableBalance;
      const balanceAfter = availableBalance - amount;
      const frozenAfter = Number(account.frozenBalance) + amount;

      // 更新账户余额（使用乐观锁）
      const updatedAccount = await tx.account.updateMany({
        where: {
          userId: BigInt(userId),
          version: currentVersion,
        },
        data: {
          availableBalance: new Prisma.Decimal(balanceAfter),
          frozenBalance: new Prisma.Decimal(frozenAfter),
          version: {
            increment: 1,
          },
        },
      });

      // 检查是否更新成功（乐观锁检查）
      if (updatedAccount.count === 0) {
        throw new OptimisticLockException(userId);
      }

      // 创建交易记录
      const transaction = await tx.transaction.create({
        data: {
          accountId: account.id,
          type: TransactionType.WITHDRAWAL_FREEZE,
          amount: new Prisma.Decimal(amount),
          balanceBefore: new Prisma.Decimal(balanceBefore),
          balanceAfter: new Prisma.Decimal(balanceAfter),
          withdrawalId: BigInt(withdrawalId),
          description: `提现冻结 - ${withdrawalId}`,
        },
      });

      this.logger.log(
        `Balance frozen successfully for user ${userId}, frozen: ${amount}`,
      );

      return this.mapTransactionToEntity(transaction);
    };

    // 如果提供了事务客户端，直接使用
    if (txClient) {
      return executeFreeze(txClient);
    }

    // 否则创建新事务并使用重试机制
    return this.retryOnOptimisticLock(async () => {
      return this.prisma.$transaction(async (tx) => {
        return executeFreeze(tx);
      });
    });
  }

  /**
   * 扣除冻结余额（提现成功）
   * 使用事务确保原子性，实现乐观锁防止并发冲突
   */
  async deductFrozenBalance(
    userId: number,
    amount: number,
    withdrawalId: string,
  ): Promise<Transaction> {
    this.logger.log(
      `Deducting frozen balance for user ${userId}, amount: ${amount}, withdrawalId: ${withdrawalId}`,
    );

    // 验证金额
    if (amount <= 0) {
      throw new InsufficientBalanceException(0, amount);
    }

    // 使用重试机制处理乐观锁冲突
    return this.retryOnOptimisticLock(async () => {
      return this.prisma.$transaction(async (tx) => {
        // 获取账户
        const account = await tx.account.findUnique({
          where: { userId: BigInt(userId) },
        });

        if (!account) {
          throw new AccountNotFoundException(userId);
        }

        const currentVersion = account.version;
        const frozenBalance = Number(account.frozenBalance);

        // 检查冻结余额是否足够
        if (frozenBalance < amount) {
          throw new InsufficientFrozenBalanceException(frozenBalance, amount);
        }

        const balanceBefore = Number(account.availableBalance);
        const balanceAfter = balanceBefore; // 可用余额不变
        const frozenAfter = frozenBalance - amount;

        // 更新账户余额（使用乐观锁）
        const updatedAccount = await tx.account.updateMany({
          where: {
            userId: BigInt(userId),
            version: currentVersion,
          },
          data: {
            frozenBalance: new Prisma.Decimal(frozenAfter),
            totalWithdrawal: {
              increment: new Prisma.Decimal(amount),
            },
            version: {
              increment: 1,
            },
          },
        });

        // 检查是否更新成功（乐观锁检查）
        if (updatedAccount.count === 0) {
          throw new OptimisticLockException(userId);
        }

        // 创建交易记录
        const transaction = await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.WITHDRAWAL_SUCCESS,
            amount: new Prisma.Decimal(amount),
            balanceBefore: new Prisma.Decimal(balanceBefore),
            balanceAfter: new Prisma.Decimal(balanceAfter),
            withdrawalId: BigInt(withdrawalId),
            description: `提现成功 - ${withdrawalId}`,
          },
        });

        this.logger.log(
          `Frozen balance deducted successfully for user ${userId}, amount: ${amount}`,
        );

        return this.mapTransactionToEntity(transaction);
      });
    });
  }

  /**
   * 解冻余额（提现失败/拒绝）
   * 使用事务确保原子性，实现乐观锁防止并发冲突
   */
  async unfreezeBalance(
    userId: number,
    amount: number,
    withdrawalId: string,
  ): Promise<Transaction> {
    this.logger.log(
      `Unfreezing balance for user ${userId}, amount: ${amount}, withdrawalId: ${withdrawalId}`,
    );

    // 验证金额
    if (amount <= 0) {
      throw new InsufficientBalanceException(0, amount);
    }

    // 使用重试机制处理乐观锁冲突
    return this.retryOnOptimisticLock(async () => {
      return this.prisma.$transaction(async (tx) => {
        // 获取账户
        const account = await tx.account.findUnique({
          where: { userId: BigInt(userId) },
        });

        if (!account) {
          throw new AccountNotFoundException(userId);
        }

        const currentVersion = account.version;
        const frozenBalance = Number(account.frozenBalance);

        // 检查冻结余额是否足够
        if (frozenBalance < amount) {
          throw new InsufficientFrozenBalanceException(frozenBalance, amount);
        }

        const balanceBefore = Number(account.availableBalance);
        const balanceAfter = balanceBefore + amount;
        const frozenAfter = frozenBalance - amount;

        // 更新账户余额（使用乐观锁）
        const updatedAccount = await tx.account.updateMany({
          where: {
            userId: BigInt(userId),
            version: currentVersion,
          },
          data: {
            availableBalance: new Prisma.Decimal(balanceAfter),
            frozenBalance: new Prisma.Decimal(frozenAfter),
            version: {
              increment: 1,
            },
          },
        });

        // 检查是否更新成功（乐观锁检查）
        if (updatedAccount.count === 0) {
          throw new OptimisticLockException(userId);
        }

        // 创建交易记录
        const transaction = await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.WITHDRAWAL_REJECTED,
            amount: new Prisma.Decimal(amount),
            balanceBefore: new Prisma.Decimal(balanceBefore),
            balanceAfter: new Prisma.Decimal(balanceAfter),
            withdrawalId: BigInt(withdrawalId),
            description: `提现解冻 - ${withdrawalId}`,
          },
        });

        this.logger.log(
          `Balance unfrozen successfully for user ${userId}, amount: ${amount}`,
        );

        return this.mapTransactionToEntity(transaction);
      });
    });
  }

  /**
   * 重试机制处理乐观锁冲突
   */
  private async retryOnOptimisticLock<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof OptimisticLockException) {
          lastError = error;
          this.logger.warn(
            `Optimistic lock conflict detected, retry attempt ${attempt}/${this.MAX_RETRIES}`,
          );

          // 等待一小段时间后重试
          await this.sleep(50 * attempt);

          if (attempt === this.MAX_RETRIES) {
            throw lastError;
          }
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Unexpected error in retry operation');
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 查询交易记录
   * 支持按时间范围、交易类型筛选，分页返回结果
   */
  async getTransactions(
    userId: number,
    filters: {
      type?: TransactionType;
      startDate?: Date;
      endDate?: Date;
    } = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    this.logger.log(
      `Getting transactions for user ${userId}, page: ${page}, limit: ${limit}`,
    );

    // 获取账户
    const account = await this.prisma.account.findUnique({
      where: { userId: BigInt(userId) },
    });

    if (!account) {
      // 如果账户不存在，返回空列表
      return { transactions: [], total: 0 };
    }

    // 构建查询条件
    const where: any = {
      accountId: account.id,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // 查询总数
    const total = await this.prisma.transaction.count({ where });

    // 查询交易记录（分页）
    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    this.logger.log(
      `Found ${transactions.length} transactions for user ${userId}, total: ${total}`,
    );

    return {
      transactions: transactions.map((t) => this.mapTransactionToEntity(t)),
      total,
    };
  }

  /**
   * 获取账户统计数据
   * 包括总收入、总提现、订单数、成功提现次数等
   */
  async getAccountStats(userId: number): Promise<{
    totalIncome: number;
    totalWithdrawal: number;
    totalOrders: number;
    successfulWithdrawals: number;
    availableBalance: number;
    frozenBalance: number;
  }> {
    this.logger.log(`Getting account stats for user ${userId}`);

    // 获取账户
    const account = await this.prisma.account.findUnique({
      where: { userId: BigInt(userId) },
    });

    if (!account) {
      // 如果账户不存在，返回零值统计
      return {
        totalIncome: 0,
        totalWithdrawal: 0,
        totalOrders: 0,
        successfulWithdrawals: 0,
        availableBalance: 0,
        frozenBalance: 0,
      };
    }

    // 统计订单收入次数
    const totalOrders = await this.prisma.transaction.count({
      where: {
        accountId: account.id,
        type: TransactionType.ORDER_INCOME,
      },
    });

    // 统计成功提现次数
    const successfulWithdrawals = await this.prisma.transaction.count({
      where: {
        accountId: account.id,
        type: TransactionType.WITHDRAWAL_SUCCESS,
      },
    });

    const stats = {
      totalIncome: Number(account.totalIncome),
      totalWithdrawal: Number(account.totalWithdrawal),
      totalOrders,
      successfulWithdrawals,
      availableBalance: Number(account.availableBalance),
      frozenBalance: Number(account.frozenBalance),
    };

    this.logger.log(`Account stats for user ${userId}: ${JSON.stringify(stats)}`);

    return stats;
  }

  /**
   * 退款（订单取消）
   * 扣除用户余额，创建REFUND类型交易记录
   * 验证：
   * 1. 检查是否存在ORDER_INCOME类型的交易记录
   * 2. 确保用户availableBalance足够扣除
   */
  async refundBalance(
    userId: number,
    amount: number,
    orderId: string,
    description: string,
  ): Promise<Transaction> {
    this.logger.log(
      `Processing refund for user ${userId}, amount: ${amount}, orderId: ${orderId}`,
    );

    // 验证金额
    if (amount <= 0) {
      throw new InsufficientBalanceException(0, amount);
    }

    // 检查是否存在ORDER_INCOME类型的交易记录
    const incomeTransaction = await this.prisma.transaction.findFirst({
      where: {
        orderId,
        type: TransactionType.ORDER_INCOME,
      },
    });

    if (!incomeTransaction) {
      this.logger.warn(
        `No income transaction found for order ${orderId}, cannot refund`,
      );
      throw new Error(`Order ${orderId} has not been credited, cannot refund`);
    }

    // 检查是否已经退款过（幂等性）
    const existingRefund = await this.prisma.transaction.findFirst({
      where: {
        orderId,
        type: TransactionType.REFUND,
      },
    });

    if (existingRefund) {
      this.logger.warn(`Order ${orderId} already refunded, skipping`);
      return this.mapTransactionToEntity(existingRefund);
    }

    // 使用重试机制处理乐观锁冲突
    return this.retryOnOptimisticLock(async () => {
      return this.prisma.$transaction(async (tx) => {
        // 获取账户
        const account = await tx.account.findUnique({
          where: { userId: BigInt(userId) },
        });

        if (!account) {
          throw new AccountNotFoundException(userId);
        }

        const currentVersion = account.version;
        const availableBalance = Number(account.availableBalance);

        // 检查可用余额是否足够
        if (availableBalance < amount) {
          throw new InsufficientBalanceException(availableBalance, amount);
        }

        const balanceBefore = availableBalance;
        const balanceAfter = availableBalance - amount;

        // 更新账户余额（使用乐观锁）
        const updatedAccount = await tx.account.updateMany({
          where: {
            userId: BigInt(userId),
            version: currentVersion,
          },
          data: {
            availableBalance: new Prisma.Decimal(balanceAfter),
            totalIncome: {
              decrement: new Prisma.Decimal(amount),
            },
            version: {
              increment: 1,
            },
          },
        });

        // 检查是否更新成功（乐观锁检查）
        if (updatedAccount.count === 0) {
          throw new OptimisticLockException(userId);
        }

        // 创建退款交易记录
        const transaction = await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.REFUND,
            amount: new Prisma.Decimal(amount),
            balanceBefore: new Prisma.Decimal(balanceBefore),
            balanceAfter: new Prisma.Decimal(balanceAfter),
            orderId,
            description,
          },
        });

        this.logger.log(
          `Refund processed successfully for user ${userId}, refunded: ${amount}, new balance: ${balanceAfter}`,
        );

        return this.mapTransactionToEntity(transaction);
      });
    });
  }

  /**
   * 映射数据库模型到实体
   */
  private mapAccountToEntity(account: any): Account {
    return {
      id: account.id,
      userId: account.userId,
      availableBalance: Number(account.availableBalance),
      frozenBalance: Number(account.frozenBalance),
      totalIncome: Number(account.totalIncome),
      totalWithdrawal: Number(account.totalWithdrawal),
      version: account.version,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  /**
   * 映射交易记录到实体
   */
  private mapTransactionToEntity(transaction: any): Transaction {
    return {
      id: transaction.id,
      accountId: transaction.accountId,
      type: transaction.type,
      amount: Number(transaction.amount),
      balanceBefore: Number(transaction.balanceBefore),
      balanceAfter: Number(transaction.balanceAfter),
      orderId: transaction.orderId,
      withdrawalId: transaction.withdrawalId,
      description: transaction.description,
      createdAt: transaction.createdAt,
    };
  }
}
