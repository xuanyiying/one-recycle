import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { GetPaymentRequest, CreatePaymentRequest, PaymentNotifyRequest, CreateRefundRequest, RefundResponse, RefundNotifyRequest, PaymentResponse } from '../proto/payment.pb';
import { RefundStatus } from '../prisma/generated/client';


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
      id: payment.id.toString(),
      outTradeNo: payment.outTradeNo,
      transactionId: payment.transactionId || '',
      total: payment.total?.toString() || '0',
      status: payment.status,
      provider: payment.provider,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
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