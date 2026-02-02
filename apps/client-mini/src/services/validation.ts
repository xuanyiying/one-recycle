/**
 * Validation Service
 * Provides comprehensive validation for order creation flow
 * Consolidates all validation rules and provides consistent error handling
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import {Address, TimeSlot, Order, ValidationError, ItemCondition, OrderItem} from '@/types/index'
import { validatePhone } from '@/utils/validation'
import { isFullAddress } from '@/utils/address'

// ============================================================================
// Validation Service Class
// ============================================================================

class ValidationService {
  /**
   * Validates an item has all required fields
   */
  validateItem(item: OrderItem): ValidationError[] {
    const errors: ValidationError[] = []

    if (!item.categoryId || String(item.categoryId).trim() === '') {
      errors.push({
        field: 'categoryId',
        message: 'Category is required',
      })
    }

    if (!item.categoryName || item.categoryName.trim() === '') {
      errors.push({
        field: 'categoryName',
        message: 'Category name is required',
      })
    }

    if (item.weight !== undefined && item.weight <= 0) {
      errors.push({
        field: 'weight',
        message: 'Weight must be greater than 0',
      })
    }

    if (item.quantity !== undefined && item.quantity <= 0) {
      errors.push({
        field: 'quantity',
        message: 'Quantity must be greater than 0',
      })
    }

    if (item.photos && item.photos.length === 0) {
      errors.push({
        field: 'photos',
        message: 'At least one photo is required',
      })
    }

    if (item.photos && item.photos.length > 6) {
      errors.push({
        field: 'photos',
        message: 'Maximum 6 photos allowed',
      })
    }

    if (item.condition && !Object.values(ItemCondition).includes(item.condition as any)) {
      errors.push({
        field: 'condition',
        message: 'Valid condition is required',
      })
    }

    return errors
  }

  /**
   * Validates photo count for an item
   */
  validatePhotoCount(photoCount: number): boolean {
    return photoCount > 0 && photoCount <= 6
  }

  /**
   * Validates item list is not empty
   */
  validateItemList(items: OrderItem[]): ValidationError[] {
    const errors: ValidationError[] = []

    if (!items || items.length === 0) {
      errors.push({
        field: 'items',
        message: 'At least one item is required',
      })
    }

    return errors
  }

  /**
   * Validates an address has all required fields
   */
  validateAddress(address: Address): ValidationError[] {
    const errors: ValidationError[] = []

    if (!address.name || address.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Recipient name is required',
      })
    }

    if (!validatePhone(address.mobile)) {
      errors.push({
        field: 'mobile',
        message: 'Valid phone number is required',
      })
    }

    if (!address.region || address.region.trim() === '') {
      errors.push({
        field: 'region',
        message: 'Region is required',
      })
    }

    if (!address.detail || address.detail.trim() === '') {
      errors.push({
        field: 'detail',
        message: 'Detailed address is required',
      })
    }

    return errors
  }

  validateOrderAddress(orderAddress: any): ValidationError[] {
    const errors: ValidationError[] = []

    if (!orderAddress.name || orderAddress.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Recipient name is required',
      })
    }

    if (!validatePhone(orderAddress.phone)) {
      errors.push({
        field: 'phone',
        message: 'Valid phone number is required',
      })
    }

    if (!orderAddress.detail || orderAddress.detail.trim() === '') {
      errors.push({
        field: 'detail',
        message: 'Detailed address is required',
      })
    }

    return errors
  }

  /**
   * Validates address is within service area
   */
  validateAddressInServiceArea(address: Address, serviceAreaBoundary?: any): boolean {
    // If no boundary provided, assume valid
    if (!serviceAreaBoundary) {
      return true
    }

    // If coordinates not available, assume valid
    if (!address.coordinates) {
      return true
    }

    // Placeholder: actual implementation would check if coordinates are within boundary
    return true
  }

  /**
   * Validates a time slot is available
   */
  validateTimeSlot(slot: TimeSlot): ValidationError[] {
    const errors: ValidationError[] = []

    if (!slot.isAvailable) {
      errors.push({
        field: 'timeSlot',
        message: 'Selected time slot is not available',
      })
    }

    if (slot.booked >= slot.capacity) {
      errors.push({
        field: 'timeSlot',
        message: 'Time slot is fully booked',
      })
    }

    return errors
  }

  /**
   * Validates time slot is in the future
   */
  validateTimeSlotInFuture(slot: TimeSlot): boolean {
    const slotDateTime = new Date(`${slot.date}T${slot.startTime}`)
    const now = new Date()
    return slotDateTime > now
  }

  /**
   * Validates time slot is within next 7 days
   */
  validateTimeSlotWithinWeek(slot: TimeSlot): boolean {
    const slotDate = new Date(slot.date)
    const today = new Date()
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    return slotDate >= today && slotDate <= sevenDaysFromNow
  }

  /**
   * Validates complete order before submission
   */
  validateOrder(order: Order): ValidationError[] {
    const errors: ValidationError[] = []

    // Validate items
    const itemErrors = this.validateItemList(order.items)
    errors.push(...itemErrors)

    // Validate each item
    order.items.forEach((item, index) => {
      const itemErrors = this.validateItem(item)
      itemErrors.forEach((error) => {
        errors.push({
          field: `items[${index}].${error.field}`,
          message: error.message,
        })
      })
    })

    // Validate address
    if (typeof order.address !== 'string') {
      // Check if it's an Address type
      if (isFullAddress(order.address)) {
        // It's an Address type
        const addressErrors = this.validateAddress(order.address);
        errors.push(...addressErrors);
      } else {
        // It's an OrderAddress type
        const orderAddressErrors = this.validateOrderAddress(order.address);
        errors.push(...orderAddressErrors);
      }
    }

    // Validate time slot
    if (order.timeSlot) {
      const slotErrors = this.validateTimeSlot(order.timeSlot)
      errors.push(...slotErrors)
    }

    return errors
  }

  /**
   * Validates order submission is allowed
   */
  validateOrderSubmission(order: Order): boolean {
    const errors = this.validateOrder(order)
    return errors.length === 0
  }

  /**
   * Validates form can proceed to next step
   */
  validateFormStep(
    step: number,
    items: OrderItem[],
    selectedAddressId?: string,
    selectedTimeSlotId?: string
  ): ValidationError[] {
    const errors: ValidationError[] = []

    switch (step) {
      case 1:
        // Item selection step
        errors.push(...this.validateItemList(items))
        items.forEach((item, index) => {
          const itemErrors = this.validateItem(item)
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
          errors.push({
            field: 'address',
            message: 'Please select an address',
          })
        }
        break

      case 3:
        // Time slot selection step
        if (!selectedTimeSlotId) {
          errors.push({
            field: 'timeSlot',
            message: 'Please select a time slot',
          })
        }
        break

      case 4:
        // Confirmation step - all validations already done
        break
    }

    return errors
  }

  /**
   * Checks if there are any validation errors
   */
  hasErrors(errors: ValidationError[]): boolean {
    return errors.length > 0
  }

  /**
   * Gets error message for a specific field
   */
  getFieldError(errors: ValidationError[], field: string): string | undefined {
    const error = errors.find((e) => e.field === field)
    return error?.message
  }

  /**
   * Groups validation errors by field
   */
  groupErrorsByField(errors: ValidationError[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {}

    errors.forEach((error) => {
      if (!grouped[error.field]) {
        grouped[error.field] = []
      }
      grouped[error.field].push(error.message)
    })

    return grouped
  }

  /**
   * Gets all error messages as a flat array
   */
  getErrorMessages(errors: ValidationError[]): string[] {
    return errors.map((error) => error.message)
  }

  /**
   * Validates a single field value
   */
  validateField(field: string, value: any): ValidationError[] {
    const errors: ValidationError[] = []

    switch (field) {
      case 'categoryId':
        if (!value || value.trim() === '') {
          errors.push({
            field: 'categoryId',
            message: 'Category is required',
          })
        }
        break

      case 'brandModel':
        if (!value || value.trim() === '') {
          errors.push({
            field: 'brandModel',
            message: 'Brand/Model is required',
          })
        }
        break

      case 'weight':
        if (value !== undefined && value <= 0) {
          errors.push({
            field: 'weight',
            message: 'Weight must be greater than 0',
          })
        }
        break

      case 'quantity':
        if (value !== undefined && value <= 0) {
          errors.push({
            field: 'quantity',
            message: 'Quantity must be greater than 0',
          })
        }
        break

      case 'photos':
        if (!value || value.length === 0) {
          errors.push({
            field: 'photos',
            message: 'At least one photo is required',
          })
        } else if (value.length > 6) {
          errors.push({
            field: 'photos',
            message: 'Maximum 6 photos allowed',
          })
        }
        break

      case 'name':
        if (!value || value.trim() === '') {
          errors.push({
            field: 'name',
            message: 'Recipient name is required',
          })
        }
        break

      case 'mobile':
      case 'phone':
        if (!validatePhone(value)) {
          errors.push({
            field: 'mobile',
            message: 'Valid phone number is required',
          })
        }
        break

      case 'region':
        if (!value || value.trim() === '') {
          errors.push({
            field: 'region',
            message: 'Region is required',
          })
        }
        break

      case 'detail':
        if (!value || value.trim() === '') {
          errors.push({
            field: 'detail',
            message: 'Detailed address is required',
          })
        }
        break

      case 'condition':
        if (value && !Object.values(ItemCondition).includes(value as any)) {
          errors.push({
            field: 'condition',
            message: 'Valid condition is required',
          })
        }
        break
    }

    return errors
  }
}

// Export singleton instance
export const validationService = new ValidationService()

// Export class for testing
export default ValidationService
