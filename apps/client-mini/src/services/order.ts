import { post, get, put } from '../utils/request'
import { OrderSubmission, CreateOrderResponse } from '../types/order'
import errorHandler, { retryWithBackoff, RetryOptions } from '../utils/errorHandler'

// 订单相关 API 服务

// ============================================================================
// Order Query & Management (Original order.ts)
// ============================================================================

// 获取用户订单列表
export const getUserOrders = (userId: string | number) => {
    return get(`/orders/user/${userId}`)
}

// 获取订单详情
export const getOrderDetail = (orderId: string | number) => {
    return get(`/orders/${orderId}`)
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
      console.log(`[Order Submission] Retry attempt ${attempt} after error:`, error.code)
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
async function submitOrderRequest(orderData: OrderSubmission): Promise<CreateOrderResponse> {
  try {
    // Prepare request payload
    const payload = {
      items: orderData.items.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        brandModel: item.brandModel,
        condition: item.condition,
        weight: item.weight,
        quantity: item.quantity,
        photos: item.photos,
        notes: item.notes,
        estimatedPrice: item.estimatedPrice,
      })),
      addressId: orderData.address.id,
      timeSlotId: orderData.timeSlot.id,
      notes: orderData.notes,
      agreedToTerms: orderData.agreedToTerms,
    }

    // Make API request
    const response = await post('/orders', payload)

    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format from server')
    }

    const hasWrappedData =
      Object.prototype.hasOwnProperty.call(response, 'data') &&
      Object.prototype.hasOwnProperty.call(response, 'success')

    const success =
      hasWrappedData && typeof (response as any).success === 'boolean'
        ? (response as any).success
        : (response as any).success ?? true

    if (success === false) {
      const errorMessage =
        (response as any).error ||
        (hasWrappedData ? (response as any).message : undefined) ||
        '订单提交失败'
      const error = new Error(errorMessage)
      ;(error as any).code = 'ORDER_SUBMISSION_FAILED'
      throw error
    }

    const data = hasWrappedData ? (response as any).data : response

    const orderNumber =
      data.orderNumber || data.orderNo || (response as any).orderNumber

    if (!orderNumber) {
      throw new Error('Server did not return order number')
    }

    return {
      success: true,
      orderNumber,
      order: data.order || (response as any).order,
    }
  } catch (error) {
    // Re-throw with proper error handling
    throw error
  }
}

/**
 * Legacy createOrder support (wraps submitOrder if compatible, or direct post)
 * For backward compatibility
 */
export const createOrder = (orderData: any) => {
    // If orderData matches OrderSubmission, we could use submitOrder
    // But for safety, we keep the direct call for legacy usages, 
    // OR we upgrade it to use submitOrderRequest if possible.
    // Given the payload difference (submitOrderRequest maps fields), 
    // we should stick to the simple post for 'createOrder' if it expects raw data.
    return post('/order/orders', orderData)
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

  // Validate terms agreement
  if (!orderData.agreedToTerms) {
    errors.push('请同意服务条款')
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
