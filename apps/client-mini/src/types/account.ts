/**
 * Account Types
 */

export interface Account {
  id: string;
  userId: string;
  availableBalance: number;
  frozenBalance: number;
  totalIncome: number;
  totalWithdrawal: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  ORDER_INCOME = 'ORDER_INCOME',
  WITHDRAWAL_FREEZE = 'WITHDRAWAL_FREEZE',
  WITHDRAWAL_SUCCESS = 'WITHDRAWAL_SUCCESS',
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
  WITHDRAWAL_UNFREEZE = 'WITHDRAWAL_UNFREEZE',
  REFUND = 'REFUND',
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: string;
  withdrawalId?: string;
  description: string;
  createdAt: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AccountStats {
  totalIncome: number;
  totalWithdrawal: number;
  totalOrders: number;
  successfulWithdrawals: number;
  availableBalance: number;
  frozenBalance: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
}
