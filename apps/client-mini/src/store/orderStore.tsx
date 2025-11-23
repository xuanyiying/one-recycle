/**
 * Order Creation Flow Store
 * Manages global state for addresses, time slots, and service area
 */

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import { Address, TimeSlot, DraftOrder, OrderFormState } from '../types/order'

// ============================================================================
// State Types
// ============================================================================

interface OrderStoreState {
    // User addresses
    addresses: Address[]
    selectedAddressId?: string

    // Time slots
    availableTimeSlots: TimeSlot[]
    selectedTimeSlotId?: string

    // Service area
    serviceAreaBoundary?: any

    // Draft order
    draftOrder?: DraftOrder

    // Form state
    formState: OrderFormState

    // Loading states
    isLoadingAddresses: boolean
    isLoadingTimeSlots: boolean
    isSubmittingOrder: boolean

    // Errors
    error?: string
}

// ============================================================================
// Action Types
// ============================================================================

type OrderStoreAction =
    | { type: 'SET_ADDRESSES'; payload: Address[] }
    | { type: 'SELECT_ADDRESS'; payload: string }
    | { type: 'ADD_ADDRESS'; payload: Address }
    | { type: 'UPDATE_ADDRESS'; payload: Address }
    | { type: 'DELETE_ADDRESS'; payload: string }
    | { type: 'SET_TIME_SLOTS'; payload: TimeSlot[] }
    | { type: 'SELECT_TIME_SLOT'; payload: string }
    | { type: 'SET_SERVICE_AREA'; payload: any }
    | { type: 'SET_DRAFT_ORDER'; payload: DraftOrder }
    | { type: 'CLEAR_DRAFT_ORDER' }
    | { type: 'SET_FORM_STATE'; payload: Partial<OrderFormState> }
    | { type: 'SET_LOADING_ADDRESSES'; payload: boolean }
    | { type: 'SET_LOADING_TIME_SLOTS'; payload: boolean }
    | { type: 'SET_SUBMITTING_ORDER'; payload: boolean }
    | { type: 'SET_ERROR'; payload?: string }
    | { type: 'RESET_STORE' }

// ============================================================================
// Initial State
// ============================================================================

const initialFormState: OrderFormState = {
    currentStep: 1,
    items: [],
    agreedToTerms: false,
    isLoading: false,
}

const initialState: OrderStoreState = {
    addresses: [],
    availableTimeSlots: [],
    formState: initialFormState,
    isLoadingAddresses: false,
    isLoadingTimeSlots: false,
    isSubmittingOrder: false,
}

// ============================================================================
// Reducer
// ============================================================================

const orderStoreReducer = (state: OrderStoreState, action: OrderStoreAction): OrderStoreState => {
    switch (action.type) {
        case 'SET_ADDRESSES':
            return { ...state, addresses: action.payload }

        case 'SELECT_ADDRESS':
            return { ...state, selectedAddressId: action.payload }

        case 'ADD_ADDRESS':
            return {
                ...state,
                addresses: [...state.addresses, action.payload],
            }

        case 'UPDATE_ADDRESS':
            return {
                ...state,
                addresses: state.addresses.map((addr) =>
                    addr.id === action.payload.id ? action.payload : addr
                ),
            }

        case 'DELETE_ADDRESS':
            return {
                ...state,
                addresses: state.addresses.filter((addr) => addr.id !== action.payload),
                selectedAddressId:
                    state.selectedAddressId === action.payload ? undefined : state.selectedAddressId,
            }

        case 'SET_TIME_SLOTS':
            return { ...state, availableTimeSlots: action.payload }

        case 'SELECT_TIME_SLOT':
            return { ...state, selectedTimeSlotId: action.payload }

        case 'SET_SERVICE_AREA':
            return { ...state, serviceAreaBoundary: action.payload }

        case 'SET_DRAFT_ORDER':
            return { ...state, draftOrder: action.payload }

        case 'CLEAR_DRAFT_ORDER':
            return { ...state, draftOrder: undefined }

        case 'SET_FORM_STATE':
            return {
                ...state,
                formState: { ...state.formState, ...action.payload },
            }

        case 'SET_LOADING_ADDRESSES':
            return { ...state, isLoadingAddresses: action.payload }

        case 'SET_LOADING_TIME_SLOTS':
            return { ...state, isLoadingTimeSlots: action.payload }

        case 'SET_SUBMITTING_ORDER':
            return { ...state, isSubmittingOrder: action.payload }

        case 'SET_ERROR':
            return { ...state, error: action.payload }

        case 'RESET_STORE':
            return initialState

        default:
            return state
    }
}

// ============================================================================
// Context
// ============================================================================

interface OrderStoreContextType {
    state: OrderStoreState
    dispatch: React.Dispatch<OrderStoreAction>
    // Helper methods
    setAddresses: (addresses: Address[]) => void
    selectAddress: (addressId: string) => void
    addAddress: (address: Address) => void
    updateAddress: (address: Address) => void
    deleteAddress: (addressId: string) => void
    setTimeSlots: (slots: TimeSlot[]) => void
    selectTimeSlot: (slotId: string) => void
    setServiceArea: (boundary: any) => void
    setDraftOrder: (draft: DraftOrder) => void
    clearDraftOrder: () => void
    updateFormState: (state: Partial<OrderFormState>) => void
    setLoadingAddresses: (loading: boolean) => void
    setLoadingTimeSlots: (loading: boolean) => void
    setSubmittingOrder: (submitting: boolean) => void
    setError: (error?: string) => void
    resetStore: () => void
}

