/**
 * OrderConfirmation Component (Step 4 of Order Creation Flow)
 * Displays complete order summary and handles order submission
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * Properties: Property 8 (Order Submission Atomicity), Property 9 (Loading State During Submission)
 */

import { useState, useCallback } from 'react'
import { View, Text, Button, ScrollView, Checkbox } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Item, Address, TimeSlot, OrderSubmission } from '../../../types/order'
import { calculateOrderPricing, formatPriceRange, formatPrice } from '../../../utils/priceCalculation'
import PriceEstimate from '../PriceEstimate'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface OrderConfirmationProps {
    items: Item[]
    address: Address
    timeSlot: TimeSlot
    onSubmit: (order: OrderSubmission) => Promise<void>
    onBack: () => void
    onEditItems?: () => void
    onEditAddress?: () => void
    onEditTimeSlot?: () => void
}

// ============================================================================
// Component
// ============================================================================

export default function OrderConfirmation({
    items,
    address,
    timeSlot,
    onSubmit,
    onBack,
    onEditItems,
    onEditAddress,
    onEditTimeSlot,
}: OrderConfirmationProps) {
    // State management
    const [notes, setNotes] = useState('')
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>()
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Calculate pricing
    const pricing = calculateOrderPricing(items)

    // ============================================================================
    // Validation
    // ============================================================================

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!agreedToTerms) {
            newErrors.terms = '请同意服务条款'
        }

        if (items.length === 0) {
            newErrors.items = '订单中没有物品'
        }

        if (!address) {
            newErrors.address = '请选择收货地址'
        }

        if (!timeSlot) {
            newErrors.timeSlot = '请选择取货时间'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ============================================================================
    // Event Handlers
    // ============================================================================

    const handleNotesChange = useCallback((value: string) => {
        setNotes(value)
    }, [])

    const handleTermsChange = useCallback((checked: boolean) => {
        setAgreedToTerms(checked)
        // Clear terms error if user agrees
        if (checked) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors.terms
                return newErrors
            })
        }
    }, [])

    const handleSubmit = useCallback(async () => {
        // Validate form
        if (!validateForm()) {
            Taro.showToast({
                title: '请检查订单信息',
                icon: 'none',
            })
            return
        }

        setIsLoading(true)
        setError(undefined)

        try {
            // Create order submission object
            const orderSubmission: OrderSubmission = {
                items,
                address,
                timeSlot,
                notes,
                agreedToTerms,
            }

            // Call submit handler
            await onSubmit(orderSubmission)

            // Success is handled by parent component
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '提交订单失败，请重试'
            setError(errorMessage)
            Taro.showToast({
                title: errorMessage,
                icon: 'none',
            })
        } finally {
            setIsLoading(false)
        }
    }, [items, address, timeSlot, notes, agreedToTerms, onSubmit])

    // ============================================================================
    // Render Helpers
    // ============================================================================

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr + 'T00:00:00')
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const dayName = days[date.getDay()]
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}月${day}日 ${dayName}`
    }

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <ScrollView className='order-confirmation' scrollY>
            <View className='order-confirmation-container'>
                {/* Header */}
                <View className='form-header'>
                    <Text className='form-title'>确认订单</Text>
                    <Text className='form-subtitle'>第4步，共4步</Text>
                </View>

                {/* Error Message */}
                {error && (
                    <View className='error-banner'>
                        <Text className='error-icon'>⚠️</Text>
                        <View className='error-content'>
                            <Text className='error-title'>提交失败</Text>
                            <Text className='error-message'>{error}</Text>
                        </View>
                    </View>
                )}

                {/* Items Summary Section */}
                <View className='form-section'>
                    <View className='section-header'>
                        <Text className='section-title'>物品清单</Text>
                        {onEditItems && (
                            <Button
                                className='btn-edit'
                                onClick={onEditItems}
                                disabled={isLoading}
                            >
                                编辑
                            </Button>
                        )}
                    </View>

                    <View className='items-summary'>
                        {items.map((item, index) => (
                            <View key={item.id} className='item-summary-card'>
                                <View className='item-header'>
                                    <Text className='item-number'>物品 {index + 1}</Text>
                                    <Text className='item-category'>{item.categoryName}</Text>
                                </View>

                                <View className='item-details'>
                                    <View className='detail-row'>
                                        <Text className='detail-label'>品牌/型号：</Text>
                                        <Text className='detail-value'>{item.brandModel}</Text>
                                    </View>

                                    <View className='detail-row'>
                                        <Text className='detail-label'>状况：</Text>
                                        <Text className='detail-value'>
                                            {item.condition === 'new'
                                                ? '全新'
                                                : item.condition === 'good'
                                                    ? '良好'
                                                    : '一般'}
                                        </Text>
                                    </View>

                                    <View className='detail-row'>
                                        <Text className='detail-label'>重量/数量：</Text>
                                        <Text className='detail-value'>
                                            {item.weight}kg / {item.quantity}件
                                        </Text>
                                    </View>

                                    {item.notes && (
                                        <View className='detail-row'>
                                            <Text className='detail-label'>备注：</Text>
                                            <Text className='detail-value'>{item.notes}</Text>
                                        </View>
                                    )}

                                    <View className='detail-row price'>
                                        <Text className='detail-label'>估价：</Text>
                                        <Text className='detail-value-price'>
                                            {formatPriceRange(item.estimatedPrice)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Address Summary Section */}
                <View className='form-section'>
                    <View className='section-header'>
                        <Text className='section-title'>收货地址</Text>
                        {onEditAddress && (
                            <Button
                                className='btn-edit'
                                onClick={onEditAddress}
                                disabled={isLoading}
                            >
                                编辑
                            </Button>
                        )}
                    </View>

                    <View className='address-summary-card'>
                        <View className='address-header'>
                            <Text className='address-name'>{address.recipientName}</Text>
                            <Text className='address-phone'>{address.phoneNumber}</Text>
                        </View>

                        <View className='address-details'>
                            <Text className='address-region'>{address.region}</Text>
                            <Text className='address-full'>{address.detailedAddress}</Text>
                        </View>
                    </View>
                </View>

                {/* Time Slot Summary Section */}
                <View className='form-section'>
                    <View className='section-header'>
                        <Text className='section-title'>取货时间</Text>
                        {onEditTimeSlot && (
                            <Button
                                className='btn-edit'
                                onClick={onEditTimeSlot}
                                disabled={isLoading}
                            >
                                编辑
                            </Button>
                        )}
                    </View>

                    <View className='time-slot-summary-card'>
                        <View className='time-slot-date'>
                            <Text className='time-slot-date-text'>{formatDate(timeSlot.date)}</Text>
                        </View>

                        <View className='time-slot-time'>
                            <Text className='time-slot-time-text'>
                                {timeSlot.startTime} - {timeSlot.endTime}
                            </Text>
                        </View>

                        <View className='time-slot-capacity'>
                            <Text className='capacity-label'>可用名额：</Text>
                            <Text className='capacity-value'>
                                {timeSlot.capacity - timeSlot.booked}/{timeSlot.capacity}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Pricing Section */}
                <View className='form-section'>
                    <Text className='section-title'>价格明细</Text>
                    <PriceEstimate
                        items={items}
                        showBreakdown={true}
                        showDisclaimer={true}
                    />
                </View>

                {/* Notes Section */}
                <View className='form-section'>
                    <Text className='section-title'>备注（可选）</Text>
                    <View className='form-field'>
                        <View className='textarea-wrapper'>
                            <Text
                                className='textarea'
                                onClick={() => {
                                    // In a real app, this would open a text input
                                    // For now, we'll use a simple approach
                                }}
                            >
                                {notes || '添加备注信息...'}
                            </Text>
                        </View>
                        <Text className='field-hint'>
                            例如：物品放在门口、请轻拿轻放等
                        </Text>
                    </View>
                </View>

                {/* Terms Agreement Section */}
                <View className='form-section'>
                    <View className='terms-agreement'>
                        <Checkbox
                            className='terms-checkbox'
                            checked={agreedToTerms}
                            onChange={(e) => handleTermsChange(e.detail.value)}
                        />
                        <Text className='terms-text'>
                            我已阅读并同意
                            <Text className='terms-link'>《服务条款》</Text>
                            和
                            <Text className='terms-link'>《隐私政策》</Text>
                        </Text>
                    </View>
                    {errors.terms && (
                        <Text className='error-message'>{errors.terms}</Text>
                    )}
                </View>

                {/* Order Summary Card */}
                <View className='order-summary-card'>
                    <View className='summary-row'>
                        <Text className='summary-label'>物品总价：</Text>
                        <Text className='summary-value'>
                            {formatPriceRange(pricing.itemsTotal)}
                        </Text>
                    </View>

                    {pricing.serviceFee > 0 && (
                        <View className='summary-row'>
                            <Text className='summary-label'>服务费：</Text>
                            <Text className='summary-value'>
                                {formatPrice(pricing.serviceFee)}
                            </Text>
                        </View>
                    )}

                    <View className='summary-divider' />

                    <View className='summary-row total'>
                        <Text className='summary-label'>预估总价：</Text>
                        <Text className='summary-value-total'>
                            {formatPriceRange(pricing.totalEstimate)}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className='form-actions'>
                    <Button
                        className='btn-secondary'
                        onClick={onBack}
                        disabled={isLoading}
                    >
                        返回
                    </Button>
                    <Button
                        className='btn-primary'
                        onClick={handleSubmit}
                        disabled={isLoading || !agreedToTerms}
                    >
                        {isLoading ? '提交中...' : '确认提交'}
                    </Button>
                </View>

                {/* Loading Indicator */}
                {isLoading && (
                    <View className='loading-overlay'>
                        <View className='loading-spinner'>
                            <Text className='spinner-icon'>⏳</Text>
                            <Text className='spinner-text'>正在提交订单...</Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    )
}
