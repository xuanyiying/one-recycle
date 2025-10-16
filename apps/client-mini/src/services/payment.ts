import { post, get } from '../utils/request'

// 支付相关 API 服务

// 创建支付
export const createPayment = (paymentData: any) => {
    return post('/payment/payments', paymentData)
}

// 获取支付信息
export const getPaymentInfo = (paymentId: string) => {
    return get(`/payment/payments/${paymentId}`)
}

// 更新支付状态
export const updatePaymentStatus = (paymentId: string, status: string) => {
    return post(`/payment/payments/${paymentId}/status`, { status })
}