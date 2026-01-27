/**
 * OrderCreationFlow Container Component
 * Orchestrates the multi-step order creation process with draft persistence
 * 
 * Features:
 * - Multi-step form navigation (4 steps + success page)
 * - Auto-save draft orders to local storage
 * - Draft recovery on app launch
 * - Form state restoration on back navigation
 * - Draft cleanup after successful submission
 * 
 * Requirements: 1.1, 2.1, 3.1, 5.1, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Item, Address, TimeSlot, OrderSubmission, DraftOrder } from '../../types/order'
import { useOrderStore } from '../../store/orderStore'
import {
    getDraftOrder,
    deleteDraftOrder,
    restoreFormStateFromDraft,
    createAutoSaveDraft,
    isValidDraftOrder,
    getDraftOrderCompletionPercentage,
} from '../../services/draftOrder'
import { submitOrder, validateOrderForSubmission } from '../../services/order'
import ItemForm from './ItemForm'
import AddressSelection from './AddressSelection'
import TimeSlotSelection from './TimeSlotSelection'
import OrderConfirmation from './OrderConfirmation'
import OrderSuccess from './OrderSuccess'
import DraftRecoveryModal from './DraftRecoveryModal'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

type OrderStep = 1 | 2 | 3 | 4 | 'success'

interface OrderFlowState {
    currentStep: OrderStep
    items: Item[]
    selectedAddressId?: string | number
    selectedTimeSlotId?: string
    notes?: string
    agreedToTerms: boolean
    isLoading: boolean
    error?: string
}

interface DraftRecoveryState {
    showModal: boolean
    draft: DraftOrder | null
    completionPercentage: number
}

interface OrderCreationFlowProps {
    initialCategory?: string
}

// ============================================================================
// Component
// ============================================================================

export default function OrderCreationFlow({ initialCategory }: OrderCreationFlowProps) {
    // Store
    const {
        state: storeState,
        setDraftOrder,
        clearDraftOrder,
        updateFormState,
    } = useOrderStore()

    // Local state
    const [flowState, setFlowState] = useState<OrderFlowState>({
        currentStep: 1,
        items: [],
        agreedToTerms: false,
        isLoading: false,
    })

    const [draftRecovery, setDraftRecovery] = useState<DraftRecoveryState>({
        showModal: false,
        draft: null,
        completionPercentage: 0,
    })

    const [orderNumber, setOrderNumber] = useState<string>()

    // Auto-save function (debounced)
    const autoSaveDraftRef = useRef(createAutoSaveDraft(1000))

    // ============================================================================
    // Initialization & Draft Recovery
    // ============================================================================

    /**
     * Check for existing draft on component mount
     */
    useEffect(() => {
        const checkForDraft = async () => {
            const existingDraft = getDraftOrder()

            if (existingDraft && isValidDraftOrder(existingDraft)) {
                // Show recovery modal
                const completionPercentage = getDraftOrderCompletionPercentage(existingDraft)
                setDraftRecovery({
                    showModal: true,
                    draft: existingDraft,
                    completionPercentage,
                })
            }
        }

        checkForDraft()
    }, [])

    // ============================================================================
    // Draft Recovery Handlers
    // ============================================================================

    /**
     * Restore draft order and resume from where user left off
     */
    const handleRestoreDraft = useCallback(async () => {
        const draft = draftRecovery.draft
        if (!draft) return

        try {
            // Restore form state from draft
            const restoredState = restoreFormStateFromDraft(draft)

            // Determine which step to resume from
            let resumeStep: OrderStep = 1
            if (restoredState.selectedTimeSlotId) {
                resumeStep = 4 // All steps completed, go to confirmation
            } else if (restoredState.selectedAddressId) {
                resumeStep = 3 // Address selected, go to time slot
            } else if (restoredState.items.length > 0) {
                resumeStep = 2 // Items added, go to address
            }

            // Update flow state
            setFlowState((prev) => ({
                ...prev,
                currentStep: resumeStep,
                items: restoredState.items,
                selectedAddressId: restoredState.selectedAddressId,
                selectedTimeSlotId: restoredState.selectedTimeSlotId,
                notes: restoredState.notes,
            }))

            // Update store
            setDraftOrder(draft)
            updateFormState({
                currentStep: resumeStep,
                items: restoredState.items,
            })

            // Close modal
            setDraftRecovery({
                showModal: false,
                draft: null,
                completionPercentage: 0,
            })

            Taro.showToast({
                title: '草稿已恢复',
                icon: 'success',
            })
        } catch (error) {
            console.error('Failed to restore draft:', error)
            Taro.showToast({
                title: '恢复草稿失败',
                icon: 'none',
            })
        }
    }, [draftRecovery.draft, setDraftOrder, updateFormState])

    /**
     * Discard draft and start fresh
     */
    const handleDiscardDraft = useCallback(() => {
        try {
            deleteDraftOrder()
            clearDraftOrder()

            setFlowState({
                currentStep: 1,
                items: [],
                agreedToTerms: false,
                isLoading: false,
            })

            setDraftRecovery({
                showModal: false,
                draft: null,
                completionPercentage: 0,
            })

            Taro.showToast({
                title: '已开始新订单',
                icon: 'success',
            })
        } catch (error) {
            console.error('Failed to discard draft:', error)
        }
    }, [clearDraftOrder])

    // ============================================================================
    // Auto-save Draft
    // ============================================================================

    /**
     * Auto-save draft whenever form state changes
     */
    useEffect(() => {
        if (typeof flowState.currentStep === 'number' && flowState.currentStep >= 1 && flowState.items.length > 0) {
            autoSaveDraftRef.current(
                flowState.items,
                flowState.selectedAddressId,
                flowState.selectedTimeSlotId,
                flowState.notes
            )
        }
    }, [flowState.items, flowState.selectedAddressId, flowState.selectedTimeSlotId, flowState.notes, flowState.currentStep])

    // ============================================================================
    // Step Navigation Handlers
    // ============================================================================

    /**
     * Handle moving to next step (Step 1: Items)
     */
    const handleItemsNext = useCallback((items: Item[]) => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 2,
            items,
        }))

        updateFormState({
            currentStep: 2,
        })

        // Auto-save
        autoSaveDraftRef.current(items, undefined, undefined, undefined)
    }, [updateFormState])

    /**
     * Handle moving to next step (Step 2: Address)
     */
    const handleAddressNext = useCallback((address: Address) => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 3,
            selectedAddressId: address.id,
        }))

        updateFormState({
            currentStep: 3,
        })

        // Auto-save
        autoSaveDraftRef.current(
            flowState.items,
            address.id,
            flowState.selectedTimeSlotId,
            flowState.notes
        )
    }, [flowState.items, flowState.selectedTimeSlotId, flowState.notes, updateFormState])

    /**
     * Handle moving to next step (Step 3: Time Slot)
     */
    const handleTimeSlotNext = useCallback((timeSlot: TimeSlot) => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 4,
            selectedTimeSlotId: timeSlot.id,
        }))

        updateFormState({
            currentStep: 4,
        })

        // Auto-save
        autoSaveDraftRef.current(
            flowState.items,
            flowState.selectedAddressId,
            timeSlot.id,
            flowState.notes
        )
    }, [flowState.items, flowState.selectedAddressId, flowState.notes, updateFormState])

    /**
     * Handle order submission (Step 4: Confirmation)
     * 
     * Validates order data and submits to API with retry logic
     * Requirement 5.4: WHEN order submission succeeds THEN the system SHALL generate a unique order number and display a success page
     * Requirement 5.5: WHEN order submission fails THEN the system SHALL display a specific error message and allow the user to retry or modify details
     */
    const handleOrderSubmit = useCallback(
        async (orderSubmission: OrderSubmission) => {
            setFlowState((prev) => ({
                ...prev,
                isLoading: true,
                error: undefined,
            }))

            try {
                // Validate order data before submission
                const validationErrors = validateOrderForSubmission(orderSubmission)
                if (validationErrors.length > 0) {
                    throw new Error(validationErrors[0])
                }

                // Submit order to API with retry logic
                const response = await submitOrder(orderSubmission, {
                    maxRetries: 3,
                    initialDelay: 1000,
                    maxDelay: 10000,
                    backoffMultiplier: 2,
                })

                // Verify response contains order number
                if (!response.orderNumber) {
                    throw new Error('服务器未返回订单号')
                }

                // Set order number for success page
                setOrderNumber(response.orderNumber)

                // Clear draft after successful submission
                deleteDraftOrder()
                clearDraftOrder()

                // Move to success page
                setFlowState((prev) => ({
                    ...prev,
                    currentStep: 'success',
                    isLoading: false,
                }))

                Taro.showToast({
                    title: '订单提交成功',
                    icon: 'success',
                })
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '提交订单失败，请重试'
                setFlowState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }))

                throw error
            }
        },
        [clearDraftOrder]
    )

    // ============================================================================
    // Back Navigation Handlers
    // ============================================================================



    /**
     * Handle back to items from address
     */
    const handleBackToItems = useCallback(() => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 1,
        }))
    }, [])

    /**
     * Handle back to address from time slot
     */
    const handleBackToAddress = useCallback(() => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 2,
        }))
    }, [])

    /**
     * Handle back to time slot from confirmation
     */
    const handleBackToTimeSlot = useCallback(() => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 3,
        }))
    }, [])

    // ============================================================================
    // Edit Handlers (from confirmation page)
    // ============================================================================

    const handleEditItems = useCallback(() => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 1,
        }))
    }, [])

    const handleEditAddress = useCallback(() => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 2,
        }))
    }, [])

    const handleEditTimeSlot = useCallback(() => {
        setFlowState((prev) => ({
            ...prev,
            currentStep: 3,
        }))
    }, [])

    // ============================================================================
    // Success Page Handler
    // ============================================================================

    const handleSuccessComplete = useCallback(() => {
        // Reset flow to start
        setFlowState({
            currentStep: 1,
            items: [],
            agreedToTerms: false,
            isLoading: false,
        })

        // Navigate to home or orders page
        Taro.switchTab({
            url: '/pages/index/index',
        })
    }, [])

    // ============================================================================
    // Render
    // ============================================================================

    // Get selected address and time slot from store
    const selectedAddress = storeState.addresses.find(
        (addr) => addr.id === flowState.selectedAddressId
    )
    const selectedTimeSlot = storeState.availableTimeSlots.find(
        (slot) => slot.id === flowState.selectedTimeSlotId
    )

    return (
        <View className='order-creation-flow'>
            {/* Draft Recovery Modal */}
            {draftRecovery.showModal && draftRecovery.draft && (
                <DraftRecoveryModal
                    draft={draftRecovery.draft}
                    completionPercentage={draftRecovery.completionPercentage}
                    onRestore={handleRestoreDraft}
                    onDiscard={handleDiscardDraft}
                />
            )}

            {/* Step 1: Item Form */}
            {flowState.currentStep === 1 && (
                <ItemForm
                    onNext={handleItemsNext}
                    initialItems={flowState.items}
                    initialCategory={initialCategory}
                />
            )}

            {/* Step 2: Address Selection */}
            {flowState.currentStep === 2 && (
                <AddressSelection
                    onNext={handleAddressNext}
                    onBack={handleBackToItems}
                    initialAddress={selectedAddress}
                />
            )}

            {/* Step 3: Time Slot Selection */}
            {flowState.currentStep === 3 && (
                <TimeSlotSelection
                    onNext={handleTimeSlotNext}
                    onBack={handleBackToAddress}
                    initialSlot={selectedTimeSlot}
                />
            )}

            {/* Step 4: Order Confirmation */}
            {flowState.currentStep === 4 && selectedAddress && selectedTimeSlot && (
                <OrderConfirmation
                    items={flowState.items}
                    address={selectedAddress}
                    timeSlot={selectedTimeSlot}
                    onSubmit={handleOrderSubmit}
                    onBack={handleBackToTimeSlot}
                    onEditItems={handleEditItems}
                    onEditAddress={handleEditAddress}
                    onEditTimeSlot={handleEditTimeSlot}
                />
            )}

            {/* Success Page */}
            {flowState.currentStep === 'success' && orderNumber && (
                <OrderSuccess
                    orderNumber={orderNumber}
                    onComplete={handleSuccessComplete}
                />
            )}
        </View>
    )
}
