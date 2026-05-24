/**
 * PriceEstimate Component
 * Displays price estimation for items in the order creation flow
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 * Properties: Property 2 (Price Recalculation on Item Modification)
 */

import { logger } from '@/utils/logger'
import { ScrollView, Text, View } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { estimateItemPrices } from '../../../services/pricing'
import { Item, OrderPricing } from '../../../types/order'
import { calculateOrderPricing, formatPrice, formatPriceRange } from '../../../utils/priceCalculation'
import './index.scss'

// ============================================================================
// Billing Formula Configuration
// ============================================================================

interface BillingFormula {
    name: string
    formula: string
    description: string
}

const BILLING_FORMULAS: BillingFormula[] = [
    {
        name: '按重量计费',
        formula: '单价 × 重量 = 小计',
        description: '适用于金属、塑料等按重量回收的物品',
    },
    {
        name: '按件计费',
        formula: '单价 × 数量 = 小计',
        description: '适用于家电、电子产品等按件回收的物品',
    },
]

// ============================================================================
// Types
// ============================================================================

interface PriceEstimateProps {
    items: Item[]
    showBreakdown?: boolean
    showDisclaimer?: boolean
    useAPI?: boolean
}

// ============================================================================
// Component
// ============================================================================

export default function PriceEstimate({
    items,
    showBreakdown = true,
    showDisclaimer = true,
    useAPI = true,
}: PriceEstimateProps) {
    const [pricing, setPricing] = useState<OrderPricing | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const mergePricingWithItems = (result: OrderPricing, currentItems: Item[]) => {
        const itemMap = new Map(
            currentItems.map((item) => [
                item.id,
                { weight: item.weight, quantity: item.quantity, name: item.categoryName },
            ])
        )
        const breakdown = result.breakdown.map((row) => {
            const matched = row.itemId ? itemMap.get(row.itemId) : undefined
            return {
                ...row,
                weight: matched?.weight ?? row.weight,
                quantity: matched?.quantity ?? row.quantity,
                itemName: matched?.name ?? row.itemName,
            }
        })
        return { ...result, breakdown }
    }

    useEffect(() => {
        if (!items || items.length === 0) {
            setPricing(null)
            setError(null)
            return
        }

        if (useAPI) {
            const fetchPricing = async () => {
                setIsLoading(true)
                setError(null)
                try {
                    const result = await estimateItemPrices(items)
                    setPricing(mergePricingWithItems(result, items))
                } catch (err) {
                    logger.warn('[PriceEstimate] API estimation failed, using local calculation:', err)
                    const localPricing = calculateOrderPricing(items, 'RECYCLE')
                    setPricing(localPricing)
                    setError('使用本地价格估算')
                } finally {
                    setIsLoading(false)
                }
            }

            fetchPricing()
        } else {
            const localPricing = calculateOrderPricing(items, 'RECYCLE')
            setPricing(localPricing)
            setError(null)
        }
    }, [items, useAPI])

    // If no items, show empty state
    if (!items || items.length === 0) {
        return (
            <View className='price-estimate'>
                <View className='empty-state'>
                    <Text className='empty-text'>添加物品后显示价格估计</Text>
                </View>
            </View>
        )
    }

    // If loading, show loading state
    if (useAPI && isLoading) {
        return (
            <View className='price-estimate'>
                <View className='loading-state'>
                    <Text className='loading-text'>正在计算价格...</Text>
                </View>
            </View>
        )
    }

    // If no pricing available, show empty state
    if (!pricing) {
        return (
            <View className='price-estimate'>
                <View className='empty-state'>
                    <Text className='empty-text'>无法计算价格</Text>
                </View>
            </View>
        )
    }

    return (
        <View className='price-estimate'>
            {/* Error message if API fallback occurred */}
            {error && (
                <View className='price-error'>
                    <Text className='error-text'>{error}</Text>
                </View>
            )}

            {/* Price Summary Card */}
            <View className='price-summary-card'>
                <View className='price-row'>
                    <Text className='price-label'>物品总价：</Text>
                    <Text className='price-value'>{formatPriceRange(pricing.itemsTotal)}</Text>
                </View>

                {pricing.serviceFee > 0 && (
                    <View className='price-row'>
                        <Text className='price-label'>服务费：</Text>
                        <Text className='price-value'>{formatPrice(pricing.serviceFee)}</Text>
                    </View>
                )}

                <View className='price-divider' />

                <View className='price-row total'>
                    <Text className='price-label'>预估总价：</Text>
                    <Text className='price-value-total'>{formatPriceRange(pricing.totalEstimate)}</Text>
                </View>
            </View>

            {/* Billing Formula Display */}
            <View className='pricing-formula'>
                <Text className='formula-title'>计费规则</Text>
                <View className='formula-content'>
                    {BILLING_FORMULAS.map((formula, index) => (
                        <View key={index} className='formula-item'>
                            <View className='formula-bullet' />
                            <View className='formula-text'>
                                <Text>{formula.name}：</Text>
                                <Text className='formula-highlight'>{formula.formula}</Text>
                                <Text>（{formula.description}）</Text>
                            </View>
                        </View>
                    ))}
                </View>
                <Text className='formula-note'>
                    * 当前订单为回收类型，免收上门服务费
                </Text>
            </View>

            {/* Price Breakdown */}
            {showBreakdown && pricing.breakdown.length > 0 && (
                <View className='price-breakdown'>
                    <Text className='breakdown-title'>价格明细</Text>
                    <ScrollView scrollX className='breakdown-list'>
                        {pricing.breakdown.map((item) => (
                            <View key={item.itemId} className='breakdown-item'>
                                <View className='item-info'>
                                    <Text className='item-name'>{item.itemName}</Text>
                                    <Text className='item-details'>
                                        {item.weight > 0 ? `${item.weight}kg` : `${item.quantity}`}
                                    </Text>
                                </View>
                                <Text className='item-price'>{formatPriceRange(item.subtotal)}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Disclaimer */}
            {showDisclaimer && (
                <View className='price-disclaimer'>
                    <Text className='disclaimer-icon'>ℹ️</Text>
                    <Text className='disclaimer-text'>
                        最终价格由快递员上门评估后确定，以上为系统估价，仅供参考
                    </Text>
                </View>
            )}
        </View>
    )
}
