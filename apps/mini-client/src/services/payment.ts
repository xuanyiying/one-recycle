import { post, get } from '../utils/request'

// 支付相关类型定义

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

// 支付相关 API 服务

// 创建支付
export const createPayment = (paymentData: CreatePaymentData) => {
    return post<PaymentInfo>('/payment/payments', paymentData)
}

// 获取支付信息
export const getPaymentInfo = (paymentId: string) => {
    return get<PaymentInfo>(`/payment/payments/${paymentId}`)
}

// 更新支付状态
export const updatePaymentStatus = (paymentId: string, status: PaymentStatus) => {
    return post<PaymentInfo>(`/payment/payments/${paymentId}/status`, { status })
}