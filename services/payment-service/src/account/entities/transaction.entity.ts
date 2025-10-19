import { TransactionType } from '@prisma/client';

export class Transaction {
  id: bigint;
  accountId: bigint;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: string;
  withdrawalId?: bigint;
  description: string;
  createdAt: Date;
}
