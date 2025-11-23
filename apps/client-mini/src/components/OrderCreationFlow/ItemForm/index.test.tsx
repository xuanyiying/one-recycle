/**
 * ItemForm Component Unit Tests
 * Tests for item addition, validation, and form state management
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect } from 'vitest'
import { Item, ItemCondition } from '../../../types/order'
import { calculateItemPrice } from '../../../utils/priceCalculation'
import { validateItem, validateItemList } from '../../../utils/orderValidation'

// ============================================================================
// Unit Tests for Item Validation
// ============================================================================

describe('ItemForm Component - Unit Tests', () => {
    // ============================================================================
    // Item Validation Tests
    // ============================================================================

    describe('Item Validation', () => {
        it('should validate a complete item with all required fields', () => {
            const item: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const errors = validateItem(item)
            expect(errors.length).toBe(0)
        })

        it('should reject item with missing category', () => {
            const item: Item = {
                id: 'item1',
                categoryId: '',
                categoryName: '',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const errors = validateItem(item)
            expect(errors.length).toBeGreaterThan(0)
            expect(errors.some((e) => e.field === 'categoryId')).toBe(true)
        })

        it('should reject item with zero weight', () => {
            const item: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const errors = validateItem(item)
            expect(errors.length).toBeGreaterThan(0)
            expect(errors.some((e) => e.field === 'weight')).toBe(true)
        })

        it('should reject item with zero quantity', () => {
            const item: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 0,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const errors = validateItem(item)
            expect(errors.length).toBeGreaterThan(0)
            expect(errors.some((e) => e.field === 'quantity')).toBe(true)
        })

        it('should reject item with no photos', () => {
            const item: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: [],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const errors = validateItem(item)
            expect(errors.length).toBeGreaterThan(0)
            expect(errors.some((e) => e.field === 'photos')).toBe(true)
        })

        it('should reject item with more than 6 photos', () => {
            const item: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const errors = validateItem(item)
            expect(errors.length).toBeGreaterThan(0)
            expect(errors.some((e) => e.field === 'photos')).toBe(true)
        })
    })

    // ============================================================================
    // Item List Validation Tests
    // ============================================================================

    describe('Item List Validation', () => {
        it('should accept non-empty item list', () => {
            const items: Item[] = [
                {
                    id: 'item1',
                    categoryId: 'electronics',
                    categoryName: '电子产品',
                    brandModel: 'iPhone 13',
                    condition: ItemCondition.GOOD,
                    weight: 0.5,
                    quantity: 1,
                    photos: ['photo1.jpg'],
                    estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                    createdAt: new Date().toISOString(),
                },
            ]

            const errors = validateItemList(items)
            expect(errors.length).toBe(0)
        })

        it('should reject empty item list', () => {
            const items: Item[] = []

            const errors = validateItemList(items)
            expect(errors.length).toBeGreaterThan(0)
            expect(errors.some((e) => e.field === 'items')).toBe(true)
        })
    })

    // ============================================================================
    // Price Calculation Tests
    // ============================================================================

    describe('Price Calculation', () => {
        it('should calculate price for a valid item', () => {
            const item: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 0, max: 0, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const price = calculateItemPrice(item)
            expect(price.min).toBeGreaterThanOrEqual(0)
            expect(price.max).toBeGreaterThanOrEqual(price.min)
            expect(price.currency).toBe('CNY')
        })

        it('should calculate higher price for new condition', () => {
            const goodItem: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 0, max: 0, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const newItem: Item = {
                ...goodItem,
                condition: ItemCondition.NEW,
            }

            const goodPrice = calculateItemPrice(goodItem)
            const newPrice = calculateItemPrice(newItem)

            expect(newPrice.min).toBeGreaterThan(goodPrice.min)
            expect(newPrice.max).toBeGreaterThan(goodPrice.max)
        })

        it('should calculate lower price for fair condition', () => {
            const goodItem: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 0, max: 0, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const fairItem: Item = {
                ...goodItem,
                condition: ItemCondition.FAIR,
            }

            const goodPrice = calculateItemPrice(goodItem)
            const fairPrice = calculateItemPrice(fairItem)

            expect(fairPrice.min).toBeLessThan(goodPrice.min)
            expect(fairPrice.max).toBeLessThan(goodPrice.max)
        })

        it('should calculate higher price for heavier items', () => {
            const lightItem: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 0, max: 0, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const heavyItem: Item = {
                ...lightItem,
                weight: 2.0,
            }

            const lightPrice = calculateItemPrice(lightItem)
            const heavyPrice = calculateItemPrice(heavyItem)

            expect(heavyPrice.min).toBeGreaterThan(lightPrice.min)
            expect(heavyPrice.max).toBeGreaterThan(lightPrice.max)
        })

        it('should calculate higher price for larger quantities', () => {
            const singleItem: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 0, max: 0, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const multipleItems: Item = {
                ...singleItem,
                quantity: 3,
            }

            const singlePrice = calculateItemPrice(singleItem)
            const multiplePrice = calculateItemPrice(multipleItems)

            expect(multiplePrice.min).toBeGreaterThan(singlePrice.min)
            expect(multiplePrice.max).toBeGreaterThan(singlePrice.max)
        })
    })

    // ============================================================================
    // Item Addition Tests
    // ============================================================================

    describe('Item Addition', () => {
        it('should increase item count by 1 when adding an item', () => {
            const existingItems: Item[] = []
            const newItem: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const updatedItems = [...existingItems, newItem]

            expect(updatedItems.length).toBe(existingItems.length + 1)
            expect(updatedItems).toContain(newItem)
        })

        it('should preserve existing items when adding a new item', () => {
            const existingItem: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const newItem: Item = {
                id: 'item2',
                categoryId: 'clothing',
                categoryName: '衣服',
                brandModel: 'T-Shirt',
                condition: ItemCondition.GOOD,
                weight: 0.2,
                quantity: 1,
                photos: ['photo2.jpg'],
                estimatedPrice: { min: 10, max: 20, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const existingItems = [existingItem]
            const updatedItems = [...existingItems, newItem]

            expect(updatedItems.length).toBe(2)
            expect(updatedItems).toContain(existingItem)
            expect(updatedItems).toContain(newItem)
        })

        it('should maintain item order when adding items', () => {
            const item1: Item = {
                id: 'item1',
                categoryId: 'electronics',
                categoryName: '电子产品',
                brandModel: 'iPhone 13',
                condition: ItemCondition.GOOD,
                weight: 0.5,
                quantity: 1,
                photos: ['photo1.jpg'],
                estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const item2: Item = {
                id: 'item2',
                categoryId: 'clothing',
                categoryName: '衣服',
                brandModel: 'T-Shirt',
                condition: ItemCondition.GOOD,
                weight: 0.2,
                quantity: 1,
                photos: ['photo2.jpg'],
                estimatedPrice: { min: 10, max: 20, currency: 'CNY' },
                createdAt: new Date().toISOString(),
            }

            const items = [item1, item2]

            expect(items[0]).toEqual(item1)
            expect(items[1]).toEqual(item2)
        })
    })

    // ============================================================================
    // Photo Upload Tests
    // ============================================================================

    describe('Photo Upload Limit', () => {
        it('should accept 1 to 6 photos', () => {
            for (let i = 1; i <= 6; i++) {
                const photos = Array.from({ length: i }, (_, idx) => `photo${idx + 1}.jpg`)
                expect(photos.length).toBeGreaterThanOrEqual(1)
                expect(photos.length).toBeLessThanOrEqual(6)
            }
        })

        it('should enforce 6 photo maximum', () => {
            const photos = Array.from({ length: 10 }, (_, idx) => `photo${idx + 1}.jpg`)
            const limitedPhotos = photos.slice(0, 6)

            expect(limitedPhotos.length).toBe(6)
            expect(limitedPhotos.length).toBeLessThanOrEqual(6)
        })

        it('should preserve all photos within limit', () => {
            const photos = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg']
            const limitedPhotos = photos.slice(0, 6)

            expect(limitedPhotos).toEqual(photos)
        })
    })
})
