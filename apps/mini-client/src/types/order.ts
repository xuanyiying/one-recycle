import type { Address, AddressFormData } from './address'
import { AddressLabel } from './address'

export { AddressLabel }
export type { Address, AddressFormData }

/**
 * Order Creation Flow Types
 * Defines all types for the multi-step order creation process
 */

// ============================================================================
// Enums
// ============================================================================

export enum OrderStatus {
  PENDING = 'PENDING',
  PENDING_PICKUP = 'PENDING_PICKUP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  PENDING_RECEIPT = 'PENDING_RECEIPT',
  INSPECTING = 'INSPECTING',
  INSPECTED = 'INSPECTED',
  INSPECTION_EXCEPTION = 'INSPECTION_EXCEPTION',
  MANUAL_PROCESSING = 'MANUAL_PROCESSING',
  PENDING_INBOUND = 'PENDING_INBOUND',
  INBOUNDED = 'INBOUNDED',
  PENDING_SETTLEMENT = 'PENDING_SETTLEMENT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum ItemCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
}

// ============================================================================
// Price Types
// ============================================================================

export interface PriceRange {
  min: number
  max: number
  currency: 'CNY'
}

export interface PriceEstimation {
  itemId: string
  categoryId: string
  condition: ItemCondition
  weight: number
  quantity: number
  estimatedPrice: PriceRange
}

export interface OrderPricing {
  itemsTotal: PriceRange
  serviceFee: number
  totalEstimate: PriceRange
  breakdown: PriceBreakdown[]
}

export interface PriceBreakdown {
  itemId: string
  itemName: string
  quantity: number
  weight: number
  unitPrice: number
  subtotal: PriceRange
}

// ============================================================================
// Item Types
// ============================================================================

export interface Item {
  id: string
  categoryId: string
  categoryName: string
  categorySlug?: string
  categoryBasePrice?: number
  brandModel: string
  condition: ItemCondition
  weight: number
  quantity: number
  photos: string[]
  photoStorageIds?: string[]
  notes?: string
  estimatedPrice: PriceRange
  createdAt: string
}

export interface ItemFormData {
  categoryId: string
  categoryName: string
  categorySlug?: string
  brandModel: string
  condition: ItemCondition
  weight: number
  quantity: number
  photos: string[]
  notes?: string
}

// ============================================================================
// Time Slot Types
// ============================================================================

export interface TimeSlot {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  capacity: number
  booked: number
  isAvailable: boolean
}

export interface TimeSlotReservation {
  slotId: string
  reservedAt: string
  expiresAt: string // 15 minutes from reservedAt
}

// ============================================================================
// Order Types
// ============================================================================

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  items: Item[]
  address: Address
  timeSlot: TimeSlot
  pricing: OrderPricing
  notes?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface OrderDetail {
  id: string
  status: OrderStatus | string
  statusText: string
  timeline: OrderTimelineItem[]
  categoryName: string
  items: any[]
  address: any
  appointmentTime: string
  estimatedPrice: number
  serviceFee: number
  totalPrice: number
  settlementAmount?: number
  settlementTime?: string
  courier?: any
  createTime: string
}

export interface OrderTimelineItem {
  status: string
  text: string
  time: string
  completed: boolean
}

export interface OrderSubmission {
  items: Item[]
  address: Address
  timeSlot: TimeSlot
  userId?: string | number
  notes?: string
}

export interface OrderConfirmation {
  orderNo: string
  order: Order
  createdAt: string
}

// ============================================================================
// Draft Order Types (Local Storage)
// ============================================================================

export interface DraftOrder {
  id: string
  items: Item[]
  selectedAddressId?: string | number
  selectedTimeSlotId?: string
  notes?: string
  createdAt: string
  updatedAt: string
  expiresAt: string // 24 hours from creation
}

// ============================================================================
// Form State Types
// ============================================================================

export interface OrderFormState {
  currentStep: 1 | 2 | 3 | 'success'
  items: Item[]
  selectedAddressId?: string | number
  selectedTimeSlotId?: string
  notes?: string
  isLoading: boolean
  error?: string
}

export interface ValidationError {
  field: string
  message: string
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateOrderRequest {
  items: Item[]
  addressId: string | number
  timeSlotId: string
  userId?: string | number
  notes?: string
}

export interface CreateOrderResponse {
  success: boolean
  orderNo?: string
  order?: Order
  error?: string
}

export interface PriceEstimationRequest {
  items: Item[]
  orderType?: 'RECYCLE' | 'SALE'
}

export interface PriceEstimationResponse {
  success: boolean
  pricing?: OrderPricing
  error?: string
}

export interface TimeSlotAvailabilityRequest {
  date: string
  addressId: string
}

export interface TimeSlotAvailabilityResponse {
  success: boolean
  slots?: TimeSlot[]
  error?: string
}

export interface AddressValidationRequest {
  address: Address
}

export interface AddressValidationResponse {
  success: boolean
  isValid: boolean
  message?: string
}
