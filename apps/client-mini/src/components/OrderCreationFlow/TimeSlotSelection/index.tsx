/**
 * TimeSlotSelection Component (Step 3 of Order Creation Flow)
 * Allows users to select a pickup time slot for the next 7 days
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { useState, useCallback, useEffect } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { TimeSlot, TimeSlotReservation } from '../../../types/order'
import { useOrderStore } from '../../../store/orderStore'
import { fetchAvailableTimeSlots, fetchTimeSlotsBatch, releaseTimeSlot } from '../../../services/timeSlot'
import DatePicker from './DatePicker'
import TimeSlotGrid from './TimeSoltGrid'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface TimeSlotSelectionProps {
    onNext: (slot: TimeSlot) => void
    onBack: () => void
    initialSlot?: TimeSlot
    availableSlots?: TimeSlot[]
}

// ============================================================================
// Fallback Mock Time Slots Generator
// ============================================================================

/**
 * Generate fallback mock time slots for the next 7 days
 * Used when API is unavailable
 */
const generateFallbackTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const today = new Date()

    // Generate slots for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(today)
        date.setDate(date.getDate() + dayOffset)
        const dateStr = date.toISOString().split('T')[0]

        // Generate 2-hour time slots throughout the day
        const timeSlots = [
            { start: '08:00', end: '10:00' },
            { start: '10:00', end: '12:00' },
            { start: '12:00', end: '14:00' },
            { start: '14:00', end: '16:00' },
            { start: '16:00', end: '18:00' },
            { start: '18:00', end: '20:00' },
        ]

        timeSlots.forEach((timeRange, index) => {
            // Randomly set capacity (3-5 slots available)
            const capacity = 5
            const booked = Math.floor(Math.random() * 3) // 0-2 booked

            slots.push({
                id: `slot_${dateStr}_${index}`,
                date: dateStr,
                startTime: timeRange.start,
                endTime: timeRange.end,
                capacity,
                booked,
                isAvailable: booked < capacity,
            })
        })
    }

    return slots
}

// ============================================================================
// Reservation Management
// ============================================================================

const RESERVATION_DURATION_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Create a reservation for a time slot
 * Reservation expires after 15 minutes
 */
const createReservation = (slotId: string): TimeSlotReservation => {
    const now = new Date()
    return {
        slotId,
        reservedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + RESERVATION_DURATION_MS).toISOString(),
    }
}

/**
 * Check if a reservation is still valid
 */
const isReservationValid = (reservation: TimeSlotReservation): boolean => {
    return new Date(reservation.expiresAt) > new Date()
}

// ============================================================================
// Component
// ============================================================================

