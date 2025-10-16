import { PaymentProvider } from '../../prisma/generated/client';

/**
 * 支付结果
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  errorCode?: string;
}

/**
 * 转账状态
 */
export enum TransferStatus {
  SUCCESS = 'SUCCESS',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  REFUND = 'REFUND',
}

/**
 * 转账查询结果
 */
export interface TransferQueryResult {
  status: TransferStatus;
  transactionId?: string;
  amount?: number;
  message?: string;
}

/**
 * 提现账户信息
 */
export interface WithdrawalAccountInfo {
  // 微信
  openid?: string;
  realName?: string;

  // 支付宝
  alipayAccount?: string;
  alipayName?: string;
}

/**
 * 支付提供商接口
 */
export interface IPaymentProvider {
  /**
   * 获取提供商类型
   */
  getProviderType(): PaymentProvider;

  /**
   * 发起转账
   * @param amount 转账金额（元）
   * @param accountInfo 账户信息
   * @param outTradeNo 商户订单号
   * @param description 转账描述
   */
  transfer(
    amount: number,
    accountInfo: WithdrawalAccountInfo,
    outTradeNo: string,
    description: string,
  ): Promise<PaymentResult>;

  /**
   * 查询转账状态
   * @param outTradeNo 商户订单号
   */
  queryTransfer(outTradeNo: string): Promise<TransferQueryResult>;

  /**
   * 验证回调签名
   * @param callbackData 回调数据
   */
  verifyCallback(callbackData: any): boolean;
}
