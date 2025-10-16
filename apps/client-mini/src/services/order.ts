import { post, get, put } from '../utils/request'

// 订单相关 API 服务

// 创建订单
export const createOrder = (orderData: any) => {
    return post('/order/orders', orderData)
}

// 获取用户订单列表
export const getUserOrders = (userId: string) => {
    return get(`/order/orders/user/${userId}`)
}

// 获取订单详情
export const getOrderDetail = (orderId: string) => {
    return get(`/order/orders/${orderId}`)
}

// 取消订单
export const cancelOrder = (orderId: string) => {
    return put(`/order/orders/${orderId}/cancel`)
}

// 更新订单状态
export const updateOrderStatus = (orderId: string, status: string) => {
    return put(`/order/orders/${orderId}/status`, { status })
}

// 创建京东快递订单
export const createJdExpressOrder = (orderData: any) => {
    // 使用调度服务创建京东快递订单
    return post('/dispatch/jd-express/orders', {
        ...orderData,
        expressType: 'jd'
    })
}

// 获取用户统计信息
export const getUserStatistics = (userId: string) => {
    return get(`/order/orders/user/${userId}/statistics`)
}

// 确认订单
export const confirmOrder = (orderId: string) => {
    return put(`/order/orders/${orderId}/confirm`)
}