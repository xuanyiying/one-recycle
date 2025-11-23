/**
 * Time Slot Service
 * Handles API calls for fetching available time slots
 * 
 * Requirements: 3.2
 */

import { get } from '../utils/request'
import { TimeSlot } from '../types/order'

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
    addressId: string
): Promise<TimeSlot[]> => {
    try {
        const response = await get('/order/time-slots/available', {
            date,
            addressId,
        }, {
            cache: true,
            cacheTTL: 5 * 60 * 1000, // Cache for 5 minutes
        })

        if (response && response.success && response.slots) {
            return response.slots
        }

        throw new Error(response?.error || 'Failed to fetch time slots')
    } catch (error) {
        console.error('Error fetching available time slots:', error)
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
    addressId: string
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

        if (response && response.success && response.slots) {
            return response.slots
        }

        throw new Error(response?.error || 'Failed to fetch time slots')
    } catch (error) {
        console.error('Error fetching time slots batch:', error)
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
        console.error('Error reserving time slot:', error)
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
        console.error('Error releasing time slot:', error)
        // Don't throw - this is a cleanup operation
    }
}
