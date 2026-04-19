/**
 * Unit Tests for Price Estimation Service
 * Tests API integration for price calculation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as request from '../utils/request'
import {
  estimateItemPrices,
  validateItemsForPricing,
  isPriceEstimationRetryable,
  batchEstimatePrices,
  estimateSingleItemPrice,
} from './pricing'
import { Item, ItemCondition, OrderPricing } from '../types/order'

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('../utils/request', () => ({
  post: vi.fn(),
}))

vi.mock('../utils/errorHandler', () => ({
  default: {
    handle: (error: any) => {
      const err = new Error(error.message || 'Error')
      ;(err as any).code = error.code || 'UNKNOWN_ERROR'
      return err
    },
  },
  retryWithBackoff: async (fn: () => Promise<any>) => {
    return fn()
  },
}))

// ============================================================================
// Test Data
// ============================================================================

const mockItem: Item = {
  id: '1',
  categoryId: 'electronics',
  categoryName: 'Electronics',
  brandModel: 'iPhone 13',
  condition: ItemCondition.GOOD,
  weight: 0.2,
  quantity: 1,
  photos: ['photo1.jpg'],
  notes: 'Good condition',
  estimatedPrice: { min: 100, max: 150, currency: 'CNY' },
  createdAt: new Date().toISOString(),
}

const mockPricing: OrderPricing = {
  itemsTotal: { min: 100, max: 150, currency: 'CNY' },
  serviceFee: 0,
  totalEstimate: { min: 100, max: 150, currency: 'CNY' },
  breakdown: [
    {
      itemId: '1',
      itemName: 'Electronics',
      quantity: 1,
      weight: 0.2,
      unitPrice: 100,
      subtotal: { min: 100, max: 150, currency: 'CNY' },
    },
  ],
}

// ============================================================================
// Tests
// ============================================================================

describe('Price Estimation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('estimateItemPrices', () => {
    it('should successfully estimate prices for items', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue({
        success: true,
        data: mockPricing,
      })

      const result = await estimateItemPrices([mockItem])

      expect(result).toEqual(mockPricing)
      expect(mockPost).toHaveBeenCalledWith('/pricing/estimate', expect.any(Object))
    })

    it('should handle API errors gracefully', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockRejectedValue(new Error('Network error'))

      await expect(estimateItemPrices([mockItem])).rejects.toThrow()
    })

    it('should throw error when API returns success: false', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue({
        success: false,
        error: '价格估算失败',
      })

      await expect(estimateItemPrices([mockItem])).rejects.toThrow('价格估算失败')
    })

    it('should throw error when pricing is missing', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue({
        success: true,
      })

      await expect(estimateItemPrices([mockItem])).rejects.toThrow()
    })

    it('should throw error when response format is invalid', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue(null)

      await expect(estimateItemPrices([mockItem])).rejects.toThrow()
    })

    it('should include all items in request payload', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue({
        success: true,
        data: mockPricing,
      })

      const items = [mockItem, { ...mockItem, id: '2' }]
      await estimateItemPrices(items)

      expect(mockPost).toHaveBeenCalled()
      const callArgs = mockPost.mock.calls[0]!
      expect(callArgs[1].items).toHaveLength(2)
      expect(callArgs[1].orderType).toBe('RECYCLE')
    })
  })

  describe('validateItemsForPricing', () => {
    it('should return no errors for valid items', () => {
      const errors = validateItemsForPricing([mockItem])
      expect(errors).toHaveLength(0)
    })

    it('should return error for empty items array', () => {
      const errors = validateItemsForPricing([])
      expect(errors).toContain('没有物品可估价')
    })

    it('should return error for missing categoryId', () => {
      const invalidItem = { ...mockItem, categoryId: '' }
      const errors = validateItemsForPricing([invalidItem])
      expect(errors.some((e) => e.includes('缺少分类'))).toBe(true)
    })

    it('should return error for missing condition', () => {
      const invalidItem = { ...mockItem, condition: '' as any }
      const errors = validateItemsForPricing([invalidItem])
      expect(errors.some((e) => e.includes('缺少状态'))).toBe(true)
    })

    it('should return error when weight and quantity are missing', () => {
      const invalidItem = { ...mockItem, weight: 0, quantity: 0 }
      const errors = validateItemsForPricing([invalidItem])
      expect(errors.some((e) => e.includes('重量或数量至少填写一项'))).toBe(true)
    })

    it('should return error when quantity invalid and no weight', () => {
      const invalidItem = { ...mockItem, weight: 0, quantity: -1 }
      const errors = validateItemsForPricing([invalidItem])
      expect(errors.some((e) => e.includes('重量或数量至少填写一项'))).toBe(true)
    })

    it('should validate multiple items', () => {
      const items = [
        mockItem,
        { ...mockItem, id: '2', weight: 0 },
        { ...mockItem, id: '3', categoryId: '' },
      ]
      const errors = validateItemsForPricing(items)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('isPriceEstimationRetryable', () => {
    it('should return true for network errors', () => {
      const error = { code: 'NETWORK_ERROR' }
      expect(isPriceEstimationRetryable(error)).toBe(true)
    })

    it('should return true for timeout errors', () => {
      const error = { code: 'NETWORK_TIMEOUT' }
      expect(isPriceEstimationRetryable(error)).toBe(true)
    })

    it('should return true for server errors', () => {
      const error = { code: 'INTERNAL_SERVER_ERROR' }
      expect(isPriceEstimationRetryable(error)).toBe(true)
    })

    it('should return true for service unavailable', () => {
      const error = { code: 'SERVICE_UNAVAILABLE' }
      expect(isPriceEstimationRetryable(error)).toBe(true)
    })

    it('should return false for non-retryable errors', () => {
      const error = { code: 'INVALID_REQUEST' }
      expect(isPriceEstimationRetryable(error)).toBe(false)
    })

    it('should return false for errors without code', () => {
      const error = {}
      expect(isPriceEstimationRetryable(error)).toBe(false)
    })
  })

  describe('batchEstimatePrices', () => {
    it('should estimate prices for multiple item sets', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue({
        success: true,
        data: mockPricing,
      })

      const itemSets = [[mockItem], [{ ...mockItem, id: '2' }]]
      const results = await batchEstimatePrices(itemSets)

      expect(results).toHaveLength(2)
      expect(results[0]).toEqual(mockPricing)
      expect(results[1]).toEqual(mockPricing)
    })

    it('should handle errors in batch estimation', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockRejectedValue(new Error('Network error'))

      const itemSets = [[mockItem], [{ ...mockItem, id: '2' }]]
      await expect(batchEstimatePrices(itemSets)).rejects.toThrow()
    })
  })

  describe('estimateSingleItemPrice', () => {
    it('should estimate price for a single item', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue({
        success: true,
        data: mockPricing,
      })

      const result = await estimateSingleItemPrice(mockItem)

      expect(result).toEqual(mockPricing)
      expect(mockPost).toHaveBeenCalledWith('/pricing/estimate', expect.any(Object))
    })

    it('should pass single item in array to API', async () => {
      const mockPost = vi.mocked(request.post)
      mockPost.mockResolvedValue({
        success: true,
        data: mockPricing,
      })

      await estimateSingleItemPrice(mockItem)

      expect(mockPost).toHaveBeenCalled()
      const callArgs = mockPost.mock.calls[0]!
      expect(callArgs[1].items).toHaveLength(1)
      expect(callArgs[1].items[0].id).toBe(mockItem.id)
    })
  })
})
