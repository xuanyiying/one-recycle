import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { join } from 'path';
import {
  CreatePaymentLogParam,
  IPaymentService,
  IncreaseBalanceRequest,
  IncreaseBalanceResponse,
  InitiateRefundRequest,
  InitiateRefundResponse,
  RefundBalanceRequest,
  RefundBalanceResponse,
} from '../interfaces/payment-service.interface';

@Injectable()
export class PaymentServiceGrpcClient implements IPaymentService {
  private readonly logger = new Logger(PaymentServiceGrpcClient.name);
  private readonly client: any;
  private paymentService: any;

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('PAYMENT_SERVICE_GRPC_URL') ||
      '127.0.0.1:50051';

    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'payment',
        protoPath: join(__dirname, '../../../proto/payment.proto'),
        url,
      },
    });

    this.paymentService = this.client.getService('PaymentService');
    this.logger.log(
      `gRPC client connected to payment service at ${url}`,
    );
  }

  async increaseBalance(
    request: IncreaseBalanceRequest,
  ): Promise<IncreaseBalanceResponse> {
    this.logger.log(
      `[gRPC] Increasing balance for user ${request.userId}, amount: ${request.amount}`,
    );

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.paymentService.createPayment(
          {
            orderId: request.orderId,
            amount: request.amount,
            provider: 'SETTLEMENT',
          },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      this.logger.log(
        `[gRPC] Payment created: ${response.paymentId}, tx: ${response.transactionId}`,
      );

      return {
        id: response.transactionId || response.paymentId || '',
        accountId: request.userId,
        type: 'ORDER_INCOME',
        amount: request.amount,
        balanceBefore: Number(response.balanceBefore) || 0,
        balanceAfter: Number(response.balanceAfter) || request.amount,
        orderId: request.orderId,
        description:
          request.description || `订单收入 - ${request.orderId}`,
        createdAt: response.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('[gRPC] Failed to increase balance:', error);
      throw error;
    }
  }

  async refundBalance(
    request: RefundBalanceRequest,
  ): Promise<RefundBalanceResponse> {
    this.logger.log(
      `[gRPC] Refunding balance for user ${request.userId}, amount: ${request.amount}`,
    );

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.paymentService.createRefund(
          {
            refundAmount: request.amount,
            reason:
              request.description ||
              `订单取消退款 - ${request.orderId}`,
          },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      this.logger.log(
        `[gRPC] Refund created: ${response.refundId}, no: ${response.outRefundNo}`,
      );

      return {
        id: response.refundId || '',
        accountId: String(request.userId),
        type: 'ORDER_REFUND',
        amount: request.amount,
        balanceBefore: Number(response.balanceBefore) || request.amount,
        balanceAfter: Number(response.balanceAfter) || 0,
        orderId: request.orderId,
        description:
          request.description || `订单取消退款 - ${request.orderId}`,
        createdAt: response.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('[gRPC] Failed to refund balance:', error);
      throw error;
    }
  }

  async initiateRefund(
    request: InitiateRefundRequest,
  ): Promise<InitiateRefundResponse> {
    this.logger.log(
      `[gRPC] Initiating refund for order ${request.orderId}, transaction ${request.transactionId}`,
    );

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.paymentService.initiateRefund(
          {
            orderId: request.orderId,
            transactionId: request.transactionId,
            amount: request.amount,
            reason: request.reason,
            requestedBy: request.requestedBy,
          },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      return {
        success: response.success ?? true,
        refundId: response.refundId || `refund-${request.transactionId}`,
        amount: Number(response.amount) || request.amount,
        status: response.status || 'SUCCESS',
      };
    } catch (error) {
      this.logger.error('[gRPC] Failed to initiate refund:', error);
      throw error;
    }
  }

  async createPaymentLog(param: CreatePaymentLogParam): Promise<void> {
    this.logger.log(
      `[gRPC] Creating payment log for transaction ${param.transactionId}`,
    );

    try {
      await new Promise<any>((resolve, reject) => {
        this.paymentService.createPaymentLog(
          {
            orderId: param.orderId,
            transactionId: param.transactionId,
            status: param.status,
            amount: param.amount,
            provider: param.provider,
          },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });
    } catch (error) {
      this.logger.error('[gRPC] Failed to create payment log:', error);
      throw error;
    }
  }

  async isTransactionProcessed(transactionId: string): Promise<boolean> {
    this.logger.debug(
      `[gRPC] Checking if transaction ${transactionId} is processed`,
    );

    try {
      const response = await new Promise<any>((resolve, reject) => {
        this.paymentService.isTransactionProcessed(
          { transactionId },
          (err: Error | null, res: any) => {
            if (err) reject(err);
            else resolve(res);
          },
        );
      });

      return response.isProcessed ?? false;
    } catch (error) {
      this.logger.error('[gRPC] Failed to check transaction status:', error);
      return false;
    }
  }
}