export default function TimeSlotSelection({
    onNext,
    onBack,
    initialSlot,
    availableSlots: providedSlots,
}: TimeSlotSelectionProps) {
    // State management
    const { state, setTimeSlots, selectTimeSlot } = useOrderStore()

    const [selectedDate, setSelectedDate] = useState<string>(() => {
        if (initialSlot?.date) {
            return initialSlot.date
        }
        const today = new Date()
        return today.toISOString().split('T')[0]
    })

    const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(
        initialSlot?.id || state.selectedTimeSlotId
    )

    const [timeSlots, setLocalTimeSlots] = useState<TimeSlot[]>(
        providedSlots || []
    )

    const [reservation, setReservation] = useState<TimeSlotReservation | undefined>()
    const [reservationTimeLeft, setReservationTimeLeft] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetchingSlots, setIsFetchingSlots] = useState(false)

    // ============================================================================
    // Effects
    // ============================================================================

    // Fetch time slots from API on component mount
    useEffect(() => {
        const loadTimeSlots = async () => {
            // Skip if slots are already provided
            if (providedSlots && providedSlots.length > 0) {
                setLocalTimeSlots(providedSlots)
                setTimeSlots(providedSlots)
                return
            }

            setIsFetchingSlots(true)
            try {
                const today = new Date()
                const startDate = today.toISOString().split('T')[0]

                // Get selected address ID from store
                const addressId = state.selectedAddressId
                if (!addressId) {
                    console.warn('No address selected, using fallback time slots')
                    const fallbackSlots = generateFallbackTimeSlots()
                    setLocalTimeSlots(fallbackSlots)
                    setTimeSlots(fallbackSlots)
                    return
                }

                // Fetch time slots for next 7 days
                const slots = await fetchTimeSlotsBatch(startDate, 7, addressId)
                setLocalTimeSlots(slots)
                setTimeSlots(slots)
            } catch (error) {
                console.error('Failed to fetch time slots from API:', error)
                // Fallback to mock data if API fails
                const fallbackSlots = generateFallbackTimeSlots()
                setLocalTimeSlots(fallbackSlots)
                setTimeSlots(fallbackSlots)
                Taro.showToast({
                    title: '使用本地时间段数据',
                    icon: 'none',
                })
            } finally {
                setIsFetchingSlots(false)
            }
        }

        loadTimeSlots()
    }, [providedSlots, state.selectedAddressId, setTimeSlots])

    // Initialize time slots in store
    useEffect(() => {
        setTimeSlots(timeSlots)
    }, [timeSlots, setTimeSlots])

    // Handle reservation expiry countdown
    useEffect(() => {
        if (!reservation) {
            setReservationTimeLeft(0)
            return
        }

        // Check if reservation is still valid
        if (!isReservationValid(reservation)) {
            setReservation(undefined)
            setSelectedSlotId(undefined)
            Taro.showToast({
                title: '预留时间已过期，请重新选择',
                icon: 'none',
            })
            return
        }

        // Update countdown timer
        const interval = setInterval(() => {
            const now = new Date()
            const expiresAt = new Date(reservation.expiresAt)
            const timeLeft = Math.max(0, expiresAt.getTime() - now.getTime())

            if (timeLeft <= 0) {
                setReservation(undefined)
                setSelectedSlotId(undefined)
                clearInterval(interval)
                Taro.showToast({
                    title: '预留时间已过期',
                    icon: 'none',
                })
            } else {
                setReservationTimeLeft(timeLeft)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [reservation])

    // Cleanup: Release reserved slot when component unmounts
    useEffect(() => {
        return () => {
            if (reservation && selectedSlotId) {
                releaseTimeSlot(selectedSlotId).catch(error => {
                    console.error('Failed to release time slot on unmount:', error)
                })
            }
        }
    }, [reservation, selectedSlotId])

    // ============================================================================
    // Date Selection
    // ============================================================================

    const handleDateChange = useCallback(async (date: string) => {
        setSelectedDate(date)
        setSelectedSlotId(undefined)
        setReservation(undefined)

        // Fetch slots for the selected date if not already loaded
        const addressId = state.selectedAddressId
        if (addressId && !timeSlots.some(slot => slot.date === date)) {
            setIsFetchingSlots(true)
            try {
                const slots = await fetchAvailableTimeSlots(date, addressId)
                setLocalTimeSlots(prev => [...prev, ...slots])
            } catch (error) {
                console.error('Failed to fetch time slots for date:', error)
                // Silently fail - use existing slots
            } finally {
                setIsFetchingSlots(false)
            }
        }
    }, [state.selectedAddressId, timeSlots])

    // ============================================================================
    // Time Slot Selection
    // ============================================================================

    const handleSelectSlot = useCallback((slot: TimeSlot) => {
        // Check if slot is available
        if (!slot.isAvailable) {
            Taro.showToast({
                title: '该时间段已满，请选择其他时间',
                icon: 'none',
            })
            return
        }

        // Create reservation
        const newReservation = createReservation(slot.id)
        setReservation(newReservation)
        setSelectedSlotId(slot.id)
        selectTimeSlot(slot.id)

        Taro.showToast({
            title: '时间段已预留',
            icon: 'success',
        })
    }, [selectTimeSlot])

    // ============================================================================
    // Form Submission
    // ============================================================================

    const handleNext = useCallback(async () => {
        // Validate slot is selected
        if (!selectedSlotId) {
            Taro.showToast({
                title: '请选择一个时间段',
                icon: 'none',
            })
            return
        }

        // Validate reservation is still valid
        if (!reservation || !isReservationValid(reservation)) {
            setReservation(undefined)
            setSelectedSlotId(undefined)
            Taro.showToast({
                title: '预留已过期，请重新选择',
                icon: 'none',
            })
            return
        }

        // Get selected slot
        const selected = timeSlots.find((slot) => slot.id === selectedSlotId)
        if (!selected) {
            Taro.showToast({
                title: '时间段不存在',
                icon: 'none',
            })
            return
        }

        // Proceed to next step (time slot reservation will be confirmed during order submission)
        onNext(selected)
    }, [selectedSlotId, reservation, timeSlots, onNext])

    // ============================================================================
    // Helpers
    // ============================================================================

    /**
     * Get time slots for the selected date
     */
    const slotsForSelectedDate = timeSlots.filter((slot) => slot.date === selectedDate)

    /**
     * Format reservation time left as MM:SS
     */
    const formatTimeLeft = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <ScrollView className='time-slot-selection' scrollY>
            <View className='time-slot-selection-container'>
                {/* Header */}
                <View className='form-header'>
                    <Text className='form-title'>选择取货时间</Text>
                    <Text className='form-subtitle'>第3步，共4步</Text>
                </View>

                {/* Date Picker Section */}
                <View className='form-section'>
                    <Text className='section-title'>选择日期</Text>
                    <DatePicker
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        daysCount={7}
                    />
                </View>

                {/* Time Slots Section */}
                <View className='form-section'>
                    <Text className='section-title'>选择时间段</Text>

                    {isFetchingSlots ? (
                        <View className='loading-state'>
                            <Text className='loading-spinner'>⏳</Text>
                            <Text className='loading-text'>加载时间段中...</Text>
                        </View>
                    ) : slotsForSelectedDate.length === 0 ? (
                        <View className='empty-state'>
                            <Text className='empty-icon'>⏰</Text>
                            <Text className='empty-title'>该日期暂无可用时间段</Text>
                            <Text className='empty-description'>请选择其他日期</Text>
                        </View>
                    ) : (
                        <TimeSlotGrid
                            slots={slotsForSelectedDate}
                            selectedSlotId={selectedSlotId}
                            onSelectSlot={handleSelectSlot}
                        />
                    )}
                </View>

                {/* Reservation Info */}
                {reservation && isReservationValid(reservation) && (
                    <View className='reservation-info'>
                        <Text className='reservation-label'>预留时间剩余：</Text>
                        <Text className='reservation-timer'>{formatTimeLeft(reservationTimeLeft)}</Text>
                        <Text className='reservation-note'>请在预留时间内完成订单确认</Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View className='form-actions'>
                    <Button className='btn-secondary' onClick={onBack} disabled={isLoading}>
                        返回
                    </Button>
                    <Button
                        className='btn-primary'
                        onClick={handleNext}
                        disabled={isLoading || !selectedSlotId}
                    >
                        {isLoading ? '提交中...' : '下一步'}
                    </Button>
                </View>
            </View>
        </ScrollView>
    )
}
