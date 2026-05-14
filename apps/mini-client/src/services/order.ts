import type { ApiResponse } from '@/types'
import { logger } from '@/utils/logger'
import { CreateOrderResponse, Item, OrderPricing, OrderSubmission } from '../types/order'
import errorHandler, { RetryOptions, retryWithBackoff } from '../utils/errorHandler'
import { get, patch, post, put } from '../utils/request'

interface OrderListResponse {
  success: boolean
  data: {
    orders: RawOrder[]
    total: number
  }
  message?: string
}

interface RawOrder {
  id?: string | number
  orderId?: string | number
  orderNo?: string
  status?: string
  orderStatus?: string
  totalAmount?: number
  totalPrice?: number
  amount?: number
  createdAt?: string
  createTime?: string
  items?: RawOrderItem[]
  itemList?: RawOrderItem[]
  address?: unknown
  addressInfo?: unknown
  categoryName?: string
  category?: string
  estimatedPrice?: number
  estimatedAmount?: number
  estimatedTotal?: number
  pricing?: OrderPricing
  serviceFee?: number
  notes?: string
  [key: string]: unknown
}

interface RawOrderItem {
  id?: string | number
  name?: string
  brandModel?: string
  categoryName?: string
  weight?: number
  quantity?: number
  condition?: string
  estimatedPrice?: number
  photos?: string[]
  [key: string]: unknown
}

export interface NormalizedOrder {
  id: string
  orderNo: string
  status: string
  totalAmount: number
  createdAt: string
  items: RawOrderItem[]
  categoryName: string
  estimatedPrice: number
  serviceFee: number
  notes?: string
}

export interface OrderAddress {
  name: string
  phone: string
  detail: string
  province?: string
  city?: string
  district?: string
  [key: string]: unknown
}

export interface OrderCourier {
  id?: string | number
  name: string
  phone: string
  avatar?: string
  [key: string]: unknown
}

export interface NormalizedOrderDetail {
  id: string
  status: string
  statusText: string
  timeline: { status: string; text: string; time: string; completed: boolean }[]
  categoryName: string
  items: RawOrderItem[]
  address: OrderAddress
  appointmentTime: string
  estimatedPrice: number
  serviceFee: number
  totalPrice: number
  settlementAmount?: number
  settlementTime?: string
  courier?: OrderCourier
  createTime: string
}

const STATUS_MAP: Record<string, string> = {
  PENDING: '待处理',
  PENDING_PICKUP: '待取件',
  PICKED_UP: '已取件',
  IN_TRANSIT: '运输中',
  PENDING_RECEIPT: '待收货',
  INSPECTING: '检验中',
  INSPECTED: '已检验',
  INSPECTION_EXCEPTION: '检验异常',
  MANUAL_PROCESSING: '人工处理中',
  PENDING_INBOUND: '待入库',
  INBOUNDED: '已入库',
  PENDING_SETTLEMENT: '待结算',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
}

const LEGACY_STATUS_MAP: Record<string, string> = {
  pending: 'PENDING',
  pending_pickup: 'PENDING_PICKUP',
  picked_up: 'PICKED_UP',
  in_transit: 'IN_TRANSIT',
  pending_receipt: 'PENDING_RECEIPT',
  inspecting: 'INSPECTING',
  inspected: 'INSPECTED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

function normalizeStatus(raw: string | undefined): string {
  if (!raw) return 'PENDING'
  const upper = raw.toUpperCase()
  if (upper in STATUS_MAP) return upper
  const legacy = LEGACY_STATUS_MAP[raw.toLowerCase()]
  if (legacy) return legacy
  return raw
}

function toNumber(val: unknown): number | null {
  if (val == null) return null
  const n = Number(val)
  return Number.isNaN(n) ? null : n
}

export function normalizeOrder(raw: RawOrder): NormalizedOrder {
  const status = normalizeStatus(raw.status || raw.orderStatus)
  const rawItems = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.itemList) ? raw.itemList : []
  const estimatedPrice =
    toNumber(raw.estimatedPrice) ??
    toNumber(raw.estimatedAmount) ??
    toNumber(raw.estimatedTotal) ??
    toNumber(raw.pricing?.itemsTotal?.max) ??
    0
  const totalAmount =
    toNumber(raw.totalAmount) ??
    toNumber(raw.totalPrice) ??
    toNumber(raw.amount) ??
    toNumber(raw.pricing?.totalEstimate?.max) ??
    estimatedPrice
  return {
    id: String(raw.id ?? raw.orderId ?? raw.orderNo ?? ''),
    orderNo: String(raw.orderNo ?? raw.id ?? ''),
    status,
    totalAmount,
    createdAt: raw.createdAt || raw.createTime || '',
    items: rawItems,
    categoryName: raw.categoryName || raw.category || '',
    estimatedPrice,
    serviceFee: raw.serviceFee ?? 0,
    notes: raw.notes,
  }
}

