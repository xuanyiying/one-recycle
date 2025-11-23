/**
 * Price Calculation Utilities
 * Provides functions for calculating item prices and order totals
 */

import { Item, ItemCondition, PriceRange, OrderPricing, PriceBreakdown } from '../types/order'

// ============================================================================
// Price Calculation Constants
// ============================================================================

/**
 * Base prices for different categories (in CNY)
 * These would typically come from the backend
 */
const CATEGORY_BASE_PRICES: Record<string, number> = {
  electronics: 50,
  clothing: 10,
  books: 5,
  furniture: 100,
  appliances: 75,
  other: 20,
}

/**
 * Condition multipliers for price calculation
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
 * Gets base price for a category
 */
export const getCategoryBasePrice = (categoryId: string): number => {
  const categoryKey = categoryId.toLowerCase()
  return CATEGORY_BASE_PRICES[categoryKey] || CATEGORY_BASE_PRICES['other']
}

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
// Item Price Calculation
// ============================================================================

/**
 * Calculates estimated price for a single item
 */
export const calculateItemPrice = (item: Item): PriceRange => {
  const basePrice = getCategoryBasePrice(item.categoryId)
  const conditionMultiplier = getConditionMultiplier(item.condition)
  const weightFactor = calculateWeightFactor(item.weight)

  // Calculate price per unit
  const pricePerUnit = basePrice * conditionMultiplier * weightFactor

  // Calculate total for quantity
  const totalPrice = pricePerUnit * item.quantity

  // Add 20% variance for range
  const variance = totalPrice * 0.2
  const minPrice = Math.max(totalPrice - variance, 0)
  const maxPrice = totalPrice + variance

  return {
    min: Math.round(minPrice * 100) / 100,
    max: Math.round(maxPrice * 100) / 100,
    currency: 'CNY',
  }
}

/**
 * Recalculates item price (used when item details change)
 */
export const recalculateItemPrice = (item: Item): Item => {
  return {
    ...item,
    estimatedPrice: calculateItemPrice(item),
  }
}

// ============================================================================
// Order Total Calculation
// ============================================================================

/**
 * Calculates total pricing for an order
 */
export const calculateOrderPricing = (items: Item[]): OrderPricing => {
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
      unitPrice: getCategoryBasePrice(item.categoryId),
      subtotal: item.estimatedPrice,
    })
  })

  // Calculate service fee (based on average of min and max)
  const averageItemsTotal = (itemsMinTotal + itemsMaxTotal) / 2
  const serviceFee = Math.max(
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
    return `¥${priceRange.min.toFixed(2)}`
  }
  return `¥${priceRange.min.toFixed(2)} - ¥${priceRange.max.toFixed(2)}`
}

/**
 * Formats single price for display
 */
export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`
}

/**
 * Formats price breakdown for display
 */
export const formatPriceBreakdown = (breakdown: PriceBreakdown[]): string[] => {
  return breakdown.map((item) => {
    const subtotalStr = formatPriceRange(item.subtotal)
    return `${item.itemName} (${item.quantity}x${item.weight}kg): ${subtotalStr}`
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
 * Recalculates all item prices in a list
 */
export const recalculateAllItemPrices = (items: Item[]): Item[] => {
  return items.map((item) => recalculateItemPrice(item))
}

/**
 * Gets total weight of all items
 */
export const getTotalWeight = (items: Item[]): number => {
  return items.reduce((total, item) => total + item.weight * item.quantity, 0)
}

/**
 * Gets total quantity of all items
 */
export const getTotalQuantity = (items: Item[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

/**
 * Estimates price for items without calculating full order pricing
 */
export const estimateItemsPrice = (items: Item[]): PriceRange => {
  if (!items || items.length === 0) {
    return { min: 0, max: 0, currency: 'CNY' }
  }

  let minTotal = 0
  let maxTotal = 0

  items.forEach((item) => {
    minTotal += item.estimatedPrice.min
    maxTotal += item.estimatedPrice.max
  })

  return {
    min: Math.round(minTotal * 100) / 100,
    max: Math.round(maxTotal * 100) / 100,
    currency: 'CNY',
  }
}
