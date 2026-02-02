import { apiClient } from './apiClient';


export interface PlatformWallet {
  id: number;
  balance: number;
  frozenAmount: number;
  totalRecharge: number;
  totalPayout: number;
  version: number;
}

export interface PlatformTransaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedOrderNo?: string;
  description?: string;
  createdAt: string;
}

export interface RechargePlan {
  id: string;
  name: string;
  amount: number;
  bonus: number;
  description: string;
  tag?: string;
}

export interface RechargeRecord {
  id: string;
  orderNo: string;
  amount: number;
  bonus?: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  paymentMethod: 'ALIPAY' | 'WECHAT';
  createdAt: string;
  paidAt?: string;
}

export const financeService = {
  getWallet: async (): Promise<PlatformWallet> => {
    return apiClient.get('/finance/wallet');
  },

  createRechargeOrder: async (amount: number, paymentMethod: 'ALIPAY' | 'WECHAT'): Promise<{ payUrl: string, orderNo: string }> => {
    return apiClient.post('/finance/recharge', { amount, paymentMethod });
  },

  getRechargePlans: async (): Promise<RechargePlan[]> => {
    return apiClient.get('/finance/recharge/plans');
  },

  getTransactions: async (params?: Record<string, unknown>): Promise<{ data: PlatformTransaction[], total: number }> => {
    return apiClient.get('/finance/transactions', params);
  }
};
