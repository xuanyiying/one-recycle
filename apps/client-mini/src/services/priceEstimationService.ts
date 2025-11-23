/**
 * Price Estimation Service
 * Handles API integration for calculating item prices
 * 
 * Requirements: 4.1
 * Property: Property 2 (Price Recalculation on Item Modification)
 */

import { post } from '../utils/request'
import { Item, OrderPricing, PriceEstimationRequest, PriceEstimationResponse } from '../types/order'
import errorHandler, { retryWithBackoff, RetryOptions } from '../utils/errorHandler'

/**
 * Estimate prices for items via API
 * 
 * Implements:
 * - API call to calculate item prices
 * - Handle pricing response with min/max ranges
 * - Error handling and retry logic
 */
export const estimateItemPrices = async (
  items: Item[],
  retryOptions?: RetryOptions
): Promise<OrderPricing> => {
  // Default retry options for price estimation
  const defaultRetryOptions: RetryOptions = {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`[Price Estimation] Retry attempt ${attempt} after error:`, error.code)
    },
  }

  const finalRetryOptions = { ...defaultRetryOptions, ...retryOptions }

  try {
    // Execute with retry logic
    const response = await retryWithBackoff(
      async () => {
        return estimatePricesRequest(items)
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
async function estimatePricesRequest(items: Item[]): Promise<OrderPricing> {
  try {
    // Prepare request payload
    const payload: PriceEstimationRequest = {
      items: items.map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        brandModel: item.brandModel,
        condition: item.condition,
        weight: item.weight,
        quantity: item.quantity,
        photos: item.photos,
        notes: item.notes,
        estimatedPrice: item.estimatedPrice,
        createdAt: item.createdAt,
      })),
    }

    // Make API request
    const response = await post('/pricing/estimate', payload)

    // Validate response
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format from server')
    }

    // Check if response indicates success
    if (response.success === false) {
      const error = new Error(response.error || '价格估算失败')
      ;(error as any).code = 'PRICE_ESTIMATION_FAILED'
      throw error
    }

    // Ensure pricing is present
    if (!response.pricing) {
      throw new Error('Server did not return pricing information')
    }

    // Validate pricing structure
    const pricing = response.pricing
    if (!pricing.itemsTotal || !pricing.totalEstimate) {
      throw new Error('Invalid pricing structure from server')
    }

    return pricing
  } catch (error) {
    // Re-throw with proper error handling
    throw error
  }
}

/**
 * Validate items before sending to API
 */
export const validateItemsForPricing = (items: Item[]): string[] => {
  const errors: string[] = []

  // Validate items array
  if (!items || items.length === 0) {
    errors.push('没有物品可估价')
  }

  // Validate each item
  items.forEach((item, index) => {
    if (!item.categoryId) {
      errors.push(`物品 ${index + 1}: 缺少分类`)
    }
    if (!item.condition) {
      errors.push(`物品 ${index + 1}: 缺少状态`)
    }
    if (item.weight <= 0) {
      errors.push(`物品 ${index + 1}: 重量必须大于0`)
    }
    if (item.quantity <= 0) {
      errors.push(`物品 ${index + 1}: 数量必须大于0`)
    }
  })

  return errors
}

/**
 * Check if an error is retryable for price estimation
 */
export const isPriceEstimationRetryable = (error: any): boolean => {
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

/**
 * Batch estimate prices for multiple item sets
 * Useful for comparing prices across different configurations
 */
export const batchEstimatePrices = async (
  itemSets: Item[][]
): Promise<OrderPricing[]> => {
  try {
    const results = await Promise.all(
      itemSets.map((items) => estimateItemPrices(items))
    )
    return results
  } catch (error) {
    const appError = errorHandler.handle(error, {
      showToast: true,
      logError: true,
    })
    throw appError
  }
}

/**
 * Get pricing for a single item
 */
export const estimateSingleItemPrice = async (item: Item): Promise<OrderPricing> => {
  return estimateItemPrices([item])
}
