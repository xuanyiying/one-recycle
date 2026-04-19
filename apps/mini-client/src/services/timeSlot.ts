/**
 * Time Slot Service
 * Handles API calls for fetching available time slots
 * 
 * Requirements: 3.2
 */

import { get } from '@/utils/request'
import { TimeSlot } from '@/types'
import { logger } from '@/utils/logger'

type TimeSlotDayGroup = {
    date: string
    dayOfWeek?: number
    slots: Array<{
        id?: string
        startTime: string
        endTime: string
        isAvailable?: boolean
        quota?: number
        remaining?: number
        capacity?: number
        booked?: number
    }>
}

const normalizeTimeSlots = (payload: any, fallbackDate?: string): TimeSlot[] => {
    if (!Array.isArray(payload)) return []

    const isDayGroup = (item: any): item is TimeSlotDayGroup =>
        !!item && typeof item.date === 'string' && Array.isArray(item.slots)

    if (payload.some(isDayGroup)) {
        return payload.flatMap((day: TimeSlotDayGroup) =>
            day.slots.map((slot) => {
                const capacityRaw = typeof slot.capacity === 'number' ? slot.capacity : slot.quota
                const remaining = typeof slot.remaining === 'number' ? slot.remaining : undefined
                const capacity = typeof capacityRaw === 'number' ? capacityRaw : (typeof remaining === 'number' ? remaining : 0)
                const booked = typeof slot.booked === 'number'
                    ? slot.booked
                    : (typeof remaining === 'number' ? Math.max(0, capacity - remaining) : 0)
                const isAvailable = typeof slot.isAvailable === 'boolean' ? slot.isAvailable : booked < capacity
                const id = slot.id || `${day.date}_${slot.startTime}_${slot.endTime}`

                return {
                    id,
                    date: day.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    capacity,
                    booked,
                    isAvailable,
                }
            })
        )
    }

    return payload.map((slot: any) => {
        const capacityRaw = typeof slot.capacity === 'number' ? slot.capacity : slot.quota
        const remaining = typeof slot.remaining === 'number' ? slot.remaining : undefined
        const capacity = typeof capacityRaw === 'number' ? capacityRaw : (typeof remaining === 'number' ? remaining : 0)
        const booked = typeof slot.booked === 'number'
            ? slot.booked
            : (typeof remaining === 'number' ? Math.max(0, capacity - remaining) : 0)
        const isAvailable = typeof slot.isAvailable === 'boolean' ? slot.isAvailable : booked < capacity
        const date = slot.date || fallbackDate || ''
        const id = slot.id || `${date}_${slot.startTime}_${slot.endTime}`

        return {
            id,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            capacity,
            booked,
            isAvailable,
        }
    })
}

/**
 * Fetch available time slots for a given date and address
 * 
 * @param date - Date in YYYY-MM-DD format
 * @param addressId - Address ID to check availability for
 * @returns Promise resolving to array of available time slots
 * 
 * Validates: Requirements 3.2
 */
export const fetchAvailableTimeSlots = async (
    date: string,
    addressId: string | number
): Promise<TimeSlot[]> => {
    try {
        const response = await get('/order/time-slots/available', {
            date,
            addressId,
        }, {
            cache: true,
            cacheTTL: 5 * 60 * 1000, // Cache for 5 minutes
        })

        const payload = response?.slots ?? response?.data?.slots ?? response?.data
        const slots = normalizeTimeSlots(payload, date).filter((slot) => slot.date === date)

        if (response && response.success && Array.isArray(payload)) {
            return slots
        }

        throw new Error(response?.error || 'Failed to fetch time slots')
    } catch (error) {
        logger.error('Error fetching available time slots:', error)
        throw error
    }
}

/**
 * Fetch time slots for multiple dates
 * Useful for pre-loading the next 7 days
 * 
 * @param startDate - Start date in YYYY-MM-DD format
 * @param daysCount - Number of days to fetch
 * @param addressId - Address ID to check availability for
 * @returns Promise resolving to array of time slots for all dates
 */
export const fetchTimeSlotsBatch = async (
    startDate: string,
    daysCount: number,
    addressId: string | number
): Promise<TimeSlot[]> => {
    try {
        const response = await get('/order/time-slots/batch', {
            startDate,
            daysCount,
            addressId,
        }, {
            cache: true,
            cacheTTL: 5 * 60 * 1000, // Cache for 5 minutes
        })

        const payload = response?.slots ?? response?.data?.slots ?? response?.data
        const slots = normalizeTimeSlots(payload)

        if (response && response.success && Array.isArray(payload)) {
            return slots
        }

        throw new Error(response?.error || 'Failed to fetch time slots')
    } catch (error) {
        logger.error('Error fetching time slots batch:', error)
        throw error
    }
}

/**
 * Reserve a time slot temporarily
 * Reservation expires after 15 minutes
 * 
 * @param slotId - Time slot ID to reserve
 * @returns Promise resolving to reservation confirmation
 */
export const reserveTimeSlot = async (slotId: string): Promise<{
    slotId: string
    reservedAt: string
    expiresAt: string
}> => {
    try {
        const response = await get('/order/time-slots/reserve', {
            slotId,
        })

        if (response && response.success) {
            return {
                slotId: response.slotId,
                reservedAt: response.reservedAt,
                expiresAt: response.expiresAt,
            }
        }

        throw new Error(response?.error || 'Failed to reserve time slot')
    } catch (error) {
        logger.error('Error reserving time slot:', error)
        throw error
    }
}

/**
 * Release a reserved time slot
 * Called when user abandons the flow or reservation expires
 * 
 * @param slotId - Time slot ID to release
 * @returns Promise resolving when slot is released
 */
export const releaseTimeSlot = async (slotId: string): Promise<void> => {
    try {
        const response = await get('/order/time-slots/release', {
            slotId,
        })

        if (!response || !response.success) {
            throw new Error(response?.error || 'Failed to release time slot')
        }
    } catch (error) {
        logger.error('Error releasing time slot:', error)
        // Don't throw - this is a cleanup operation
    }
}
