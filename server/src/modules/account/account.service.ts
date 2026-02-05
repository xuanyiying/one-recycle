import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { Account, Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  private readonly CARBON_SAVING_RATE: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.CARBON_SAVING_RATE = this.configService.get<number>(
      'CARBON_SAVING_RATE',
      0.02,
    );
  }

  /**
   * 创建新账户
   * 支持传入事务客户端以确保原子性
   */
  async createAccount(
    userId: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<Account> {
    const client = tx || this.prisma;

    try {
      const account = await client.account.create({
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

      this.logger.log(`Account created successfully for user ${userId}`);
      return account;
    } catch (error: any) {
      this.logger.error(
        `Failed to create account for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAccountByUserId(
    userId: string | number | bigint,
  ): Promise<Account> {
    const id = BigInt(userId);

    let account = await this.prisma.account.findFirst({
      where: { userId: id },
    });

    // 兜底策略：如果账户不存在则自动创建
    if (!account) {
      this.logger.warn(
        `Account not found for user ${userId}, auto-creating...`,
      );
      account = await this.createAccount(id);
    }

    return account;
  }

  async getAccountStats(userId: string | number | bigint) {
    const id = BigInt(userId);
    const account = await this.findAccountByUserId(id);

    const totalOrders = await this.prisma.order.count({
      where: { userId: id },
    });

    return {
      totalOrders,
      totalIncome: account.totalIncome,
      // 估算减碳量：假设每1元回收收益对应0.02kg碳减排
      savedCarbon: account.totalIncome * this.CARBON_SAVING_RATE,
    };
  }

  async getTransactions(
    userId: string | number | bigint,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;
    const id = BigInt(userId);

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { account: { userId: id } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({
        where: { account: { userId: id } },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deposit(
    userId: bigint,
    amount: number,
    orderId: string,
    description: string = 'Order Settlement',
  ): Promise<Account> {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { userId },
      });

      if (!account) {
        throw new Error(`Account not found for user ${userId}`);
      }

      const balanceBefore = account.availableBalance;
      const balanceAfter = balanceBefore + amount;

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: {
          availableBalance: { increment: amount },
          totalIncome: { increment: amount },
          version: { increment: 1 },
        },
      });

      await tx.transaction.create({
        data: {
          accountId: account.id,
          type: TransactionType.ORDER_INCOME,
          amount: new Prisma.Decimal(amount),
          balanceBefore: new Prisma.Decimal(balanceBefore),
          balanceAfter: new Prisma.Decimal(balanceAfter),
          orderId: orderId,
          description: description,
        },
      });

      return updatedAccount;
    });
  }
}
