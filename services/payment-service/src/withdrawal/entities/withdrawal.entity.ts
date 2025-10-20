import { Withdrawal as PrismaWithdrawal, WithdrawalStatus, PaymentProvider } from '@prisma/client';

export class WithdrawalEntity implements PrismaWithdrawal {
  id!: bigint;
  accountId!: bigint;
  userId!: bigint;
  amount!: any; // Prisma Decimal
  provider!: PaymentProvider;
  outTradeNo!: string;
  transactionId!: string | null;
  status!: WithdrawalStatus;
  accountInfo!: any; // JSON
  adminId!: bigint | null;
  processedAt!: Date | null;
  rejectedReason!: string | null;
  callbackData!: any; // JSON
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<WithdrawalEntity>) {
    Object.assign(this, partial);
  }

  toJSON() {
    return {
      id: this.id.toString(),
      accountId: this.accountId.toString(),
      userId: this.userId.toString(),
      amount: Number(this.amount),
      provider: this.provider,
      outTradeNo: this.outTradeNo,
      transactionId: this.transactionId,
      status: this.status,
      accountInfo: this.accountInfo,
      adminId: this.adminId?.toString() || null,
      processedAt: this.processedAt,
      rejectedReason: this.rejectedReason,
      callbackData: this.callbackData,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
