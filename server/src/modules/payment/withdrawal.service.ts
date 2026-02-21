import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  AccountType,
  PaymentProvider,
  Prisma,
  TenantTransactionType,
  TransactionType,
  WithdrawalStatus,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentService } from './payment.service';
import { toDecimal } from '@/common/utils/decimal.util';
import {
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  RedisService,
} from '@/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
class WithdrawalService implements OnModuleInit {
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.idGenerator = new PersistentSnowflakeIdGenerator({
      workerId: this.configService.get<number>('PAYMENT_WORKER_ID', 9),
      datacenterId: this.configService.get<number>('DATACENTER_ID', 1),
      stateStore: new RedisSnowflakeStateStore(this.redisService),
      stateKey: 'snowflake:state:withdrawal',
      metricsKey: 'snowflake:withdrawal',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.idGenerator.initialize();
  }

  private async ensurePlatformWallet(tx: Prisma.TransactionClient) {
    const existing = await tx.platformWallet.findFirst();
    if (existing) return existing;
    return tx.platformWallet.create({
      data: {
        balance: 0,
        frozenAmount: 0,
        totalRecharge: 0,
        totalPayout: 0,
      },
    });
  }

  async requestWithdrawal(params: {
    userId: bigint;
    tenantId?: bigint;
    amount: number;
    provider: PaymentProvider;
    accountInfo: any;
    idempotencyKey?: string;
  }) {
    const amount = toDecimal(params.amount);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const account = await tx.account.findUnique({
            where: {
              userId_accountType: {
                userId: params.userId,
                accountType: AccountType.WALLET,
              },
            },
          });
          if (!account) throw new Error('ACCOUNT_NOT_FOUND');

          const available = toDecimal(account.availableBalance);
          if (available.lessThan(amount))
            throw new Error('INSUFFICIENT_BALANCE');

          if (params.idempotencyKey) {
            const existing = await tx.withdrawal.findFirst({
              where: { idempotencyKey: params.idempotencyKey },
            });
            if (existing) return existing;
          }

          const id = this.idGenerator.nextId();
          const outTradeNo = `WD${id}`;

          let withdrawal: any;
          try {
            withdrawal = await tx.withdrawal.create({
              data: {
                accountId: account.id,
                userId: params.userId,
                amount,
                provider: params.provider,
                outTradeNo,
                idempotencyKey: params.idempotencyKey,
                status: WithdrawalStatus.PENDING,
                accountInfo: {
                  ...(params.accountInfo || {}),
                  tenantId: params.tenantId
                    ? params.tenantId.toString()
                    : undefined,
                },
              },
            });
          } catch (error: any) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === 'P2002' &&
              params.idempotencyKey
            ) {
              return tx.withdrawal.findFirstOrThrow({
                where: { idempotencyKey: params.idempotencyKey },
              });
            }
            throw error;
          }

          const balanceBefore = toDecimal(account.availableBalance);
          const balanceAfter = balanceBefore.minus(amount);

          await tx.transaction.create({
            data: {
              accountId: account.id,
              type: TransactionType.WITHDRAWAL_FREEZE,
              amount,
              balanceBefore,
              balanceAfter,
              withdrawalId: withdrawal.id,
              description: `Withdrawal freeze #${withdrawal.outTradeNo}`,
            },
          });

          const updatedAccount = await tx.account.updateMany({
            where: { id: account.id, version: account.version },
            data: {
              availableBalance: { decrement: amount },
              frozenBalance: { increment: amount },
              version: { increment: 1 },
            },
          });
          if (updatedAccount.count !== 1)
            throw new Error('ACCOUNT_VERSION_CONFLICT');

          const platformWallet = await this.ensurePlatformWallet(tx);
          if (toDecimal(platformWallet.balance).lessThan(amount)) {
            throw new Error('PLATFORM_INSUFFICIENT_BALANCE');
          }
          const updatedPlatform = await tx.platformWallet.updateMany({
            where: { id: platformWallet.id, version: platformWallet.version },
            data: {
              balance: { decrement: amount },
              frozenAmount: { increment: amount },
              version: { increment: 1 },
            },
          });
          if (updatedPlatform.count !== 1)
            throw new Error('PLATFORM_VERSION_CONFLICT');

          await tx.platformTransaction.create({
            data: {
              walletId: platformWallet.id,
              type: 'WITHDRAWAL_FREEZE',
              amount: amount.negated(),
              balanceBefore: platformWallet.balance,
              balanceAfter: toDecimal(platformWallet.balance).minus(amount),
              relatedOrderNo: withdrawal.outTradeNo,
              description: `Freeze payout for withdrawal #${withdrawal.outTradeNo}`,
            },
          });

