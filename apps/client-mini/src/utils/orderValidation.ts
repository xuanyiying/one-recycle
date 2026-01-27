/**
 * Order Creation Flow Validation Utilities
 * Provides validation functions for items, addresses, time slots, and orders
 */

import { Item, ItemCondition, Address, TimeSlot, Order, ValidationError } from '../types/order'
import { validatePhone } from './validation'

// ============================================================================
// Item Validation
// ============================================================================

/**
 * Validates an item has all required fields
 */
export const validateItem = (item: Item): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!item.categoryId || item.categoryId.trim() === '') {
    errors.push({ field: 'categoryId', message: 'Category is required' })
  }

  if (!item.categoryName || item.categoryName.trim() === '') {
    errors.push({ field: 'categoryName', message: 'Category name is required' })
  }

  if (!item.condition || !Object.values(ItemCondition).includes(item.condition)) {
    errors.push({ field: 'condition', message: 'Valid condition is required' })
  }

  if (item.weight <= 0) {
    errors.push({ field: 'weight', message: 'Weight must be greater than 0' })
  }

  if (item.quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' })
  }

  if (!item.photos || item.photos.length === 0) {
    errors.push({ field: 'photos', message: 'At least one photo is required' })
  }

  if (item.photos && item.photos.length > 6) {
    errors.push({ field: 'photos', message: 'Maximum 6 photos allowed' })
  }

  return errors
}

/**
 * Validates photo count for an item
 */
export const validatePhotoCount = (photoCount: number): boolean => {
  return photoCount > 0 && photoCount <= 6
}

/**
 * Validates item list is not empty
 */
export const validateItemList = (items: Item[]): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!items || items.length === 0) {
    errors.push({ field: 'items', message: 'At least one item is required' })
  }

  return errors
}

// ============================================================================
// Address Validation
// ============================================================================

/**
 * Validates an address has all required fields
 */
export const validateAddress = (address: Address): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!address.recipientName || address.recipientName.trim() === '') {
    errors.push({ field: 'recipientName', message: 'Recipient name is required' })
  }

  if (!validatePhone(address.phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Valid phone number is required' })
  }

  if (!address.province || address.province.trim() === '') {
    errors.push({ field: 'province', message: 'Province is required' })
  }

  if (!address.city || address.city.trim() === '') {
    errors.push({ field: 'city', message: 'City is required' })
  }

  if (!address.district || address.district.trim() === '') {
    errors.push({ field: 'district', message: 'District is required' })
  }

  if (!address.detailedAddress || address.detailedAddress.trim() === '') {
    errors.push({ field: 'detailedAddress', message: 'Detailed address is required' })
  }

  if (address.postalCode && !/^\d{6}$/.test(address.postalCode)) {
    errors.push({ field: 'postalCode', message: 'Valid 6-digit postal code is required' })
  }

  return errors
}

/**
 * Validates address is within service area
 * This is a placeholder - actual implementation would check against service area boundary
 */
export const validateAddressInServiceArea = (
  address: Address,
  serviceAreaBoundary?: any
): boolean => {
  // If no boundary provided, assume valid
  if (!serviceAreaBoundary) {
    return true
  }

  // If coordinates not available, assume valid
  if (!address.coordinates) {
    return true
  }

  // Placeholder: actual implementation would check if coordinates are within boundary
  // For now, return true
  return true
}

// ============================================================================
// Time Slot Validation
// ============================================================================

/**
 * Validates a time slot is available
 */
export const validateTimeSlot = (slot: TimeSlot): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!slot.isAvailable) {
    errors.push({ field: 'timeSlot', message: 'Selected time slot is not available' })
  }

  if (slot.booked >= slot.capacity) {
    errors.push({ field: 'timeSlot', message: 'Time slot is fully booked' })
  }

  return errors
}

/**
 * Validates time slot is in the future
 */
export const validateTimeSlotInFuture = (slot: TimeSlot): boolean => {
  const slotDateTime = new Date(`${slot.date}T${slot.startTime}`)
  const now = new Date()
  return slotDateTime > now
}

/**
 * Validates time slot is within next 7 days
 */
export const validateTimeSlotWithinWeek = (slot: TimeSlot): boolean => {
  const slotDate = new Date(slot.date)
  const today = new Date()
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  return slotDate >= today && slotDate <= sevenDaysFromNow
}

// ============================================================================
// Order Validation
// ============================================================================

/**
 * Validates complete order before submission
 */
export const validateOrder = (order: Order): ValidationError[] => {
  const errors: ValidationError[] = []

  // Validate items
  const itemErrors = validateItemList(order.items)
  errors.push(...itemErrors)

  // Validate each item
  order.items.forEach((item, index) => {
    const itemErrors = validateItem(item)
    itemErrors.forEach((error) => {
      errors.push({
        field: `items[${index}].${error.field}`,
        message: error.message,
      })
    })
  })

  // Validate address
  const addressErrors = validateAddress(order.address)
  errors.push(...addressErrors)

  // Validate time slot
  const slotErrors = validateTimeSlot(order.timeSlot)
  errors.push(...slotErrors)

  // Validate terms agreement
  if (!order.agreedToTerms) {
    errors.push({ field: 'agreedToTerms', message: 'You must agree to the terms' })
  }

  return errors
}

/**
 * Validates order submission is allowed
 */
export const validateOrderSubmission = (order: Order): boolean => {
  const errors = validateOrder(order)
  return errors.length === 0
}

// ============================================================================
// Form State Validation
// ============================================================================

/**
 * Validates form can proceed to next step
 */
export const validateFormStep = (
  step: number,
  items: Item[],
  selectedAddressId?: string,
  selectedTimeSlotId?: string
): ValidationError[] => {
  const errors: ValidationError[] = []

  switch (step) {
    case 1:
      // Item selection step
      errors.push(...validateItemList(items))
      items.forEach((item, index) => {
        const itemErrors = validateItem(item)
        itemErrors.forEach((error) => {
          errors.push({
            field: `items[${index}].${error.field}`,
            message: error.message,
          })
        })
      })
      break

    case 2:
      // Address selection step
      if (!selectedAddressId) {
        errors.push({ field: 'address', message: 'Please select an address' })
      }
      break

    case 3:
      // Time slot selection step
      if (!selectedTimeSlotId) {
        errors.push({ field: 'timeSlot', message: 'Please select a time slot' })
      }
      break

    case 4:
      // Confirmation step - all validations already done
      break
  }

  return errors
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if there are any validation errors
 */
export const hasValidationErrors = (errors: ValidationError[]): boolean => {
  return errors.length > 0
}

/**
 * Gets error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  const error = errors.find((e) => e.field === field)
  return error?.message
}

/**
 * Groups validation errors by field
 */
export const groupErrorsByField = (
  errors: ValidationError[]
): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {}

  errors.forEach((error) => {
    if (!grouped[error.field]) {
      grouped[error.field] = []
    }
    grouped[error.field].push(error.message)
  })

  return grouped
}
