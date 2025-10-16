import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

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
  userId: number;
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

export interface RefundRequest {
  orderId: string;
  transactionId: string;
  amount: number;
  reason: string;
  requestedBy: string;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

@Injectable()
export class PaymentServiceClient {
  private readonly logger = new Logger(PaymentServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL: string;

  constructor(private readonly configService: ConfigService) {
    this.baseURL = this.configService.get<string>('PAYMENT_SERVICE_URL') || 'http://localhost:3007';
    
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Payment request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        this.logger.error(`Payment error: ${error.message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 增加用户余额（订单完成后积分入账）
   */
  async increaseBalance(request: IncreaseBalanceRequest): Promise<IncreaseBalanceResponse> {
    try {
      this.logger.log(`Increasing balance for user ${request.userId}, order ${request.orderId}, amount: ${request.amount}`);
      
      const response = await this.httpClient.post<IncreaseBalanceResponse>(
        '/accounts/increase',
        request,
      );

      this.logger.log(`Balance increased successfully for user ${request.userId}, new balance: ${response.data.balanceAfter}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to increase balance for user ${request.userId}, order ${request.orderId}:`, error);
      throw error;
    }
  }

  /**
   * 发起退款
   */
  async initiateRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      this.logger.log(`Initiating refund for order ${request.orderId}`);
      
      const response = await this.httpClient.post<RefundResponse>(
        '/payments/refund',
        request,
      );

      this.logger.log(`Refund initiated: ${response.data.refundId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to initiate refund for order ${request.orderId}:`, error);
      throw error;
    }
  }

  /**
   * 查询退款状态
   */
  async queryRefundStatus(refundId: string): Promise<RefundResponse> {
    try {
      const response = await this.httpClient.get<RefundResponse>(
        `/payments/refund/${refundId}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to query refund status ${refundId}:`, error);
      throw error;
    }
  }

  /**
   * 获取订单支付信息
   */
  async getOrderPayment(orderId: string): Promise<any> {
    try {
      const response = await this.httpClient.get(`/payments/order/${orderId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get payment info for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * 退款余额（订单取消后扣除积分）
   */
  async refundBalance(request: RefundBalanceRequest): Promise<RefundBalanceResponse> {
    try {
      this.logger.log(
        `Refunding balance for user ${request.userId}, order ${request.orderId}, amount: ${request.amount}`,
      );

      const response = await this.httpClient.post<RefundBalanceResponse>(
        '/accounts/refund',
        request,
      );

      this.logger.log(
        `Balance refunded successfully for user ${request.userId}, new balance: ${response.data.balanceAfter}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to refund balance for user ${request.userId}, order ${request.orderId}:`,
        error,
      );
      throw error;
    }
  }
}
