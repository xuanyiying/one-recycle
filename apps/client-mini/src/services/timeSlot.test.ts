/**
 * Time Slot Service Unit Tests
 * Tests API integration for fetching available time slots
 * 
 * Requirements: 3.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as requestUtils from '../utils/request'
import {
    fetchAvailableTimeSlots,
    fetchTimeSlotsBatch,
    reserveTimeSlot,
    releaseTimeSlot,
} from './timeSlot'
import { TimeSlot } from '../types/order'

// Mock the request utility
vi.mock('../utils/request', () => ({
    get: vi.fn(),
}))

describe('TimeSlotService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // ========================================================================
    // fetchAvailableTimeSlots Tests
    // ========================================================================

    describe('fetchAvailableTimeSlots', () => {
        it('should fetch available time slots for a given date and address', async () => {
            const mockSlots: TimeSlot[] = [
                {
                    id: 'slot_1',
                    date: '2025-12-25',
                    startTime: '08:00',
                    endTime: '10:00',
                    capacity: 5,
                    booked: 2,
                    isAvailable: true,
                },
                {
                    id: 'slot_2',
                    date: '2025-12-25',
                    startTime: '10:00',
                    endTime: '12:00',
                    capacity: 5,
                    booked: 5,
                    isAvailable: false,
                },
            ]

            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: true,
                slots: mockSlots,
            })

            const result = await fetchAvailableTimeSlots('2025-12-25', 'addr_123')

            expect(result).toEqual(mockSlots)
            expect(requestUtils.get).toHaveBeenCalledWith(
                '/order/time-slots/available',
                {
                    date: '2025-12-25',
                    addressId: 'addr_123',
                },
                {
                    cache: true,
                    cacheTTL: 5 * 60 * 1000,
                }
            )
        })

        it('should throw error when API returns failure', async () => {
            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: false,
                error: 'Address not in service area',
            })

            await expect(fetchAvailableTimeSlots('2025-12-25', 'addr_invalid')).rejects.toThrow(
                'Address not in service area'
            )
        })

        it('should throw error when API response is malformed', async () => {
            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: true,
                // Missing slots field
            })

            await expect(fetchAvailableTimeSlots('2025-12-25', 'addr_123')).rejects.toThrow(
                'Failed to fetch time slots'
            )
        })

        it('should handle network errors gracefully', async () => {
            vi.mocked(requestUtils.get).mockRejectedValueOnce(new Error('Network timeout'))

            await expect(fetchAvailableTimeSlots('2025-12-25', 'addr_123')).rejects.toThrow(
                'Network timeout'
            )
        })
    })

    // ========================================================================
    // fetchTimeSlotsBatch Tests
    // ========================================================================

    describe('fetchTimeSlotsBatch', () => {
        it('should fetch time slots for multiple dates', async () => {
            const mockSlots: TimeSlot[] = [
                {
                    id: 'slot_1',
                    date: '2025-12-25',
                    startTime: '08:00',
                    endTime: '10:00',
                    capacity: 5,
                    booked: 2,
                    isAvailable: true,
                },
                {
                    id: 'slot_2',
                    date: '2025-12-26',
                    startTime: '08:00',
                    endTime: '10:00',
                    capacity: 5,
                    booked: 3,
                    isAvailable: true,
                },
            ]

            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: true,
                slots: mockSlots,
            })

            const result = await fetchTimeSlotsBatch('2025-12-25', 2, 'addr_123')

            expect(result).toEqual(mockSlots)
            expect(requestUtils.get).toHaveBeenCalledWith(
                '/order/time-slots/batch',
                {
                    startDate: '2025-12-25',
                    daysCount: 2,
                    addressId: 'addr_123',
                },
                {
                    cache: true,
                    cacheTTL: 5 * 60 * 1000,
                }
            )
        })

        it('should handle batch fetch errors', async () => {
            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: false,
                error: 'Service temporarily unavailable',
            })

            await expect(fetchTimeSlotsBatch('2025-12-25', 7, 'addr_123')).rejects.toThrow(
                'Service temporarily unavailable'
            )
        })
    })

    // ========================================================================
    // reserveTimeSlot Tests
    // ========================================================================

    describe('reserveTimeSlot', () => {
        it('should reserve a time slot and return reservation details', async () => {
            const now = new Date()
            const expiresAt = new Date(now.getTime() + 15 * 60 * 1000)

            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: true,
                slotId: 'slot_123',
                reservedAt: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
            })

            const result = await reserveTimeSlot('slot_123')

            expect(result.slotId).toBe('slot_123')
            expect(result.reservedAt).toBe(now.toISOString())
            expect(result.expiresAt).toBe(expiresAt.toISOString())
            expect(requestUtils.get).toHaveBeenCalledWith('/order/time-slots/reserve', {
                slotId: 'slot_123',
            })
        })

        it('should throw error when reservation fails', async () => {
            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: false,
                error: 'Slot no longer available',
            })

            await expect(reserveTimeSlot('slot_123')).rejects.toThrow('Slot no longer available')
        })
    })

    // ========================================================================
    // releaseTimeSlot Tests
    // ========================================================================

    describe('releaseTimeSlot', () => {
        it('should release a reserved time slot', async () => {
            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: true,
            })

            await expect(releaseTimeSlot('slot_123')).resolves.toBeUndefined()
            expect(requestUtils.get).toHaveBeenCalledWith('/order/time-slots/release', {
                slotId: 'slot_123',
            })
        })

        it('should handle release errors gracefully', async () => {
            vi.mocked(requestUtils.get).mockResolvedValueOnce({
                success: false,
                error: 'Slot not found',
            })

            // Should not throw - this is a cleanup operation
            await expect(releaseTimeSlot('slot_123')).resolves.toBeUndefined()
        })

        it('should handle network errors during release', async () => {
            vi.mocked(requestUtils.get).mockRejectedValueOnce(new Error('Network error'))

            // Should not throw - this is a cleanup operation
            await expect(releaseTimeSlot('slot_123')).resolves.toBeUndefined()
        })
    })
})