export const OrderStoreContext = createContext<OrderStoreContextType | undefined>(undefined)

// ============================================================================
// Provider Component
// ============================================================================

interface OrderStoreProviderProps {
    children: ReactNode
}

export const OrderStoreProvider = ({ children }: OrderStoreProviderProps) => {
    const [state, dispatch] = useReducer(orderStoreReducer, initialState)

    // Helper methods
    const setAddresses = useCallback((addresses: Address[]) => {
        dispatch({ type: 'SET_ADDRESSES', payload: addresses })
    }, [])

    const selectAddress = useCallback((addressId: string) => {
        dispatch({ type: 'SELECT_ADDRESS', payload: addressId })
    }, [])

    const addAddress = useCallback((address: Address) => {
        dispatch({ type: 'ADD_ADDRESS', payload: address })
    }, [])

    const updateAddress = useCallback((address: Address) => {
        dispatch({ type: 'UPDATE_ADDRESS', payload: address })
    }, [])

    const deleteAddress = useCallback((addressId: string) => {
        dispatch({ type: 'DELETE_ADDRESS', payload: addressId })
    }, [])

    const setTimeSlots = useCallback((slots: TimeSlot[]) => {
        dispatch({ type: 'SET_TIME_SLOTS', payload: slots })
    }, [])

    const selectTimeSlot = useCallback((slotId: string) => {
        dispatch({ type: 'SELECT_TIME_SLOT', payload: slotId })
    }, [])

    const setServiceArea = useCallback((boundary: any) => {
        dispatch({ type: 'SET_SERVICE_AREA', payload: boundary })
    }, [])

    const setDraftOrder = useCallback((draft: DraftOrder) => {
        dispatch({ type: 'SET_DRAFT_ORDER', payload: draft })
    }, [])

    const clearDraftOrder = useCallback(() => {
        dispatch({ type: 'CLEAR_DRAFT_ORDER' })
    }, [])

    const updateFormState = useCallback((formState: Partial<OrderFormState>) => {
        dispatch({ type: 'SET_FORM_STATE', payload: formState })
    }, [])

    const setLoadingAddresses = useCallback((loading: boolean) => {
        dispatch({ type: 'SET_LOADING_ADDRESSES', payload: loading })
    }, [])

    const setLoadingTimeSlots = useCallback((loading: boolean) => {
        dispatch({ type: 'SET_LOADING_TIME_SLOTS', payload: loading })
    }, [])

    const setSubmittingOrder = useCallback((submitting: boolean) => {
        dispatch({ type: 'SET_SUBMITTING_ORDER', payload: submitting })
    }, [])

    const setError = useCallback((error?: string) => {
        dispatch({ type: 'SET_ERROR', payload: error })
    }, [])

    const resetStore = useCallback(() => {
        dispatch({ type: 'RESET_STORE' })
    }, [])

    const value: OrderStoreContextType = {
        state,
        dispatch,
        setAddresses,
        selectAddress,
        addAddress,
        updateAddress,
        deleteAddress,
        setTimeSlots,
        selectTimeSlot,
        setServiceArea,
        setDraftOrder,
        clearDraftOrder,
        updateFormState,
        setLoadingAddresses,
        setLoadingTimeSlots,
        setSubmittingOrder,
        setError,
        resetStore,
    }

    return (
        <OrderStoreContext.Provider value={value}>
            {children}
        </OrderStoreContext.Provider>
    )
}

// ============================================================================
// Custom Hook
// ============================================================================

export const useOrderStore = (): OrderStoreContextType => {
    const context = useContext(OrderStoreContext)
    if (!context) {
        throw new Error('useOrderStore must be used within an OrderStoreProvider')
    }
    return context
}

// ============================================================================
// Selector Hooks (for convenience)
// ============================================================================

export const useOrderAddresses = () => {
    const { state } = useOrderStore()
    return state.addresses
}

export const useSelectedAddress = () => {
    const { state } = useOrderStore()
    return state.addresses.find((addr) => addr.id === state.selectedAddressId)
}

export const useOrderTimeSlots = () => {
    const { state } = useOrderStore()
    return state.availableTimeSlots
}

export const useSelectedTimeSlot = () => {
    const { state } = useOrderStore()
    return state.availableTimeSlots.find((slot) => slot.id === state.selectedTimeSlotId)
}

export const useOrderFormState = () => {
    const { state } = useOrderStore()
    return state.formState
}

export const useDraftOrder = () => {
    const { state } = useOrderStore()
    return state.draftOrder
}

export const useOrderStoreLoading = () => {
    const { state } = useOrderStore()
    return {
        isLoadingAddresses: state.isLoadingAddresses,
        isLoadingTimeSlots: state.isLoadingTimeSlots,
        isSubmittingOrder: state.isSubmittingOrder,
    }
}

export const useOrderStoreError = () => {
    const { state } = useOrderStore()
    return state.error
}
