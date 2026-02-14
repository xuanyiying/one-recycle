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
  CreateRefundResponse,
} from '@/proto/payment.pb';
import {
  PaymentProvider,
  PaymentStatus,
  Payment,
  PaymentLog,
  Refund,
} from '@prisma/client';
import { toNumber } from '@/common/utils/decimal.util';

@Controller()
export class PaymentGrpcController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod('PaymentService', 'GetPayment')
  async getPayment(data: GetPaymentRequest): Promise<GetPaymentResponse> {
    try {
      const payment = await this.paymentService.findOne(BigInt(data.paymentId)); // 转换为bigint
      return {
        payment: payment ? this.mapToPayment(payment) : undefined,
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'CreatePayment')
  async createPayment(data: CreatePaymentRequest): Promise<GetPaymentResponse> {
    try {
      const payment = await this.paymentService.create({
        orderId: data.orderId.toString(), // 保持为字符串传递
        amount: Number(data.amount),
        provider: data.provider,
      });
      return { payment: this.mapToPayment(payment) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'UpdatePaymentStatus')
  async updatePaymentStatus(
    data: UpdatePaymentStatusRequest,
  ): Promise<UpdatePaymentStatusResponse> {
    try {
      await this.paymentService.updatePaymentStatus(
        data.transactionId, // 保持为bigint
        data.status as any,
      );
      const payment = await this.paymentService.findByTransactionId(
        data.transactionId, // 保持为bigint
      );
      return { success: true, payment: this.mapToPayment(payment) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'CreateRefund')
  async createRefund(data: CreateRefundRequest): Promise<CreateRefundResponse> {
    try {
      const refund = await this.paymentService.createRefund(
        data.paymentId,
        Number(data.refundAmount),
        data.reason,
      );
      return {
        success: true,
        refundId: refund.id,
        outRefundNo: refund.outRefundNo,
        message: 'Refund created successfully',
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetRefund')
  async getRefund(data: GetRefundRequest): Promise<GetRefundResponse> {
    try {
      // 这里需要在PaymentService中添加findByRefundId方法
      const refund = await this.paymentService.findByRefundId(
        data.refundId.toString(),
      ); // 转换为字符串
      return { refund: this.mapToRefund(refund) };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToPayment(payment: Payment) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      transactionId: payment.transactionId || 0n,
      outTradeNo: payment.outTradeNo || '',
      total: toNumber(payment.total),
      status: payment.status,
      provider: payment.provider,
      notifyRaw: payment.notifyRaw || '',
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }

  private mapToRefund(refund: Refund) {
    return {
      id: refund.id,
      paymentId: refund.paymentId,
      outRefundNo: refund.outRefundNo || '',
      refundAmount: toNumber(refund.refundAmount),
      status: refund.status,
      reason: refund.reason || '',
      notifyRaw: refund.notifyRaw || '',
      createdAt: refund.createdAt.toISOString(),
      updatedAt: refund.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('PaymentService', 'CreatePaymentLog')
  async createPaymentLog(
    data: CreatePaymentLogRequest,
  ): Promise<PaymentLogResponse> {
    try {
      const paymentLog = await this.paymentService.createPaymentLog({
        id: 0n,
        orderId: data.orderId,
        transactionId: data.transactionId,
        status: data.status as PaymentStatus,
        amount: parseFloat(data.amount),
        provider: data.provider as PaymentProvider,
        rawData: data.reason,
        createdAt: new Date(),
        processedAt: new Date(),
      });
      return this.mapToPaymentLogResponse(paymentLog);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetPaymentLogsByOrderId')
  async getPaymentLogsByOrderId(
    data: GetPaymentLogsByOrderIdRequest,
  ): Promise<PaymentLogsResponse> {
    try {
      const logs = await this.paymentService.getPaymentLogsByOrderId(
        data.orderId,
      );
      return {
        logs: logs.map((log) => this.mapToPaymentLogResponse(log)),
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetPaymentLogByTransactionId')
  async getPaymentLogByTransactionId(
    data: GetPaymentLogByTransactionIdRequest,
  ): Promise<PaymentLogResponse> {
    try {
      const log = await this.paymentService.getPaymentLogByTransactionId(
        data.transactionId,
      );
      if (!log) {
        throw new Error('Payment log not found');
      }
      return this.mapToPaymentLogResponse(log);
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'IsTransactionProcessed')
  async isTransactionProcessed(
    data: IsTransactionProcessedRequest,
  ): Promise<IsTransactionProcessedResponse> {
    try {
      const processed = await this.paymentService.isTransactionProcessed(
        data.transactionId,
      );
      return { processed: !!processed };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  @GrpcMethod('PaymentService', 'GetPaymentStats')
  async getPaymentStats(
    data: GetPaymentStatsRequest,
  ): Promise<PaymentStatsResponse> {
    try {
      const logs = await this.paymentService.getPaymentStatsInRange(
        new Date(data.startDate),
        new Date(data.endDate),
      );

      // 计算统计信息
      const total = logs.length;
      const success = logs.filter((log) => log.status === 'SUCCESS').length;
      const failed = logs.filter((log) => log.status === 'FAILED').length;
      const pending = logs.filter((log) => log.status === 'PENDING').length;
      const totalAmount = logs.reduce((sum, log) => sum + toNumber(log.amount), 0);

      return {
        total,
        success,
        failed,
        closed: pending,
        totalAmount: totalAmount.toString(), // 转换为字符串
      };
    } catch (error) {
      throw this.handleGrpcError(error);
    }
  }

  private mapToPaymentLogResponse(paymentLog: PaymentLog): PaymentLogResponse {
    return {
      id: paymentLog.id,
      orderId: paymentLog.orderId,
      transactionId: paymentLog.transactionId || 0n,
      status: paymentLog.status,
      amount: paymentLog.amount?.toString() || '0',
      provider: paymentLog.provider,
      reason: paymentLog.rawData || '',
      createdAt: paymentLog.createdAt.toISOString(),
      updatedAt:
        paymentLog.processedAt?.toISOString() || new Date().toISOString(),
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
