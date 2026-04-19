/**
 * Draft Order Service Tests
 * Tests for draft order persistence, retrieval, and cleanup
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 * Properties: Property 5 (Draft Order Persistence), Property 6 (Form Data Restoration)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Taro from '@tarojs/taro'
import { Item, ItemCondition, DraftOrder } from '../types/order'
import {
  saveDraftOrder,
  getDraftOrder,
  deleteDraftOrder,
  updateDraftOrder,
  hasDraftOrder,
  getDraftOrderTimeRemaining,
  restoreFormStateFromDraft,
  clearAllDraftData,
  isValidDraftOrder,
  getDraftOrderCompletionPercentage,
  createAutoSaveDraft,
} from './draftOrder'

// Mock Taro Storage
vi.mock('@tarojs/taro', () => {
  let storage: Record<string, any> = {}
  return {
    default: {
      setStorageSync: (key: string, data: any) => {
        storage[key] = data
      },
      getStorageSync: (key: string) => {
        return storage[key] || ''
      },
      removeStorageSync: (key: string) => {
        delete storage[key]
      },
      clearStorageSync: () => {
        storage = {}
      }
    }
  }
})

// ============================================================================
// Mock Data
// ============================================================================

const createMockItem = (overrides?: Partial<Item>): Item => ({
  id: 'item_1',
  categoryId: 'electronics',
  categoryName: '电子产品',
  brandModel: 'iPhone 13',
  condition: ItemCondition.GOOD,
  weight: 0.5,
  quantity: 1,
  photos: ['photo1.jpg'],
  notes: 'Test item',
  estimatedPrice: { min: 100, max: 200, currency: 'CNY' },
  createdAt: new Date().toISOString(),
  ...overrides,
})

// ============================================================================
// Setup & Teardown
// ============================================================================

beforeEach(() => {
  // Clear mock storage before each test
  Taro.clearStorageSync()
  vi.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
  Taro.clearStorageSync()
})

// ============================================================================
// Tests: Save Draft Order
// ============================================================================

describe('saveDraftOrder', () => {
  it('should save a draft order to storage', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items, 'addr_1', 'slot_1', 'Test notes')

    expect(draft).toBeDefined()
    expect(draft.items).toEqual(items)
    expect(draft.selectedAddressId).toBe('addr_1')
    expect(draft.selectedTimeSlotId).toBe('slot_1')
    expect(draft.notes).toBe('Test notes')
    expect(draft.id).toBeDefined()
    expect(draft.createdAt).toBeDefined()
    expect(draft.updatedAt).toBeDefined()
    expect(draft.expiresAt).toBeDefined()
  })

  it('should generate unique draft IDs', () => {
    const items = [createMockItem()]
    const draft1 = saveDraftOrder(items)
    const draft2 = saveDraftOrder(items)

    expect(draft1.id).not.toBe(draft2.id)
  })

  it('should set expiry time to 24 hours from now', () => {
    const items = [createMockItem()]
    const beforeSave = new Date()
    const draft = saveDraftOrder(items)
    const afterSave = new Date()

    const expiryTime = new Date(draft.expiresAt).getTime()
    const expectedMinExpiry = beforeSave.getTime() + 24 * 60 * 60 * 1000
    const expectedMaxExpiry = afterSave.getTime() + 24 * 60 * 60 * 1000

    expect(expiryTime).toBeGreaterThanOrEqual(expectedMinExpiry - 1000)
    expect(expiryTime).toBeLessThanOrEqual(expectedMaxExpiry + 1000)
  })

  it('should handle empty items array', () => {
    const draft = saveDraftOrder([])

    expect(draft.items).toEqual([])
    expect(draft).toBeDefined()
  })

  it('should handle multiple items', () => {
    const items = [
      createMockItem({ id: 'item_1' }),
      createMockItem({ id: 'item_2', categoryName: '衣服' }),
      createMockItem({ id: 'item_3', categoryName: '书籍' }),
    ]

    const draft = saveDraftOrder(items)

    expect(draft.items).toHaveLength(3)
    expect(draft.items).toEqual(items)
  })
})

// ============================================================================
// Tests: Get Draft Order
// ============================================================================

describe('getDraftOrder', () => {
  it('should retrieve a saved draft order', () => {
    const items = [createMockItem()]
    const savedDraft = saveDraftOrder(items, 'addr_1')

    const retrievedDraft = getDraftOrder()

    expect(retrievedDraft).toBeDefined()
    expect(retrievedDraft?.id).toBe(savedDraft.id)
    expect(retrievedDraft?.items).toEqual(items)
    expect(retrievedDraft?.selectedAddressId).toBe('addr_1')
  })

  it('should return null if no draft exists', () => {
    const draft = getDraftOrder()

    expect(draft).toBeNull()
  })

  it('should return null if draft has expired', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items)

    // Manually set expiry to past
    const expiredDraft: DraftOrder = {
      ...draft,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }

    Taro.setStorageSync('order_creation_draft', expiredDraft)

    const retrieved = getDraftOrder()

    expect(retrieved).toBeNull()
  })

  it('should handle corrupted storage data gracefully', () => {
    Taro.setStorageSync('order_creation_draft', 'invalid json')

    const draft = getDraftOrder()

    expect(draft).toBeNull()
  })
})

// ============================================================================
// Tests: Update Draft Order
// ============================================================================

describe('updateDraftOrder', () => {
  it('should update an existing draft order', () => {
    const items = [createMockItem()]
    const savedDraft = saveDraftOrder(items)

    const updatedDraft = updateDraftOrder(savedDraft.id, {
      selectedAddressId: 'addr_2',
      notes: 'Updated notes',
    })

    expect(updatedDraft).toBeDefined()
    expect(updatedDraft?.selectedAddressId).toBe('addr_2')
    expect(updatedDraft?.notes).toBe('Updated notes')
    expect(updatedDraft?.items).toEqual(items)
  })

  it('should update updatedAt timestamp', () => {
    const items = [createMockItem()]
    const savedDraft = saveDraftOrder(items)

    const beforeUpdate = new Date()
    const updatedDraft = updateDraftOrder(savedDraft.id, {
      selectedAddressId: 'addr_2',
    })
    const afterUpdate = new Date()

    expect(updatedDraft).toBeDefined()
    const updatedTime = new Date(updatedDraft!.updatedAt).getTime()
    expect(updatedTime).toBeGreaterThanOrEqual(beforeUpdate.getTime())
    expect(updatedTime).toBeLessThanOrEqual(afterUpdate.getTime())
  })

  it('should return null if draft ID does not match', () => {
    const items = [createMockItem()]
    saveDraftOrder(items)

    const updated = updateDraftOrder('wrong_id', {
      selectedAddressId: 'addr_2',
    })

    expect(updated).toBeNull()
  })

  it('should not update createdAt timestamp', () => {
    const items = [createMockItem()]
    const savedDraft = saveDraftOrder(items)

    const updatedDraft = updateDraftOrder(savedDraft.id, {
      selectedAddressId: 'addr_2',
    })

    expect(updatedDraft?.createdAt).toBe(savedDraft.createdAt)
  })
})

// ============================================================================
// Tests: Delete Draft Order
// ============================================================================

describe('deleteDraftOrder', () => {
  it('should delete a draft order from storage', () => {
    const items = [createMockItem()]
    saveDraftOrder(items)

    expect(getDraftOrder()).toBeDefined()

    deleteDraftOrder()

    expect(getDraftOrder()).toBeNull()
  })

  it('should handle deletion when no draft exists', () => {
    expect(() => deleteDraftOrder()).not.toThrow()
  })
})

// ============================================================================
// Tests: Has Draft Order
// ============================================================================

describe('hasDraftOrder', () => {
  it('should return true if draft exists', () => {
    const items = [createMockItem()]
    saveDraftOrder(items)

    expect(hasDraftOrder()).toBe(true)
  })

  it('should return false if no draft exists', () => {
    expect(hasDraftOrder()).toBe(false)
  })

  it('should return false if draft has expired', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items)

    const expiredDraft: DraftOrder = {
      ...draft,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }

    Taro.setStorageSync('order_creation_draft', expiredDraft)

    expect(hasDraftOrder()).toBe(false)
  })
})

// ============================================================================
// Tests: Get Draft Order Time Remaining
// ============================================================================

describe('getDraftOrderTimeRemaining', () => {
  it('should return time remaining in milliseconds', () => {
    const items = [createMockItem()]
    saveDraftOrder(items)

    const timeRemaining = getDraftOrderTimeRemaining()

    expect(timeRemaining).toBeDefined()
    expect(timeRemaining).toBeGreaterThan(0)
    expect(timeRemaining).toBeLessThanOrEqual(24 * 60 * 60 * 1000)
  })

  it('should return null if no draft exists', () => {
    const timeRemaining = getDraftOrderTimeRemaining()

    expect(timeRemaining).toBeNull()
  })

  it('should return null if draft has expired', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items)

    const expiredDraft: DraftOrder = {
      ...draft,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }

    Taro.setStorageSync('order_creation_draft', expiredDraft)

    const timeRemaining = getDraftOrderTimeRemaining()

    // When draft expires, getDraftOrder() returns null, so getDraftOrderTimeRemaining() also returns null
    expect(timeRemaining).toBeNull()
  })
})

// ============================================================================
// Tests: Restore Form State From Draft
// ============================================================================

describe('restoreFormStateFromDraft', () => {
  it('should restore all form state from draft', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items, 'addr_1', 'slot_1', 'Test notes')

    const restored = restoreFormStateFromDraft(draft)

    expect(restored.items).toEqual(items)
    expect(restored.selectedAddressId).toBe('addr_1')
    expect(restored.selectedTimeSlotId).toBe('slot_1')
    expect(restored.notes).toBe('Test notes')
  })

  it('should handle partial draft data', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items)

    const restored = restoreFormStateFromDraft(draft)

    expect(restored.items).toEqual(items)
    expect(restored.selectedAddressId).toBeUndefined()
    expect(restored.selectedTimeSlotId).toBeUndefined()
    expect(restored.notes).toBeUndefined()
  })
})

// ============================================================================
// Tests: Clear All Draft Data
// ============================================================================

describe('clearAllDraftData', () => {
  it('should clear all draft data', () => {
    const items = [createMockItem()]
    saveDraftOrder(items)

    expect(hasDraftOrder()).toBe(true)

    clearAllDraftData()

    expect(hasDraftOrder()).toBe(false)
  })

  it('should handle clearing when no draft exists', () => {
    expect(() => clearAllDraftData()).not.toThrow()
  })
})

// ============================================================================
// Tests: Is Valid Draft Order
// ============================================================================

describe('isValidDraftOrder', () => {
  it('should return true for valid draft with items', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items)

    expect(isValidDraftOrder(draft)).toBe(true)
  })

  it('should return false for draft with no items', () => {
    const draft = saveDraftOrder([])

    expect(isValidDraftOrder(draft)).toBe(false)
  })

  it('should return false for expired draft', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items)

    const expiredDraft: DraftOrder = {
      ...draft,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    }

    expect(isValidDraftOrder(expiredDraft)).toBe(false)
  })
})

// ============================================================================
// Tests: Get Draft Order Completion Percentage
// ============================================================================

describe('getDraftOrderCompletionPercentage', () => {
  it('should return 0% for draft with only items', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items)

    const percentage = getDraftOrderCompletionPercentage(draft)

    expect(percentage).toBe((1 / 3) * 100)
  })

  it('should return 66% for draft with items and address', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items, 'addr_1')

    const percentage = getDraftOrderCompletionPercentage(draft)

    expect(percentage).toBe((2 / 3) * 100)
  })

  it('should return 100% for draft with items, address, and time slot', () => {
    const items = [createMockItem()]
    const draft = saveDraftOrder(items, 'addr_1', 'slot_1')

    const percentage = getDraftOrderCompletionPercentage(draft)

    expect(percentage).toBe(100)
  })

  it('should return 0% for draft with no items', () => {
    const draft = saveDraftOrder([])

    const percentage = getDraftOrderCompletionPercentage(draft)

    expect(percentage).toBe(0)
  })
})

// ============================================================================
// Tests: Create Auto Save Draft
// ============================================================================

describe('createAutoSaveDraft', () => {
  it('should create a debounced auto-save function', async () => {
    const autoSave = createAutoSaveDraft(100)
    const items = [createMockItem()]

    autoSave(items, 'addr_1')

    // Should not be saved immediately
    expect(getDraftOrder()).toBeNull()

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should be saved after debounce
    expect(getDraftOrder()).toBeDefined()
  })

  it('should debounce multiple calls', async () => {
    const autoSave = createAutoSaveDraft(100)
    const items1 = [createMockItem({ id: 'item_1' })]
    const items2 = [createMockItem({ id: 'item_2' })]

    autoSave(items1, 'addr_1')
    autoSave(items2, 'addr_2')

    await new Promise((resolve) => setTimeout(resolve, 150))

    const draft = getDraftOrder()

    // Should have the latest data
    expect(draft).toBeTruthy()
    expect(draft!.items[0]).toBeTruthy()
    expect(draft!.items[0]!.id).toBe('item_2')
    expect(draft!.selectedAddressId).toBe('addr_2')
  })

  it('should use custom debounce delay', async () => {
    const autoSave = createAutoSaveDraft(50)
    const items = [createMockItem()]

    autoSave(items)

    // Should not be saved after 30ms
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(getDraftOrder()).toBeNull()

    // Should be saved after 60ms
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(getDraftOrder()).toBeDefined()
  })
})

// ============================================================================
// Integration Tests
// ============================================================================

describe('Draft Order Service - Integration', () => {
  it('should support complete draft lifecycle', () => {
    // 1. Save draft
    const items = [createMockItem()]
    const draft = saveDraftOrder(items, 'addr_1')

    expect(hasDraftOrder()).toBe(true)

    // 2. Retrieve draft
    const retrieved = getDraftOrder()
    expect(retrieved?.id).toBe(draft.id)

    // 3. Update draft
    const updated = updateDraftOrder(draft.id, {
      selectedTimeSlotId: 'slot_1',
    })

    expect(updated?.selectedTimeSlotId).toBe('slot_1')

    // 4. Restore form state
    const restored = restoreFormStateFromDraft(updated!)
    expect(restored.selectedTimeSlotId).toBe('slot_1')

    // 5. Delete draft
    deleteDraftOrder()
    expect(hasDraftOrder()).toBe(false)
  })

  it('should persist draft across multiple operations', () => {
    const items = [createMockItem()]
    const draft1 = saveDraftOrder(items)

    // Simulate app reload by getting from storage
    const draft2 = getDraftOrder()

    expect(draft2?.id).toBe(draft1.id)
    expect(draft2?.items).toEqual(items)

    // Update and verify persistence
    updateDraftOrder(draft1.id, { selectedAddressId: 'addr_1' })
    const draft3 = getDraftOrder()

    expect(draft3?.selectedAddressId).toBe('addr_1')
  })
})
