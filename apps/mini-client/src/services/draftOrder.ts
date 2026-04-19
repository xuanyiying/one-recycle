/**
 * Draft Order Service
 * Handles persistence and retrieval of draft orders from local storage
 */

import Taro from '@tarojs/taro'
import { DraftOrder, Item } from '@/types'
import { logger } from '@/utils/logger'

// ============================================================================
// Constants
// ============================================================================

const DRAFT_ORDER_STORAGE_KEY = 'order_creation_draft'
const LAST_SUCCESSFUL_ORDER_KEY = 'last_successful_order_time'
const DRAFT_ORDER_EXPIRY_HOURS = 24
const MIN_DRAFT_AGE_MS = 5000 // 草稿必须存在至少5秒才被认为是有效的（防止刚创建的草稿被误认为是旧草稿）

// ============================================================================
// Draft Order Service
// ============================================================================

/**
 * Generates a unique draft order ID
 */
const generateDraftId = (): string => {
  return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Checks if a draft order has expired
 */
const isDraftExpired = (draft: DraftOrder): boolean => {
  const expiryTime = new Date(draft.expiresAt).getTime()
  const currentTime = new Date().getTime()
  return currentTime > expiryTime
}

/**
 * Saves a draft order to local storage
 */
export const saveDraftOrder = (
  items: Item[],
  selectedAddressId?: string | number,
  selectedTimeSlotId?: string,
  notes?: string
): DraftOrder => {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + DRAFT_ORDER_EXPIRY_HOURS * 60 * 60 * 1000)

  const draft: DraftOrder = {
    id: generateDraftId(),
    items,
    selectedAddressId,
    selectedTimeSlotId,
    notes,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  try {
    // Taro storage handles object serialization automatically, but for consistency with previous JSON stringify
    // we can let Taro handle it (Taro.setStorageSync supports objects)
    // However, the original code used JSON.stringify.
    // Taro.setStorageSync('key', object) is better.
    Taro.setStorageSync(DRAFT_ORDER_STORAGE_KEY, draft)
    return draft
  } catch (error) {
    logger.error('Failed to save draft order:', error)
    throw new Error('Failed to save draft order to local storage')
  }
}

/**
 * Updates an existing draft order
 */
export const updateDraftOrder = (
  draftId: string,
  updates: Partial<Omit<DraftOrder, 'id' | 'createdAt'>>
): DraftOrder | null => {
  const draft = getDraftOrder()

  if (!draft || draft.id !== draftId) {
    return null
  }

  const updatedDraft: DraftOrder = {
    ...draft,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  try {
    Taro.setStorageSync(DRAFT_ORDER_STORAGE_KEY, updatedDraft)
    return updatedDraft
  } catch (error) {
    logger.error('Failed to update draft order:', error)
    throw new Error('Failed to update draft order in local storage')
  }
}

/**
 * Retrieves the current draft order from local storage
 */
export const getDraftOrder = (): DraftOrder | null => {
  try {
    const draft = Taro.getStorageSync(DRAFT_ORDER_STORAGE_KEY)

    if (!draft || typeof draft !== 'object') {
      return null
    }

    // Check if draft has expired
    if (isDraftExpired(draft)) {
      deleteDraftOrder()
      return null
    }

    return draft
  } catch (error) {
    logger.error('Failed to retrieve draft order:', error)
    return null
  }
}

/**
 * Deletes the current draft order from local storage
 */
export const deleteDraftOrder = (): void => {
  try {
    Taro.removeStorageSync(DRAFT_ORDER_STORAGE_KEY)
  } catch (error) {
    logger.error('Failed to delete draft order:', error)
  }
}

/**
 * Checks if a valid draft order exists
 */
export const hasDraftOrder = (): boolean => {
  const draft = getDraftOrder()
  return draft !== null
}

/**
 * Gets the time remaining for a draft order (in milliseconds)
 */
export const getDraftOrderTimeRemaining = (): number | null => {
  const draft = getDraftOrder()

  if (!draft) {
    return null
  }

  const expiryTime = new Date(draft.expiresAt).getTime()
  const currentTime = new Date().getTime()
  const timeRemaining = expiryTime - currentTime

  return timeRemaining > 0 ? timeRemaining : 0
}

/**
 * Gets the time remaining for a draft order (formatted as string)
 */
export const getDraftOrderTimeRemainingFormatted = (): string | null => {
  const timeRemaining = getDraftOrderTimeRemaining()

  if (timeRemaining === null) {
    return null
  }

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

/**
 * Restores form state from draft order
 */
export const restoreFormStateFromDraft = (
  draft: DraftOrder
): {
  items: Item[]
  selectedAddressId?: string | number
  selectedTimeSlotId?: string
  notes?: string
} => {
  return {
    items: draft.items,
    selectedAddressId: draft.selectedAddressId,
    selectedTimeSlotId: draft.selectedTimeSlotId,
    notes: draft.notes,
  }
}

/**
 * Clears all draft data (used after successful order submission)
 */
export const clearAllDraftData = (): void => {
  try {
    deleteDraftOrder()
    // 记录最后一次成功提交订单的时间
    Taro.setStorageSync(LAST_SUCCESSFUL_ORDER_KEY, Date.now())
  } catch (error) {
    logger.error('Failed to clear draft data:', error)
  }
}

/**
 * 记录订单成功提交的时间
 * 用于判断草稿是否应该显示恢复弹窗
 */
export const recordSuccessfulOrder = (): void => {
  try {
    Taro.setStorageSync(LAST_SUCCESSFUL_ORDER_KEY, Date.now())
  } catch (error) {
    logger.error('Failed to record successful order:', error)
  }
}

/**
 * 获取最后一次成功提交订单的时间
 */
export const getLastSuccessfulOrderTime = (): number | null => {
  try {
    const time = Taro.getStorageSync(LAST_SUCCESSFUL_ORDER_KEY)
    return time || null
  } catch (error) {
    logger.error('Failed to get last successful order time:', error)
    return null
  }
}

/**
 * 检查草稿是否应该显示恢复弹窗
 * 规则：
 * 1. 草稿必须有效（未过期、有物品）
 * 2. 草稿的创建时间必须在最后一次成功提交订单之前，或者没有成功提交记录
 * 3. 草稿必须存在至少 MIN_DRAFT_AGE_MS 毫秒（防止刚创建的草稿被误认为是旧草稿）
 * 
 * @param draft 草稿订单
 * @returns 是否应该显示恢复弹窗
 */
export const shouldShowDraftRecovery = (draft: DraftOrder): boolean => {
  // 首先检查草稿是否有效
  if (!isValidDraftOrder(draft)) {
    return false
  }

  // 检查草稿年龄（必须存在至少5秒）
  const draftAge = Date.now() - new Date(draft.createdAt).getTime()
  if (draftAge < MIN_DRAFT_AGE_MS) {
    logger.log('[Draft] Draft is too new, skipping recovery prompt')
    return false
  }

  // 获取最后一次成功提交订单的时间
  const lastSuccessfulOrderTime = getLastSuccessfulOrderTime()

  // 如果没有成功提交记录，显示恢复弹窗
  if (!lastSuccessfulOrderTime) {
    return true
  }

  // 获取草稿的最后更新时间
  const draftLastUpdateTime = new Date(draft.updatedAt).getTime()

  // 如果草稿的最后更新时间在成功提交之后，说明是新草稿，显示恢复弹窗
  // 如果草稿的最后更新时间在成功提交之前，说明是旧草稿，不显示恢复弹窗
  const shouldShow = draftLastUpdateTime > lastSuccessfulOrderTime

  if (!shouldShow) {
    logger.log('[Draft] Draft is older than last successful order, cleaning up...')
    // 清理旧草稿
    deleteDraftOrder()
  }

  return shouldShow
}

// ============================================================================
// Auto-save Utilities
// ============================================================================

/**
 * Creates an auto-save function with debouncing
 */
export const createAutoSaveDraft = (debounceMs: number = 1000) => {
  let timeoutId: NodeJS.Timeout | null = null

  return (
    items: Item[],
    selectedAddressId?: string | number,
    selectedTimeSlotId?: string,
    notes?: string
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      try {
        saveDraftOrder(items, selectedAddressId, selectedTimeSlotId, notes)
      } catch (error) {
        logger.error('Auto-save failed:', error)
      }
    }, debounceMs)
  }
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates a draft order is complete enough to restore
 */
export const isValidDraftOrder = (draft: DraftOrder): boolean => {
  // Must have at least one item
  if (!draft.items || draft.items.length === 0) {
    return false
  }

  // Must not be expired
  if (isDraftExpired(draft)) {
    return false
  }

  return true
}

/**
 * Gets the completion percentage of a draft order
 */
export const getDraftOrderCompletionPercentage = (draft: DraftOrder): number => {
  let completedSteps = 0

  // Step 1: Items
  if (draft.items && draft.items.length > 0) {
    completedSteps++
  }

  // Step 2: Address
  if (draft.selectedAddressId) {
    completedSteps++
  }

  // Step 3: Time slot
  if (draft.selectedTimeSlotId) {
    completedSteps++
  }

  // Step 4: Confirmation (not tracked in draft)

  return (completedSteps / 3) * 100
}
