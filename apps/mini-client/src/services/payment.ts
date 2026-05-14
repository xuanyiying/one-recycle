import { get, post, put } from '../utils/request'

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
    WECHAT = 'WECHAT',
    ALIPAY = 'ALIPAY',
    UNIONPAY = 'UNIONPAY',
    BALANCE = 'BALANCE',
}

export interface CreatePaymentData {
    orderId: string;
    total: number;
    provider: PaymentProvider;
}

export interface PaymentInfo {
    id: string;
    orderId: string;
    transactionId: string;
    outTradeNo: string;
    total: number;
    status: PaymentStatus;
    provider: PaymentProvider;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const createPayment = (paymentData: CreatePaymentData) => {
    return post<PaymentInfo>('/payments', paymentData)
}

export const getPaymentInfo = (paymentId: string) => {
    return get<PaymentInfo>(`/payments/${paymentId}`)
}

export const updatePaymentStatus = (transactionId: string, status: PaymentStatus) => {
    return put<PaymentInfo>(`/payments/${transactionId}/status`, { status })
}

export const getPaymentByOrderId = (orderId: string) => {
    return get<PaymentInfo>(`/payments/order/${orderId}`)
}
