import { post, get, put } from '../utils/request'
import { OrderSubmission, CreateOrderResponse } from '../types/order'
import errorHandler, { retryWithBackoff, RetryOptions } from '../utils/errorHandler'
import { logger } from '@/utils/logger'

// 订单相关 API 服务

// ============================================================================
// Order Query & Management (Original order.ts)
// ============================================================================

// 获取用户订单列表
export const getUserOrders = async (userId: string | number) => {
  const response = await get<{ success: boolean; data: { orders: any[]; total: number }; message?: string }>(`/orders/user/${userId}`)
  if (!response.success) {
    throw new Error(response.message || '获取订单列表失败')
  }
  return response
}

// 获取订单详情
export const getOrderDetail = async (orderId: string | number) => {
  try {
    return await get(`/orders/${orderId}`)
  } catch (error) {
    logger.error('获取订单详情失败:', error)
    throw error
  }
}

// 取消订单
export const cancelOrder = (orderId: string | number) => {
  return put(`/orders/${orderId}/cancel`)
}

// 更新订单状态
export const updateOrderStatus = (orderId: string | number, status: string) => {
  return put(`/orders/${orderId}/status`, { status })
}

// 创建快递订单
export const createExpressOrder = (orderData: any) => {
  // 使用调度服务创建通用快递订单
  return post('/dispatch/express/orders', {
    ...orderData
  })
}

// 获取用户统计信息
export const getUserStatistics = (userId: string | number) => {
  return get(`/orders/user/${userId}/statistics`)
}

// 确认订单
export const confirmOrder = (orderId: string | number) => {
  return put(`/orders/${orderId}/confirm`)
}

// ============================================================================
// Order Submission (From orderSubmissionService.ts)
// ============================================================================

/**
 * Submit order to backend API with retry logic
 */
export const submitOrder = async (
  orderData: OrderSubmission,
  retryOptions?: RetryOptions
): Promise<CreateOrderResponse> => {
  // Default retry options for order submission
  const defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      logger.log(`[Order Submission] Retry attempt ${attempt} after error:`, error.code)
    },
  }

  const finalRetryOptions = { ...defaultRetryOptions, ...retryOptions }

  try {
    // Execute with retry logic
    const response = await retryWithBackoff(
      async () => {
        return submitOrderRequest(orderData)
      },
      finalRetryOptions
    )

    return response
  } catch (error) {
    // Handle error
    const appError = errorHandler.handle(error, {
      showToast: true,
      logError: true,
    })

    throw appError
  }
}

/**
 * Internal function to make the actual API request
 * This replaces the old simple createOrder function with robust handling
 */
async function submitOrderRequest(orderSubmission: OrderSubmission): Promise<CreateOrderResponse> {
  try {
    const payload = {
      items: orderSubmission.items.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        brandModel: item.brandModel,
        condition: item.condition,
        weight: item.weight,
        quantity: item.quantity,
        photos: item.photoStorageIds && item.photoStorageIds.length > 0 ? item.photoStorageIds : item.photos,
        notes: item.notes,
        estimatedPrice: item.estimatedPrice,
      })),
      addressId: orderSubmission.address.id,
      timeSlotId: orderSubmission.timeSlot.id,
      userId: orderSubmission.userId,
      notes: orderSubmission.notes,
    }

    const response = await post<any>('/orders', payload)

    if (!response || !response.success || !response.data) {
      throw new Error('Invalid response format from server')
    }
    const orderData = response.data
    return {
      success: true,
      orderNo: orderData.orderNo,
      order: orderData,
    }
  } catch (error) {
    throw error
  }
}

/**
 * Legacy createOrder support (wraps submitOrder if compatible, or direct post)
 * For backward compatibility
 */
export const createOrder = (orderData: any) => {

  return post('/orders', orderData)
}

/**
 * Validate order data before submission
 */
export const validateOrderForSubmission = (orderData: OrderSubmission): string[] => {
  const errors: string[] = []

  // Validate items
  if (!orderData.items || orderData.items.length === 0) {
    errors.push('订单中没有物品')
  }

  // Validate address
  if (!orderData.address || !orderData.address.id) {
    errors.push('请选择取货地址')
  }

  // Validate time slot
  if (!orderData.timeSlot || !orderData.timeSlot.id) {
    errors.push('请选择取货时间')
  }

  return errors
}

/**
 * Check if an error is retryable for order submission
 */
export const isOrderSubmissionRetryable = (error: any): boolean => {
  if (error.code) {
    // Network errors are retryable
    const retryableErrors = [
      'NETWORK_ERROR',
      'NETWORK_TIMEOUT',
      'NETWORK_OFFLINE',
      'INTERNAL_SERVER_ERROR',
      'SERVICE_UNAVAILABLE',
      'BAD_GATEWAY',
      'GATEWAY_TIMEOUT',
      'GATEWAY_TIMEOUT',
    ]
    return retryableErrors.includes(error.code)
  }

  return false
}
