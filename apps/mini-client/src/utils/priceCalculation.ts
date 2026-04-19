/**
 * Price Calculation Utilities
 * Provides functions for calculating item prices and order totals
 *
 * 重要说明：本文件不再包含硬编码价格。
 * 所有价格数据应从后端API获取，通过以下方式：
 * 1. services/pricing.ts 中的 estimateItemPrices 函数
 * 2. services/category.ts 中的 getCategoryDetail 函数获取分类价格配置
 *
 * 管理端设置的价格通过 /pricing/estimate API 统一计算。
 */

import { Item, ItemCondition, PriceRange, OrderPricing, PriceBreakdown } from '../types/order'

// ============================================================================
// Price Calculation Constants (仅保留计算系数，不含价格数据)
// ============================================================================

/**
 * Condition multipliers for price calculation
 * 这些系数可由管理端配置，此处保留作为默认值
 */
const CONDITION_MULTIPLIERS: Record<ItemCondition, number> = {
  [ItemCondition.NEW]: 1.2,
  [ItemCondition.GOOD]: 1.0,
  [ItemCondition.FAIR]: 0.7,
}

/**
 * Service fee percentage (5% of total)
 */
const SERVICE_FEE_PERCENTAGE = 0.05

/**
 * Minimum service fee (CNY)
 */
const MINIMUM_SERVICE_FEE = 2

// ============================================================================
// Base Price Calculation
// ============================================================================

/**
 * Gets condition multiplier
 */
export const getConditionMultiplier = (condition: ItemCondition): number => {
  return CONDITION_MULTIPLIERS[condition] || 1.0
}

/**
 * Calculates weight factor (price increases with weight)
 * Formula: 1 + (weight - 1) * 0.1 (capped at 2.0)
 */
export const calculateWeightFactor = (weight: number): number => {
  if (weight <= 0) return 1.0
  const factor = 1 + (weight - 1) * 0.1
  return Math.min(factor, 2.0)
}

// ============================================================================
// Order Total Calculation
// ============================================================================

/**
 * Calculates total pricing for an order based on items with pre-calculated prices
 * 此方法假设 item.estimatedPrice 已从后端API获取
 */
export const calculateOrderPricing = (
  items: Item[],
  orderType: 'RECYCLE' | 'SALE' = 'RECYCLE'
): OrderPricing => {
  if (!items || items.length === 0) {
    return {
      itemsTotal: { min: 0, max: 0, currency: 'CNY' },
      serviceFee: 0,
      totalEstimate: { min: 0, max: 0, currency: 'CNY' },
      breakdown: [],
    }
  }

  // Calculate items total
  let itemsMinTotal = 0
  let itemsMaxTotal = 0
  const breakdown: PriceBreakdown[] = []

  items.forEach((item) => {
    itemsMinTotal += item.estimatedPrice.min
    itemsMaxTotal += item.estimatedPrice.max

    breakdown.push({
      itemId: item.id,
      itemName: item.categoryName,
      quantity: item.quantity,
      weight: item.weight,
      unitPrice: item.categoryBasePrice || 0,
      subtotal: item.estimatedPrice,
    })
  })

  // Calculate service fee (based on average of min and max)
  const averageItemsTotal = (itemsMinTotal + itemsMaxTotal) / 2
  const serviceFee =
    orderType === 'RECYCLE'
      ? 0
      : Math.max(
        Math.round(averageItemsTotal * SERVICE_FEE_PERCENTAGE * 100) / 100,
        MINIMUM_SERVICE_FEE
      )

  // Calculate total estimate
  const totalMin = Math.round((itemsMinTotal + serviceFee) * 100) / 100
  const totalMax = Math.round((itemsMaxTotal + serviceFee) * 100) / 100

  return {
    itemsTotal: {
      min: Math.round(itemsMinTotal * 100) / 100,
      max: Math.round(itemsMaxTotal * 100) / 100,
      currency: 'CNY',
    },
    serviceFee: serviceFee,
    totalEstimate: {
      min: totalMin,
      max: totalMax,
      currency: 'CNY',
    },
    breakdown: breakdown,
  }
}

// ============================================================================
// Price Formatting
// ============================================================================

/**
 * Formats price range for display
 */
export const formatPriceRange = (priceRange: PriceRange): string => {
  if (priceRange.min === priceRange.max) {
    return `¥${Number(priceRange.min).toFixed(2)}`
  }
  return `¥${Number(priceRange.min).toFixed(2)} - ¥${Number(priceRange.max).toFixed(2)}`
}

/**
 * Formats single price for display
 */
export const formatPrice = (price: number | string): string => {
  return `¥${Number(price).toFixed(2)}`
}

/**
 * Formats price breakdown for display
 */
export const formatPriceBreakdown = (breakdown: PriceBreakdown[]): string[] => {
  return breakdown.map((item) => {
    const subtotalStr = formatPriceRange(item.subtotal)
    const detail =
      item.weight > 0 ? `${item.weight}kg` : `${item.quantity}`
    return `${item.itemName} (${detail}): ${subtotalStr}`
  })
}

// ============================================================================
// Price Validation
// ============================================================================

/**
 * Validates price range is reasonable
 */
export const isValidPriceRange = (priceRange: PriceRange): boolean => {
  return (
    priceRange.min >= 0 &&
    priceRange.max >= priceRange.min &&
    priceRange.currency === 'CNY'
  )
}

/**
 * Checks if price is within expected range
 */
export const isPriceWithinRange = (price: number, priceRange: PriceRange): boolean => {
  return price >= priceRange.min && price <= priceRange.max
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculates total from price range (uses average)
 */
export const calculateAverageFromRange = (priceRange: PriceRange): number => {
  return (priceRange.min + priceRange.max) / 2
}

/**
 * Calculates minimum total from items
 */
export const calculateMinimumTotal = (items: Item[]): number => {
  return items.reduce((total, item) => total + item.estimatedPrice.min, 0)
}

/**
 * Calculates maximum total from items
 */
export const calculateMaximumTotal = (items: Item[]): number => {
  return items.reduce((total, item) => total + item.estimatedPrice.max, 0)
}

/**
 * Compares two price ranges
 */
export const comparePriceRanges = (
  range1: PriceRange,
  range2: PriceRange
): number => {
  const avg1 = calculateAverageFromRange(range1)
  const avg2 = calculateAverageFromRange(range2)
  return avg1 - avg2
}

// ============================================================================
// Price Estimate Helpers (用于后端API返回的数据处理)
// ============================================================================

/**
 * 从后端API返回的定价数据中提取显示价格
 */
export const extractDisplayPrice = (pricing: OrderPricing): string => {
  if (pricing.totalEstimate.min === pricing.totalEstimate.max) {
    return formatPrice(pricing.totalEstimate.min)
  }
  return formatPriceRange(pricing.totalEstimate)
}

/**
 * 检查价格是否需要更新（比较本地与后端价格）
 */
export const shouldUpdatePrice = (
  localPrice: PriceRange,
  serverPrice: PriceRange,
  tolerance: number = 0.01
): boolean => {
  const minDiff = Math.abs(localPrice.min - serverPrice.min)
  const maxDiff = Math.abs(localPrice.max - serverPrice.max)
  return minDiff > tolerance || maxDiff > tolerance
}