          if (params.tenantId) {
            for (let i = 0; i < 3; i += 1) {
              const tenant = await tx.tenant.findUnique({
                where: { id: params.tenantId },
              });
              if (!tenant) throw new Error('TENANT_NOT_FOUND');
              const tenantAvailable = toDecimal(tenant.balance).minus(
                toDecimal(tenant.frozenBalance),
              );
              if (tenantAvailable.lessThan(amount)) {
                throw new Error('TENANT_INSUFFICIENT_BALANCE');
              }
              const updated = await tx.tenant.updateMany({
                where: { id: tenant.id, version: tenant.version },
                data: {
                  frozenBalance: { increment: amount },
                  version: { increment: 1 },
                },
              });
              if (updated.count !== 1) continue;
              await tx.tenantTransaction.create({
                data: {
                  tenantId: tenant.id,
                  type: TenantTransactionType.WITHDRAWAL,
                  amount: toDecimal(0),
                  balanceAfter: tenant.balance,
                  relatedType: 'WITHDRAWAL',
                  relatedId: `FREEZE:${withdrawal.outTradeNo}`,
                  remark: 'Frozen payout for withdrawal request',
                },
              });
              break;
            }
          }

          return withdrawal;
        });
      } catch (error: any) {
        if (
          String(error?.message) === 'ACCOUNT_VERSION_CONFLICT' ||
          String(error?.message) === 'PLATFORM_VERSION_CONFLICT'
        ) {
          continue;
        }
        throw error;
      }
    }

    throw new Error('WITHDRAWAL_REQUEST_CONFLICT');
  }

  async processWithdrawal(withdrawalId: bigint) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });
    if (!withdrawal) throw new Error('WITHDRAWAL_NOT_FOUND');
    if (withdrawal.status !== WithdrawalStatus.PENDING) return withdrawal;

    await this.prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: WithdrawalStatus.PROCESSING },
    });

    try {
      const transferResult = await this.paymentService.transferToUser(
        withdrawal.userId,
        withdrawal.amount.toNumber(),
        withdrawal.provider,
        withdrawal.accountInfo as any,
        `Withdrawal payout #${withdrawal.outTradeNo}`,
        BigInt(0),
        withdrawal.outTradeNo,
      );

      return await this.prisma.$transaction(async (tx) => {
        const account = await tx.account.findUniqueOrThrow({
          where: {
            userId_accountType: {
              userId: withdrawal.userId,
              accountType: AccountType.WALLET,
            },
          },
        });

        const amount = withdrawal.amount;

        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.WITHDRAWAL_SUCCESS,
            amount,
            balanceBefore: account.availableBalance,
            balanceAfter: account.availableBalance,
            withdrawalId: withdrawal.id,
            description: `Withdrawal success #${withdrawal.outTradeNo}`,
          },
        });

        await tx.account.updateMany({
          where: { id: account.id, version: account.version },
          data: {
            frozenBalance: { decrement: amount },
            totalWithdrawal: { increment: amount },
            version: { increment: 1 },
          },
        });

        const platformWallet = await this.ensurePlatformWallet(tx);
        await tx.platformWallet.updateMany({
          where: { id: platformWallet.id, version: platformWallet.version },
          data: {
            frozenAmount: { decrement: amount },
            totalPayout: { increment: amount },
            version: { increment: 1 },
          },
        });

        await tx.platformTransaction.create({
          data: {
            walletId: platformWallet.id,
            type: 'WITHDRAWAL_SUCCESS',
            amount: amount.negated(),
            balanceBefore: platformWallet.balance,
            balanceAfter: platformWallet.balance,
            relatedOrderNo: withdrawal.outTradeNo,
            description: `Payout success for withdrawal #${withdrawal.outTradeNo}`,
          },
        });

        const tenantIdRaw = (withdrawal.accountInfo as any)?.tenantId;
        if (tenantIdRaw) {
          const tenantId = BigInt(tenantIdRaw);
          for (let i = 0; i < 3; i += 1) {
            const tenant = await tx.tenant.findUnique({
              where: { id: tenantId },
            });
            if (!tenant) break;
            const updated = await tx.tenant.updateMany({
              where: { id: tenant.id, version: tenant.version },
              data: {
                frozenBalance: { decrement: amount },
                balance: { decrement: amount },
                version: { increment: 1 },
              },
            });
            if (updated.count !== 1) continue;
            await tx.tenantTransaction.create({
              data: {
                tenantId: tenant.id,
                type: TenantTransactionType.WITHDRAWAL,
                amount: amount.negated(),
                balanceAfter: toDecimal(tenant.balance).minus(amount),
                relatedType: 'WITHDRAWAL',
                relatedId: `SUCCESS:${withdrawal.outTradeNo}`,
                remark: `Withdrawal payout #${withdrawal.outTradeNo}`,
              },
            });
            break;
          }
        }

        return tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: WithdrawalStatus.SUCCESS,
            processedAt: new Date(),
            callbackData: transferResult as any,
          },
        });
      });
    } catch (error: any) {
      return this.prisma.$transaction(async (tx) => {
        const account = await tx.account.findUniqueOrThrow({
          where: {
            userId_accountType: {
              userId: withdrawal.userId,
              accountType: AccountType.WALLET,
            },
          },
        });

        const amount = withdrawal.amount;

        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.WITHDRAWAL_FAILED,
            amount,
            balanceBefore: account.availableBalance,
            balanceAfter: toDecimal(account.availableBalance).plus(amount),
            withdrawalId: withdrawal.id,
            description: `Withdrawal failed #${withdrawal.outTradeNo}`,
          },
        });

        await tx.account.updateMany({
          where: { id: account.id, version: account.version },
          data: {
            availableBalance: { increment: amount },
            frozenBalance: { decrement: amount },
            version: { increment: 1 },
          },
        });

        const platformWallet = await this.ensurePlatformWallet(tx);
        await tx.platformWallet.updateMany({
          where: { id: platformWallet.id, version: platformWallet.version },
          data: {
            balance: { increment: amount },
            frozenAmount: { decrement: amount },
            version: { increment: 1 },
          },
        });

        await tx.platformTransaction.create({
          data: {
            walletId: platformWallet.id,
            type: 'WITHDRAWAL_RELEASE',
            amount,
            balanceBefore: platformWallet.balance,
            balanceAfter: toDecimal(platformWallet.balance).plus(amount),
            relatedOrderNo: withdrawal.outTradeNo,
            description: `Release payout for withdrawal #${withdrawal.outTradeNo}`,
          },
        });

        const tenantIdRaw = (withdrawal.accountInfo as any)?.tenantId;
        if (tenantIdRaw) {
          const tenantId = BigInt(tenantIdRaw);
          for (let i = 0; i < 3; i += 1) {
            const tenant = await tx.tenant.findUnique({
              where: { id: tenantId },
            });
            if (!tenant) break;
            const updated = await tx.tenant.updateMany({
              where: { id: tenant.id, version: tenant.version },
              data: {
                balance: { decrement: amount },
                frozenBalance: { decrement: amount },
                version: { increment: 1 },
              },
            });
            if (updated.count !== 1) continue;
            await tx.tenantTransaction.create({
              data: {
                tenantId: tenant.id,
                type: TenantTransactionType.WITHDRAWAL,
                amount: toDecimal(0),
                balanceAfter: tenant.balance,
                relatedType: 'WITHDRAWAL',
                relatedId: `RELEASE:${withdrawal.outTradeNo}`,
                remark: `Withdrawal release #${withdrawal.outTradeNo}`,
              },
            });
            break;
          }
        }

        return tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: WithdrawalStatus.FAILED,
            processedAt: new Date(),
            rejectedReason: error?.message
              ? String(error.message)
              : 'UNKNOWN_ERROR',
            callbackData: {
              error: error?.message ? String(error.message) : 'UNKNOWN_ERROR',
            },
          },
        });
      });
    }
  }

  async handleWithdrawalNotify(params: {
    outTradeNo: string;
    status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
    providerTxnNo?: string;
    raw?: any;
  }) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { outTradeNo: params.outTradeNo },
    });
    if (!withdrawal) throw new Error('WITHDRAWAL_NOT_FOUND');

    if (params.status === 'SUCCESS') {
      if (withdrawal.status === WithdrawalStatus.SUCCESS) return withdrawal;
      return this.prisma.$transaction(async (tx) => {
        const account = await tx.account.findUniqueOrThrow({
          where: {
            userId_accountType: {
              userId: withdrawal.userId,
              accountType: AccountType.WALLET,
            },
          },
        });

        const amount = withdrawal.amount;

        await tx.transaction.create({
          data: {
            accountId: account.id,
            type: TransactionType.WITHDRAWAL_SUCCESS,
            amount,
            balanceBefore: account.availableBalance,
            balanceAfter: account.availableBalance,
            withdrawalId: withdrawal.id,
            description: `Withdrawal success #${withdrawal.outTradeNo}`,
          },
        });

        await tx.account.updateMany({
          where: { id: account.id, version: account.version },
          data: {
            frozenBalance: { decrement: amount },
            totalWithdrawal: { increment: amount },
            version: { increment: 1 },
          },
        });

        const platformWallet = await this.ensurePlatformWallet(tx);
        await tx.platformWallet.updateMany({
          where: { id: platformWallet.id, version: platformWallet.version },
          data: {
            frozenAmount: { decrement: amount },
            totalPayout: { increment: amount },
            version: { increment: 1 },
          },
        });

        const tenantIdRaw = (withdrawal.accountInfo as any)?.tenantId;
        if (tenantIdRaw) {
          const tenantId = BigInt(tenantIdRaw);
          for (let i = 0; i < 3; i += 1) {
            const tenant = await tx.tenant.findUnique({
              where: { id: tenantId },
            });
            if (!tenant) break;
            const updated = await tx.tenant.updateMany({
              where: { id: tenant.id, version: tenant.version },
              data: {
                frozenBalance: { decrement: amount },
                balance: { decrement: amount },
                version: { increment: 1 },
              },
            });
            if (updated.count !== 1) continue;
            await tx.tenantTransaction.create({
              data: {
                tenantId: tenant.id,
                type: TenantTransactionType.WITHDRAWAL,
                amount: amount.negated(),
                balanceAfter: toDecimal(tenant.balance).minus(amount),
                relatedType: 'WITHDRAWAL',
                relatedId: `SUCCESS:${withdrawal.outTradeNo}`,
                remark: `Withdrawal payout #${withdrawal.outTradeNo}`,
              },
            });
            break;
          }
        }

        return tx.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: WithdrawalStatus.SUCCESS,
            processedAt: new Date(),
            callbackData: {
              ...((withdrawal.callbackData as any) || {}),
              providerTxnNo: params.providerTxnNo,
              raw: params.raw,
            },
          },
        });
      });
    }

    if (
      withdrawal.status === WithdrawalStatus.FAILED ||
      withdrawal.status === WithdrawalStatus.REJECTED
    ) {
      return withdrawal;
    }

    const targetStatus =
      params.status === 'TIMEOUT'
        ? WithdrawalStatus.TIMEOUT
        : WithdrawalStatus.FAILED;

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.findUniqueOrThrow({
        where: {
          userId_accountType: {
            userId: withdrawal.userId,
            accountType: AccountType.WALLET,
          },
        },
      });

      const amount = withdrawal.amount;

      await tx.transaction.create({
        data: {
          accountId: account.id,
          type: TransactionType.WITHDRAWAL_FAILED,
          amount,
          balanceBefore: account.availableBalance,
          balanceAfter: toDecimal(account.availableBalance).plus(amount),
          withdrawalId: withdrawal.id,
          description: `Withdrawal failed #${withdrawal.outTradeNo}`,
        },
      });

      await tx.account.updateMany({
        where: { id: account.id, version: account.version },
        data: {
          availableBalance: { increment: amount },
          frozenBalance: { decrement: amount },
          version: { increment: 1 },
        },
      });

      const platformWallet = await this.ensurePlatformWallet(tx);
      await tx.platformWallet.updateMany({
        where: { id: platformWallet.id, version: platformWallet.version },
        data: {
          balance: { increment: amount },
          frozenAmount: { decrement: amount },
          version: { increment: 1 },
        },
      });

      const tenantIdRaw = (withdrawal.accountInfo as any)?.tenantId;
      if (tenantIdRaw) {
        const tenantId = BigInt(tenantIdRaw);
        for (let i = 0; i < 3; i += 1) {
          const tenant = await tx.tenant.findUnique({
            where: { id: tenantId },
          });
          if (!tenant) break;
          const updated = await tx.tenant.updateMany({
            where: { id: tenant.id, version: tenant.version },
            data: {
              balance: { decrement: amount },
              frozenBalance: { decrement: amount },
              version: { increment: 1 },
            },
          });
          if (updated.count !== 1) continue;
          await tx.tenantTransaction.create({
            data: {
              tenantId: tenant.id,
              type: TenantTransactionType.WITHDRAWAL,
              amount: toDecimal(0),
              balanceAfter: tenant.balance,
              relatedType: 'WITHDRAWAL',
              relatedId: `RELEASE:${withdrawal.outTradeNo}`,
              remark: `Withdrawal release #${withdrawal.outTradeNo}`,
            },
          });
          break;
        }
      }

      return tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: targetStatus,
          processedAt: new Date(),
          rejectedReason: params.status,
          callbackData: {
            ...((withdrawal.callbackData as any) || {}),
            providerTxnNo: params.providerTxnNo,
            raw: params.raw,
          },
        },
      });
    });
  }
}

export default WithdrawalService;
