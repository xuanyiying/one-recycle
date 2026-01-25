// @ts-nocheck
/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
export interface CreatePaymentRequest {
  orderId: bigint;
  amount: number;
  provider: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId: string;
  message: string;
}

export interface GetPaymentRequest {
  paymentId: string;
}

export interface GetPaymentResponse {
  payment: Payment | undefined;
}

export interface Payment {
  id: bigint;
  orderId: bigint;
  transactionId: bigint;
  total: number;
  status: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePaymentStatusRequest {
  transactionId: bigint;
  status: string;
}

export interface UpdatePaymentStatusResponse {
  success: boolean;
  payment: Payment | undefined;
}

export interface CreateRefundRequest {
  paymentId: bigint;
  refundAmount: number;
  reason: string;
}

export interface CreateRefundResponse {
  success: boolean;
  refundId: bigint;
  outRefundNo: string;
  message: string;
}

export interface GetRefundRequest {
  refundId: bigint;
}

export interface GetRefundResponse {
  refund: Refund | undefined;
}

export interface Refund {
  id: bigint;
  paymentId: bigint;
  outRefundNo: string;
  refundAmount: number;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentLogRequest {
  orderId: bigint;
  transactionId: bigint;
  status: string;
  amount: string;
  provider: string;
  reason: string;
}

export interface PaymentLogResponse {
  id: bigint;
  orderId: bigint;
  transactionId: bigint;
  status: string;
  amount: string;
  provider: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLogsResponse {
  logs: PaymentLogResponse[];
}

export interface GetPaymentLogsByOrderIdRequest {
  orderId: bigint;
}

export interface GetPaymentLogByTransactionIdRequest {
  transactionId: bigint;
}

export interface IsTransactionProcessedRequest {
  transactionId: bigint;
}

export interface IsTransactionProcessedResponse {
  processed: boolean;
}

export interface GetPaymentStatsRequest {
  startDate: string;
  endDate: string;
}

export interface PaymentStatsResponse {
  total: number;
  success: number;
  failed: number;
  closed: number;
  totalAmount: string;
}
export interface PaymentServiceClient {
  createPayment(
    request: CreatePaymentRequest,
  ): Observable<CreatePaymentResponse>;

  getPayment(request: GetPaymentRequest): Observable<GetPaymentResponse>;

  updatePaymentStatus(
    request: UpdatePaymentStatusRequest,
  ): Observable<UpdatePaymentStatusResponse>;

  createRefund(request: CreateRefundRequest): Observable<CreateRefundResponse>;

  getRefund(request: GetRefundRequest): Observable<GetRefundResponse>;

  createPaymentLog(
    request: CreatePaymentLogRequest,
  ): Observable<PaymentLogResponse>;

  getPaymentLogsByOrderId(
    request: GetPaymentLogsByOrderIdRequest,
  ): Observable<PaymentLogsResponse>;

  getPaymentLogByTransactionId(
    request: GetPaymentLogByTransactionIdRequest,
  ): Observable<PaymentLogResponse>;

  isTransactionProcessed(
    request: IsTransactionProcessedRequest,
  ): Observable<IsTransactionProcessedResponse>;

  getPaymentStats(
    request: GetPaymentStatsRequest,
  ): Observable<PaymentStatsResponse>;
}

export interface PaymentServiceController {
  createPayment(
    request: CreatePaymentRequest,
  ):
    | Promise<CreatePaymentResponse>
    | Observable<CreatePaymentResponse>
    | CreatePaymentResponse;

  getPayment(
    request: GetPaymentRequest,
  ):
    | Promise<GetPaymentResponse>
    | Observable<GetPaymentResponse>
    | GetPaymentResponse;

  updatePaymentStatus(
    request: UpdatePaymentStatusRequest,
  ):
    | Promise<UpdatePaymentStatusResponse>
    | Observable<UpdatePaymentStatusResponse>
    | UpdatePaymentStatusResponse;

  createRefund(
    request: CreateRefundRequest,
  ):
    | Promise<CreateRefundResponse>
    | Observable<CreateRefundResponse>
    | CreateRefundResponse;

  getRefund(
    request: GetRefundRequest,
  ):
    | Promise<GetRefundResponse>
    | Observable<GetRefundResponse>
    | GetRefundResponse;

  createPaymentLog(
    request: CreatePaymentLogRequest,
  ):
    | Promise<PaymentLogResponse>
    | Observable<PaymentLogResponse>
    | PaymentLogResponse;

  getPaymentLogsByOrderId(
    request: GetPaymentLogsByOrderIdRequest,
  ):
    | Promise<PaymentLogsResponse>
    | Observable<PaymentLogsResponse>
    | PaymentLogsResponse;

  getPaymentLogByTransactionId(
    request: GetPaymentLogByTransactionIdRequest,
  ):
    | Promise<PaymentLogResponse>
    | Observable<PaymentLogResponse>
    | PaymentLogResponse;

  isTransactionProcessed(
    request: IsTransactionProcessedRequest,
  ):
    | Promise<IsTransactionProcessedResponse>
    | Observable<IsTransactionProcessedResponse>
    | IsTransactionProcessedResponse;

  getPaymentStats(
    request: GetPaymentStatsRequest,
  ):
    | Promise<PaymentStatsResponse>
    | Observable<PaymentStatsResponse>
    | PaymentStatsResponse;
}

export function PaymentServiceControllerMethods() {
  return function (constructor: Function) {
    const methodNames = [
      'createPayment',
      'getPayment',
      'updatePaymentStatus',
      'createRefund',
      'getRefund',
      'createPaymentLog',
      'getPaymentLogsByOrderId',
      'getPaymentLogByTransactionId',
      'isTransactionProcessed',
      'getPaymentStats',
    ];
    methodNames.forEach((methodName) => {
      const descriptor: any = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        methodName,
      );
      GrpcMethod('PaymentService', methodName)(
        constructor.prototype[methodName],
        methodName,
        descriptor,
      );
    });
    const grpcStreamMethods = [];
    grpcStreamMethods.forEach((methodName) => {
      const descriptor: any = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        methodName,
      );
      GrpcStreamMethod('PaymentService', methodName)(
        constructor.prototype[methodName],
        methodName,
        descriptor,
      );
    });
  };
}

export const PAYMENT_SERVICE_NAME = 'PaymentService';
