import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { Account, AccountType, Prisma, TransactionType } from '@prisma/client';
import { toDecimal, toNumber } from '@/common/utils/decimal.util';

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
          accountType: AccountType.WALLET,
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

    const account = await this.prisma.account.upsert({
      where: {
        userId_accountType: { userId: id, accountType: AccountType.WALLET },
      },
      update: {},
      create: {
        userId: id,
        accountType: AccountType.WALLET,
        accountDetails: {},
        availableBalance: 0,
        frozenBalance: 0,
        totalIncome: 0,
        totalWithdrawal: 0,
      },
    });

    return account;
  }

  async getAccountStats(userId: string | number | bigint) {
    const id = BigInt(userId);
    const account = await this.findAccountByUserId(id);

    const totalOrders = await this.prisma.order.count({
      where: { userId: id },
    });

    const totalIncome = toNumber(account.totalIncome);

    return {
      totalOrders,
      totalIncome,
      savedCarbon: totalIncome * this.CARBON_SAVING_RATE,
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
    tx?: Prisma.TransactionClient,
  ): Promise<Account> {
    const amountDecimal = toDecimal(amount);

    const run = async (client: Prisma.TransactionClient, isExternalTx: boolean) => {
      const maxAttempts = isExternalTx ? 1 : 3;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const account = await client.account.findUnique({
          where: {
            userId_accountType: {
              userId,
              accountType: AccountType.WALLET,
            },
          },
        });

        if (!account) {
          throw new Error(`Account not found for user ${userId}`);
        }

        const balanceBefore = toDecimal(account.availableBalance);
        const balanceAfter = balanceBefore.plus(amountDecimal);

        try {
          await client.transaction.create({
            data: {
              accountId: account.id,
              type: TransactionType.ORDER_INCOME,
              amount: amountDecimal,
              balanceBefore,
              balanceAfter,
              orderId,
              description,
            },
          });
        } catch (error: any) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            return account;
          }
          throw error;
        }

        const updatedCount = await client.account.updateMany({
          where: { id: account.id, version: account.version },
          data: {
            availableBalance: { increment: amountDecimal },
            totalIncome: { increment: amountDecimal },
            version: { increment: 1 },
          },
        });

        if (updatedCount.count !== 1) {
          // Within an external transaction, retrying is useless (same snapshot)
          if (isExternalTx) {
            throw new Error('ACCOUNT_VERSION_CONFLICT');
          }
          continue;
        }

        return client.account.findUniqueOrThrow({
          where: { id: account.id },
        });
      }

      throw new Error('ACCOUNT_VERSION_CONFLICT');
    };

    if (tx) {
      // External transaction: no retry loop, let outer transaction handle conflicts
      return run(tx, true);
    }

    return this.prisma.$transaction(async (prismaTx) => run(prismaTx, false));
  }
}
