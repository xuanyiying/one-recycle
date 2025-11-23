/**
 * DatePicker Sub-component
 * Displays a horizontal scrollable date picker for the next N days
 */

import { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import './DatePicker.scss'

// ============================================================================
// Types
// ============================================================================

interface DatePickerProps {
    selectedDate: string // YYYY-MM-DD
    onDateChange: (date: string) => void
    daysCount?: number
}

// ============================================================================
// Component
// ============================================================================

export default function DatePicker({
    selectedDate,
    onDateChange,
    daysCount = 7,
}: DatePickerProps) {
    /**
     * Generate array of dates for the next N days
     */
    const dates = useMemo(() => {
        const result = []
        const today = new Date()

        for (let i = 0; i < daysCount; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)
            result.push(date)
        }

        return result
    }, [daysCount])

    /**
     * Format date for display
     * Returns: "Mon 12/25" format
     */
    const formatDateDisplay = (date: Date): { day: string; date: string } => {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const day = dayNames[date.getDay()]
        const month = date.getMonth() + 1
        const dateNum = date.getDate()
        return {
            day,
            date: `${month}/${dateNum}`,
        }
    }

    /**
     * Convert date to YYYY-MM-DD format
     */
    const dateToString = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    /**
     * Check if date is today
     */
    const isToday = (date: Date): boolean => {
        const today = new Date()
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        )
    }

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <ScrollView className='date-picker' scrollX>
            <View className='date-picker-container'>
                {dates.map((date) => {
                    const dateStr = dateToString(date)
                    const { day, date: dateDisplay } = formatDateDisplay(date)
                    const isSelected = dateStr === selectedDate
                    const isTodayDate = isToday(date)

                    return (
                        <View
                            key={dateStr}
                            className={`date-item ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''
                                }`}
                            onClick={() => onDateChange(dateStr)}
                        >
                            <Text className='date-day'>{day}</Text>
                            <Text className='date-number'>{dateDisplay}</Text>
                            {isTodayDate && <Text className='date-label'>今天</Text>}
                        </View>
                    )
                })}
            </View>
        </ScrollView>
    )
}
