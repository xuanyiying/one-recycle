export interface IPaymentService {
  increaseBalance(request: IncreaseBalanceRequest): Promise<IncreaseBalanceResponse>;
  refundBalance(request: RefundBalanceRequest): Promise<RefundBalanceResponse>;
  initiateRefund(request: InitiateRefundRequest): Promise<InitiateRefundResponse>;
  createPaymentLog(param: CreatePaymentLogParam): Promise<void>;
  isTransactionProcessed(transactionId: string): Promise<boolean>;
}

export interface IncreaseBalanceRequest {
  userId: string;
  amount: number;
  orderId: string;
  description?: string;
}

export interface IncreaseBalanceResponse {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId: string;
  description: string;
  createdAt: string;
}

export interface RefundBalanceRequest {
  userId: string;
  amount: number;
  orderId: string;
  description?: string;
}

export interface RefundBalanceResponse {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId: string;
  description: string;
  createdAt: string;
}

export interface InitiateRefundRequest {
  orderId: string;
  transactionId: string;
  amount: number;
  reason: string;
  requestedBy: string;
}

export interface InitiateRefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface CreatePaymentLogParam {
  orderId: string;
  transactionId: string;
  status: string;
  amount: number;
  provider: string;
}
