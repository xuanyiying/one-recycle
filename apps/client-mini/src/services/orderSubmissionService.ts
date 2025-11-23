/**
 * Order Submission Service
 * Handles order submission with retry logic and error handling
 * 
 * Requirements: 5.4
 * Property: Property 8 (Order Submission Atomicity), Property 9 (Loading State During Submission)
 */

import { post } from '../utils/request'
import { OrderSubmission, CreateOrderResponse } from '../types/order'
import errorHandler, { retryWithBackoff, RetryOptions } from '../utils/errorHandler'

/**
 * Submit order to backend API with retry logic
 * 
 * Implements:
 * - POST /api/orders endpoint call
 * - Order creation response with order number
 * - Error handling for submission failures
 * - Retry logic with exponential backoff
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
    const response = await post('/order/orders', payload)

    // Validate response
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format from server')
    }

    // Check if response indicates success
    if (response.success === false) {
      const error = new Error(response.error || '订单提交失败')
      ;(error as any).code = 'ORDER_SUBMISSION_FAILED'
      throw error
    }

    // Ensure order number is present
    if (!response.orderNumber) {
      throw new Error('Server did not return order number')
    }

    return {
      success: true,
      orderNumber: response.orderNumber,
      order: response.order,
    }
  } catch (error) {
    // Re-throw with proper error handling
    throw error
  }
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
    errors.push('请选择收货地址')
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
    ]
    return retryableErrors.includes(error.code)
  }

  return false
}
