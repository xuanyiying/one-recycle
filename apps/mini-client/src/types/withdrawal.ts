/**
 * Withdrawal Types
 */

export enum WithdrawalProvider {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

export interface WeChatAccountInfo {
  openid: string;
  realName: string;
}

export interface AlipayAccountInfo {
  account: string;
  name: string;
}

export type WithdrawalAccountInfo = WeChatAccountInfo | AlipayAccountInfo;

export interface Withdrawal {
  id: string;
  accountId: string;
  userId: string;
  amount: number;
  provider: WithdrawalProvider;
  status: WithdrawalStatus;
  outTradeNo: string;
  transactionId?: string;
  accountInfo: WithdrawalAccountInfo;
  adminId?: string;
  rejectedReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  provider: WithdrawalProvider;
  accountInfo: WithdrawalAccountInfo;
}

export interface WithdrawalFilters {
  status?: WithdrawalStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface WithdrawalListResponse {
  withdrawals: Withdrawal[];
  total: number;
}

export const WithdrawalStatusText: Record<WithdrawalStatus, string> = {
  [WithdrawalStatus.PENDING]: '待处理',
  [WithdrawalStatus.PROCESSING]: '处理中',
  [WithdrawalStatus.SUCCESS]: '已成功',
  [WithdrawalStatus.FAILED]: '已失败',
  [WithdrawalStatus.REJECTED]: '已拒绝',
};

export const WithdrawalProviderText: Record<WithdrawalProvider, string> = {
  [WithdrawalProvider.WECHAT]: '微信',
  [WithdrawalProvider.ALIPAY]: '支付宝',
};
