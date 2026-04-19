/**
 * TimeSlotGrid Sub-component
 * Displays available time slots in a grid with capacity indicators
 */

import { View, Text } from '@tarojs/components'
import { TimeSlot } from '../../../../types/order'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface TimeSlotGridProps {
    slots: TimeSlot[]
    selectedSlotId?: string
    onSelectSlot: (slot: TimeSlot) => void
}

// ============================================================================
// Component
// ============================================================================

export default function TimeSlotGrid({
    slots,
    selectedSlotId,
    onSelectSlot,
}: TimeSlotGridProps) {
    /**
     * Get capacity indicator text
     */
    const getCapacityText = (slot: TimeSlot): string => {
        const available = slot.capacity - slot.booked
        if (available <= 0) {
            return '已满'
        }
        if (available <= 2) {
            return '仅剩' + available + '个'
        }
        return '充足'
    }

    /**
     * Get capacity indicator class
     */
    const getCapacityClass = (slot: TimeSlot): string => {
        const available = slot.capacity - slot.booked
        if (available <= 0) {
            return 'capacity-full'
        }
        if (available <= 2) {
            return 'capacity-limited'
        }
        return 'capacity-available'
    }

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <View className='time-slot-grid'>
            {slots.map((slot) => {
                const isSelected = slot.id === selectedSlotId
                const isDisabled = !slot.isAvailable

                return (
                    <View
                      key={slot.id}
                      className={`time-slot-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''
                            }`}
                      onClick={() => !isDisabled && onSelectSlot(slot)}
                    >
                        {/* Time Range */}
                        <Text className='slot-time'>
                            {slot.startTime} - {slot.endTime}
                        </Text>

                        {/* Capacity Indicator */}
                        <View className={`slot-capacity ${getCapacityClass(slot)}`}>
                            <Text className='capacity-text'>{getCapacityText(slot)}</Text>
                        </View>

                        {/* Booked Count */}
                        <Text className='slot-booked'>
                            已预约 {slot.booked}/{slot.capacity}
                        </Text>

                        {/* Selection Indicator */}
                        {isSelected && (
                            <View className='slot-selected-indicator'>
                                <Text className='checkmark'>✓</Text>
                            </View>
                        )}
                    </View>
                )
            })}
        </View>
    )
}