export function normalizeOrderDetail(raw: any): NormalizedOrderDetail {
  const status = normalizeStatus(raw.status || raw.orderStatus)
  const rawItems = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.itemList) ? raw.itemList : []
  const timeline = Array.isArray(raw.timeline) ? raw.timeline : Array.isArray(raw.tracks) ? raw.tracks : []
  const address = typeof raw.address === 'string'
    ? { name: '', phone: '', detail: raw.address }
    : (raw.address || raw.addressInfo || { name: '', phone: '', detail: '' })
  const estimatedFromItems = rawItems.reduce((sum: number, item: any) => {
    return sum + (toNumber(item.estimatedPrice) ?? 0)
  }, 0)
  const estimatedPrice =
    toNumber(raw.estimatedPrice) ??
    toNumber(raw.estimatedAmount) ??
    toNumber(raw.estimatedTotal) ??
    toNumber(raw.pricing?.itemsTotal?.max) ??
    toNumber(raw.pricing?.totalEstimate?.max) ??
    estimatedFromItems ??
    0
  const totalCandidate =
    toNumber(raw.totalPrice) ??
    toNumber(raw.totalAmount) ??
    toNumber(raw.amount) ??
    toNumber(raw.pricing?.totalEstimate?.max) ??
    null
  const totalPrice =
    totalCandidate && totalCandidate > 0
      ? totalCandidate
      : estimatedFromItems && estimatedFromItems > 0
        ? estimatedFromItems
        : estimatedPrice
  const settlementAmount =
    toNumber(raw.settlementAmount) ??
    toNumber(raw.actualPrice) ??
    toNumber(raw.actualAmount) ??
    undefined
  return {
    id: String(raw.id ?? raw.orderId ?? raw.orderNo ?? ''),
    status,
    statusText: raw.statusText || STATUS_MAP[status] || status,
    timeline,
    categoryName: raw.categoryName || raw.category || '',
    items: rawItems,
    address,
    appointmentTime: raw.appointmentTime || raw.timeSlot?.startTime || '',
    estimatedPrice,
    serviceFee: raw.serviceFee ?? 0,
    totalPrice,
    settlementAmount,
    settlementTime: raw.settlementTime ?? raw.settlementAt ?? undefined,
    courier: raw.courier || raw.courierInfo || undefined,
    createTime: raw.createTime || raw.createdAt || '',
  }
}

export const getUserOrders = async (userId: string | number) => {
  const response = await get<OrderListResponse>(`/orders/user/${userId}`)
  if (!response.success) {
    throw new Error(response.message || '获取订单列表失败')
  }
  return response
}

export const getOrderDetail = async (orderId: string | number) => {
  try {
    return await get<ApiResponse<any>>(`/orders/${orderId}`)
  } catch (error) {
    logger.error('获取订单详情失败:', error)
    throw error
  }
}

export const cancelOrder = (orderId: string | number) => {
  return patch<ApiResponse>(`/orders/${orderId}/cancel`)
}

export const updateOrderStatus = (orderId: string | number, status: string) => {
  return put<ApiResponse>(`/orders/${orderId}/status`, { status })
}

interface ExpressOrderPayload {
  categoryId: string | number
  addressId: string | number
  timeSlotId: string
  items: Item[]
  notes?: string
  [key: string]: unknown
}

export const createExpressOrder = (orderData: ExpressOrderPayload) => {
  return post<ApiResponse>('/dispatch/express/orders', { ...orderData })
}

export const getUserStatistics = (userId: string | number) => {
  return get<ApiResponse>(`/orders/user/${userId}/statistics`)
}

export const confirmOrder = (orderId: string | number) => {
  return put<ApiResponse>(`/orders/${orderId}/confirm`)
}

export const submitOrder = async (
  orderData: OrderSubmission,
  retryOptions?: RetryOptions
): Promise<CreateOrderResponse> => {
  const defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      logger.log(`[Order Submission] Retry attempt ${attempt} after error:`, error.code)
    },
  }

  const finalRetryOptions = { ...defaultRetryOptions, ...retryOptions }

  try {
    const response = await retryWithBackoff(
      async () => submitOrderRequest(orderData),
      finalRetryOptions
    )
    return response
  } catch (error) {
    const appError = errorHandler.handle(error, {
      showToast: true,
      logError: true,
    })
    throw appError
  }
}

async function submitOrderRequest(orderSubmission: OrderSubmission): Promise<CreateOrderResponse> {
  try {
    const payload = {
      items: orderSubmission.items.map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        brandModel: item.brandModel,
        condition: item.condition,
        weight: item.weight,
        quantity: item.quantity,
        photos: item.photoStorageIds && item.photoStorageIds.length > 0 ? item.photoStorageIds : item.photos,
        notes: item.notes,
        estimatedPrice: item.estimatedPrice,
      })),
      addressId: orderSubmission.address.id,
      timeSlotId: orderSubmission.timeSlot.id,
      userId: orderSubmission.userId,
      notes: orderSubmission.notes,
    }

    const response = await post<ApiResponse<{ orderNo: string;[key: string]: unknown }>>('/orders', payload)

    if (!response || !response.success || !response.data) {
      throw new Error('Invalid response format from server')
    }
    const orderData = response.data
    return {
      success: true,
      orderNo: orderData.orderNo,
      order: orderData as any,
    }
  } catch (error) {
    throw error
  }
}

export const createOrder = (orderData: OrderSubmission | Record<string, unknown>) => {
  return post<ApiResponse>('/orders', orderData)
}

export const validateOrderForSubmission = (orderData: OrderSubmission): string[] => {
  const errors: string[] = []

  if (!orderData.items || orderData.items.length === 0) {
    errors.push('订单中没有物品')
  }

  if (!orderData.address || !orderData.address.id) {
    errors.push('请选择取货地址')
  }

  if (!orderData.timeSlot || !orderData.timeSlot.id) {
    errors.push('请选择取货时间')
  }

  return errors
}

export const isOrderSubmissionRetryable = (error: any): boolean => {
  if (error.code) {
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
