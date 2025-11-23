/**
 * Validation Service Unit Tests
 * Tests all validation functions for order creation flow
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect } from 'vitest'
import ValidationService from './validationService'
import { Item, Address, TimeSlot, ItemCondition, AddressLabel } from '../types/order'

// ============================================================================
// Test Setup
// ============================================================================

const validationService = new ValidationService()

// Mock data
const mockItem: Item = {
  id: 'item_1',
  categoryId: 'electronics',
  categoryName: '电子产品',
  brandModel: 'iPhone 13',
  condition: ItemCondition.GOOD,
  weight: 0.5,
  quantity: 1,
  photos: ['photo1.jpg'],
  notes: 'Good condition',
  estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
  createdAt: new Date().toISOString(),
}

const mockAddress: Address = {
  id: 'addr_1',
  recipientName: 'John Doe',
  phoneNumber: '13800138000',
  region: 'Beijing',
  detailedAddress: '123 Main St',
  label: AddressLabel.HOME,
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockTimeSlot: TimeSlot = {
  id: 'slot_1',
  date: '2025-12-25',
  startTime: '14:00',
  endTime: '16:00',
  capacity: 10,
  booked: 5,
  isAvailable: true,
}

// ============================================================================
// Item Validation Tests
// ============================================================================

describe('ValidationService - Item Validation', () => {
  it('should validate a valid item', () => {
    const errors = validationService.validateItem(mockItem)
    expect(errors).toHaveLength(0)
  })

  it('should reject item with missing category', () => {
    const item = { ...mockItem, categoryId: '' }
    const errors = validationService.validateItem(item)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'categoryId' })
    )
  })

  it('should reject item with missing condition', () => {
    const item = { ...mockItem, condition: '' as any }
    const errors = validationService.validateItem(item)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'condition' })
    )
  })

  it('should reject item with zero weight', () => {
    const item = { ...mockItem, weight: 0 }
    const errors = validationService.validateItem(item)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'weight' })
    )
  })

  it('should reject item with negative weight', () => {
    const item = { ...mockItem, weight: -1 }
    const errors = validationService.validateItem(item)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'weight' })
    )
  })

  it('should reject item with zero quantity', () => {
    const item = { ...mockItem, quantity: 0 }
    const errors = validationService.validateItem(item)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'quantity' })
    )
  })

  it('should reject item with no photos', () => {
    const item = { ...mockItem, photos: [] }
    const errors = validationService.validateItem(item)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'photos' })
    )
  })

  it('should reject item with more than 6 photos', () => {
    const item = {
      ...mockItem,
      photos: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'],
    }
    const errors = validationService.validateItem(item)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'photos' })
    )
  })

  it('should validate photo count correctly', () => {
    expect(validationService.validatePhotoCount(0)).toBe(false)
    expect(validationService.validatePhotoCount(1)).toBe(true)
    expect(validationService.validatePhotoCount(6)).toBe(true)
    expect(validationService.validatePhotoCount(7)).toBe(false)
  })

  it('should reject empty item list', () => {
    const errors = validationService.validateItemList([])
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('items')
  })

  it('should accept non-empty item list', () => {
    const errors = validationService.validateItemList([mockItem])
    expect(errors).toHaveLength(0)
  })
})

// ============================================================================
// Address Validation Tests
// ============================================================================

describe('ValidationService - Address Validation', () => {
  it('should validate a valid address', () => {
    const errors = validationService.validateAddress(mockAddress)
    expect(errors).toHaveLength(0)
  })

  it('should reject address with missing recipient name', () => {
    const address = { ...mockAddress, recipientName: '' }
    const errors = validationService.validateAddress(address)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'recipientName' })
    )
  })

  it('should reject address with invalid phone number', () => {
    const address = { ...mockAddress, phoneNumber: 'invalid' }
    const errors = validationService.validateAddress(address)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'phoneNumber' })
    )
  })

  it('should reject address with missing region', () => {
    const address = { ...mockAddress, region: '' }
    const errors = validationService.validateAddress(address)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'region' })
    )
  })

  it('should reject address with missing detailed address', () => {
    const address = { ...mockAddress, detailedAddress: '' }
    const errors = validationService.validateAddress(address)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'detailedAddress' })
    )
  })

  it('should validate address in service area', () => {
    const result = validationService.validateAddressInServiceArea(mockAddress)
    expect(result).toBe(true)
  })
})

// ============================================================================
// Time Slot Validation Tests
// ============================================================================

describe('ValidationService - Time Slot Validation', () => {
  it('should validate an available time slot', () => {
    const errors = validationService.validateTimeSlot(mockTimeSlot)
    expect(errors).toHaveLength(0)
  })

  it('should reject unavailable time slot', () => {
    const slot = { ...mockTimeSlot, isAvailable: false }
    const errors = validationService.validateTimeSlot(slot)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'timeSlot' })
    )
  })

  it('should reject fully booked time slot', () => {
    const slot = { ...mockTimeSlot, booked: 10, capacity: 10 }
    const errors = validationService.validateTimeSlot(slot)
    expect(errors).toContainEqual(
      expect.objectContaining({ field: 'timeSlot' })
    )
  })

  it('should validate time slot in future', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const slot = {
      ...mockTimeSlot,
      date: futureDate.toISOString().split('T')[0],
    }
    const result = validationService.validateTimeSlotInFuture(slot)
    expect(result).toBe(true)
  })

  it('should validate time slot within week', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 3)
    const slot = {
      ...mockTimeSlot,
      date: futureDate.toISOString().split('T')[0],
    }
    const result = validationService.validateTimeSlotWithinWeek(slot)
    expect(result).toBe(true)
  })
})

// ============================================================================
// Field Validation Tests
// ============================================================================

describe('ValidationService - Field Validation', () => {
  it('should validate required fields', () => {
    const errors = validationService.validateField('categoryId', '')
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('categoryId')
  })

  it('should validate numeric fields', () => {
    const errors = validationService.validateField('weight', 0)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('weight')
  })

  it('should validate phone number', () => {
    const errors = validationService.validateField('phoneNumber', 'invalid')
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('phoneNumber')
  })

  it('should validate photo array', () => {
    const errors = validationService.validateField('photos', [])
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('photos')
  })

  it('should validate terms agreement', () => {
    const errors = validationService.validateField('agreedToTerms', false)
    expect(errors).toHaveLength(1)
    expect(errors[0].field).toBe('agreedToTerms')
  })
})

// ============================================================================
// Error Grouping Tests
// ============================================================================

describe('ValidationService - Error Grouping', () => {
  it('should group errors by field', () => {
    const errors = [
      { field: 'categoryId', message: 'Required' },
      { field: 'weight', message: 'Invalid' },
      { field: 'categoryId', message: 'Invalid format' },
    ]
    const grouped = validationService.groupErrorsByField(errors)
    expect(grouped.categoryId).toHaveLength(2)
    expect(grouped.weight).toHaveLength(1)
  })

  it('should get field error', () => {
    const errors = [
      { field: 'categoryId', message: 'Required' },
      { field: 'weight', message: 'Invalid' },
    ]
    const error = validationService.getFieldError(errors, 'categoryId')
    expect(error).toBe('Required')
  })

  it('should return undefined for non-existent field error', () => {
    const errors = [{ field: 'categoryId', message: 'Required' }]
    const error = validationService.getFieldError(errors, 'weight')
    expect(error).toBeUndefined()
  })

  it('should get all error messages', () => {
    const errors = [
      { field: 'categoryId', message: 'Required' },
      { field: 'weight', message: 'Invalid' },
    ]
    const messages = validationService.getErrorMessages(errors)
    expect(messages).toEqual(['Required', 'Invalid'])
  })

  it('should check if has errors', () => {
    expect(validationService.hasErrors([])).toBe(false)
    expect(validationService.hasErrors([{ field: 'test', message: 'error' }])).toBe(true)
  })
})
