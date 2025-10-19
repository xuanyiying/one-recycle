import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { RefundStatus, PaymentProvider, PaymentStatus } from '@prisma/client';
import { 
  CreatePaymentRequest, 
  CreateRefundRequest, 
  GetPaymentRequest, 
  PaymentNotifyRequest, 
  RefundNotifyRequest, 
  RefundResponse, 
  PaymentResponse,
  CreatePaymentLogRequest,
  GetPaymentLogsByOrderIdRequest,
  GetPaymentLogByTransactionIdRequest,
  IsTransactionProcessedRequest,
  GetPaymentStatsRequest,
  PaymentLogResponse,
  PaymentLogsResponse,
  IsTransactionProcessedResponse,
  PaymentStatsResponse
} from '../../proto/payment.pb';

@Controller()
export class PaymentGrpcController {
  constructor(private readonly paymentService: PaymentService) { }

  @GrpcMethod('PaymentService', 'GetPayment')
  async getPayment(data: GetPaymentRequest): Promise<PaymentResponse> {
    try {
      const payment = await this.paymentService.findOne(data.id.toString());
      return this.mapToPaymentResponse(payment);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'CreatePayment')
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const payment = await this.paymentService.create({
        orderId: data.orderId.toString(),
        amount: Number(data.total),
        provider: data.provider
      });
      return this.mapToPaymentResponse(payment);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'HandlePaymentNotify')
  async handlePaymentNotify(data: PaymentNotifyRequest): Promise<PaymentResponse> {
    try {
      await this.paymentService.updatePaymentStatus(data.outTradeNo, data.tradeState as any);
      const payment = await this.paymentService.findByOutTradeNo(data.outTradeNo);
      return this.mapToPaymentResponse(payment);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'CreateRefund')
  async createRefund(data: CreateRefundRequest): Promise<RefundResponse> {
    try {
      const refund = await this.paymentService.createRefund(
        data.paymentId.toString(),
        Number(data.refundAmount),
        data.reason
      );
      return {
        id: refund.id.toString(),
        outRefundNo: refund.outRefundNo,
        refundAmount: refund.refundAmount?.toString() || '0',
        status: refund.status,
        reason: refund.reason || '',
        createdAt: refund.createdAt.toISOString(),
        updatedAt: refund.updatedAt.toISOString()
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'HandleRefundNotify')
  async handleRefundNotify(data: RefundNotifyRequest): Promise<RefundResponse> {
    try {
      const refund = await this.paymentService.updateRefundStatus(
        data.outRefundNo,
        data.refundStatus as RefundStatus
      );
      return {
        id: refund.id.toString(),
        outRefundNo: refund.outRefundNo,
        refundAmount: refund.refundAmount?.toString() || '0',
        status: refund.status,
        reason: refund.reason || '',
        createdAt: refund.createdAt.toISOString(),
        updatedAt: refund.updatedAt.toISOString()
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToPaymentResponse(payment: any): PaymentResponse {
    return {
      id: payment.id,
      outTradeNo: payment.outTradeNo,
      transactionId: payment.transactionId || '',
      total: payment.total?.toString() || '0',
      status: payment.status,
      provider: payment.provider,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    };
  }

  @GrpcMethod('PaymentService', 'CreatePaymentLog')
  async createPaymentLog(data: CreatePaymentLogRequest): Promise<PaymentLogResponse> {
    try {
      const paymentLog = await this.paymentService.createPaymentLog({
        orderId: data.orderId,
        transactionId: data.transactionId,
        status: data.status as PaymentStatus,
        amount: parseFloat(data.amount),
        provider: data.provider as PaymentProvider,
        reason: data.reason
      });
      return this.mapToPaymentLogResponse(paymentLog);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetPaymentLogsByOrderId')
  async getPaymentLogsByOrderId(data: GetPaymentLogsByOrderIdRequest): Promise<PaymentLogsResponse> {
    try {
      const logs = await this.paymentService.getPaymentLogsByOrderId(data.orderId);
      return {
        logs: logs.map(log => this.mapToPaymentLogResponse(log))
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetPaymentLogByTransactionId')
  async getPaymentLogByTransactionId(data: GetPaymentLogByTransactionIdRequest): Promise<PaymentLogResponse> {
    try {
      const log = await this.paymentService.getPaymentLogByTransactionId(data.transactionId);
      return this.mapToPaymentLogResponse(log);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'IsTransactionProcessed')
  async isTransactionProcessed(data: IsTransactionProcessedRequest): Promise<IsTransactionProcessedResponse> {
    try {
      const processed = await this.paymentService.isTransactionProcessed(data.transactionId);
      return { processed };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetPaymentStats')
  async getPaymentStats(data: GetPaymentStatsRequest): Promise<PaymentStatsResponse> {
    try {
      const stats = await this.paymentService.getPaymentStatsInRange(
        new Date(data.startDate),
        new Date(data.endDate)
      );
      return {
        total: stats.total,
        success: stats.success,
        failed: stats.failed,
        closed: stats.closed,
        totalAmount: stats.totalAmount.toString()
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToPaymentLogResponse(paymentLog: any): PaymentLogResponse {
    return {
      id: paymentLog.id,
      orderId: paymentLog.orderId.toString(),
      transactionId: paymentLog.transactionId || '',
      status: paymentLog.status,
      amount: paymentLog.total?.toString() || '0',
      provider: paymentLog.provider,
      reason: paymentLog.notifyRaw || '',
      createdAt: paymentLog.createdAt.toISOString(),
      updatedAt: paymentLog.updatedAt.toISOString()
    };
  }

  private handleGrpcError(error: any): any {
    if (error.code === 'NOT_FOUND') {
      return { code: 5, message: error.message }; // NOT_FOUND
    }
    if (error.code === 'ALREADY_EXISTS') {
      return { code: 6, message: error.message }; // ALREADY_EXISTS
    }
    if (error.code === 'FAILED_PRECONDITION') {
      return { code: 9, message: error.message }; // FAILED_PRECONDITION
    }
    return { code: 13, message: 'Internal server error' }; // INTERNAL
  }
}