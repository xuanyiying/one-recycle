import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { 
  CreatePaymentRequest, 
  CreateRefundRequest, 
  GetPaymentRequest, 
  GetPaymentResponse,
  GetRefundRequest,
  GetRefundResponse,
  CreatePaymentLogRequest,
  GetPaymentLogsByOrderIdRequest,
  GetPaymentLogByTransactionIdRequest,
  IsTransactionProcessedRequest,
  GetPaymentStatsRequest,
  PaymentLogResponse,
  PaymentLogsResponse,
  IsTransactionProcessedResponse,
  PaymentStatsResponse,
  UpdatePaymentStatusRequest,
  UpdatePaymentStatusResponse,
  CreateRefundResponse
} from '../../proto/payment.pb';
import {PaymentProvider, PaymentStatus} from "@prisma/client";

@Controller()
export class PaymentGrpcController {
  constructor(private readonly paymentService: PaymentService) { }

  @GrpcMethod('PaymentService', 'GetPayment')
  async getPayment(data: GetPaymentRequest): Promise<GetPaymentResponse> {
    try {
      const payment = await this.paymentService.findOne(data.paymentId.toString());
      return { payment: this.mapToPayment(payment) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'CreatePayment')
  async createPayment(data: CreatePaymentRequest): Promise<GetPaymentResponse> {
    try {
      const payment = await this.paymentService.create({
        orderId: data.orderId.toString(),
        amount: Number(data.amount),
        provider: data.provider
      });
      return { payment: this.mapToPayment(payment) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'UpdatePaymentStatus')
  async updatePaymentStatus(data: UpdatePaymentStatusRequest): Promise<UpdatePaymentStatusResponse> {
    try {
      await this.paymentService.updatePaymentStatus(data.transactionId, data.status as any);
      const payment = await this.paymentService.findByTransactionId(data.transactionId);
      return { success: true, payment: this.mapToPayment(payment) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'CreateRefund')
  async createRefund(data: CreateRefundRequest): Promise<CreateRefundResponse> {
    try {
      const refund = await this.paymentService.createRefund(
        data.paymentId.toString(),
        Number(data.refundAmount),
        data.reason
      );
      return {
        success: true,
        refundId: refund.id.toString(),
        outRefundNo: refund.outRefundNo,
        message: 'Refund created successfully'
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetRefund')
  async getRefund(data: GetRefundRequest): Promise<GetRefundResponse> {
    try {
      // 这里需要在PaymentService中添加findByRefundId方法
      const refund = await this.paymentService.findByRefundId(data.refundId.toString());
      return { refund: this.mapToRefund(refund) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToPayment(payment: any) {
    return {
      id: payment.id.toString(),
      orderId: payment.orderId.toString(),
      transactionId: payment.transactionId || '',
      outTradeNo: payment.outTradeNo || '',
      total: payment.total,
      status: payment.status,
      provider: payment.provider,
      notifyRaw: payment.notifyRaw || '',
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    };
  }

  private mapToRefund(refund: any) {
    return {
      id: refund.id.toString(),
      paymentId: refund.paymentId.toString(),
      outRefundNo: refund.outRefundNo || '',
      refundAmount: refund.refundAmount,
      status: refund.status,
      reason: refund.reason || '',
      notifyRaw: refund.notifyRaw || '',
      createdAt: refund.createdAt.toISOString(),
      updatedAt: refund.updatedAt.toISOString()
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
        rawData: data.reason
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
        total: stats.totalTransactions,
        success: stats.successfulTransactions,
        failed: stats.failedTransactions,
        closed: stats.pendingTransactions,
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
