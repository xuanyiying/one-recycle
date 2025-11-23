/**
 * Order Creation Flow Types
 * Defines all types for the multi-step order creation process
 */

// ============================================================================
// Enums
// ============================================================================

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ItemCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum AddressLabel {
  HOME = 'home',
  WORK = 'work',
  SCHOOL = 'school',
  OTHER = 'other',
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
  brandModel: string
  condition: ItemCondition
  weight: number
  quantity: number
  photos: string[]
  notes?: string
  estimatedPrice: PriceRange
  createdAt: string
}

export interface ItemFormData {
  categoryId: string
  categoryName: string
  brandModel: string
  condition: ItemCondition
  weight: number
  quantity: number
  photos: string[]
  notes?: string
}

// ============================================================================
// Address Types
// ============================================================================

export interface Address {
  id: string
  recipientName: string
  phoneNumber: string
  region: string
  detailedAddress: string
  label: AddressLabel
  isDefault: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
  createdAt: string
  updatedAt: string
}

export interface AddressFormData {
  recipientName: string
  phoneNumber: string
  region: string
  detailedAddress: string
  label: AddressLabel
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
  agreedToTerms: boolean
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface OrderSubmission {
  items: Item[]
  address: Address
  timeSlot: TimeSlot
  notes?: string
  agreedToTerms: boolean
}

export interface OrderConfirmation {
  orderNumber: string
  order: Order
  createdAt: string
}

// ============================================================================
// Draft Order Types (Local Storage)
// ============================================================================

export interface DraftOrder {
  id: string
  items: Item[]
  selectedAddressId?: string
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
  currentStep: 1 | 2 | 3 | 4
  items: Item[]
  selectedAddressId?: string
  selectedTimeSlotId?: string
  notes?: string
  agreedToTerms: boolean
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
  addressId: string
  timeSlotId: string
  notes?: string
  agreedToTerms: boolean
}

export interface CreateOrderResponse {
  success: boolean
  orderNumber?: string
  order?: Order
  error?: string
}

export interface PriceEstimationRequest {
  items: Item[]
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
