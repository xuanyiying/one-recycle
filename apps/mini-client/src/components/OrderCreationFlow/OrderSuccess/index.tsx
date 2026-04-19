/**
 * OrderSuccess Component
 * Displays order confirmation with order number and next steps
 * 
 * Requirements: 5.4
 */

import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface OrderSuccessProps {
    orderNo: string
    onComplete: () => void
}

// ============================================================================
// Component
// ============================================================================

export default function OrderSuccess({ orderNo, onComplete }: OrderSuccessProps) {
    /**
     * Handle copy order number to clipboard
     */
    const handleCopyorderNo = () => {
        // Use Taro's clipboard API for mini-program compatibility
        Taro.setClipboardData({
            data: orderNo,
            success: () => {
                Taro.showToast({
                    title: '订单号已复制',
                    icon: 'success',
                    duration: 2000,
                })
            },
            fail: () => {
                Taro.showToast({
                    title: '复制失败，请重试',
                    icon: 'none',
                    duration: 2000,
                })
            },
        })
    }

    /**
     * Handle navigate to orders page
     */
    const handleViewOrder = () => {
        Taro.switchTab({
            url: '/pages/order/index',
            fail: () => {
                Taro.showToast({
                    title: '页面不存在',
                    icon: 'none',
                })
            },
        })
    }

    return (
        <View className='order-success'>
            <View className='order-success-container'>
                {/* Success Icon */}
                <View className='success-icon-container'>
                    <Text className='success-icon'>✓</Text>
                </View>

                {/* Success Message */}
                <View className='success-message'>
                    <Text className='success-title'>订单提交成功</Text>
                    <Text className='success-subtitle'>感谢您的信任，我们会尽快为您服务</Text>
                </View>

                {/* Order Number */}
                <View className='order-number-section'>
                    <Text className='order-number-label'>订单号</Text>
                    <View className='order-number-card'>
                        <Text className='order-number-value'>{orderNo}</Text>
                        <Button className='btn-copy' onClick={handleCopyorderNo}>
                            复制
                        </Button>
                    </View>
                </View>

                {/* Next Steps */}
                <View className='next-steps-section'>
                    <Text className='next-steps-title'>接下来</Text>

                    <View className='step-item'>
                        <View className='step-number'>1</View>
                        <View className='step-content'>
                            <Text className='step-title'>等待配送员确认</Text>
                            <Text className='step-description'>我们会在1小时内为您分配配送员</Text>
                        </View>
                    </View>

                    <View className='step-item'>
                        <View className='step-number'>2</View>
                        <View className='step-content'>
                            <Text className='step-title'>配送员上门取货</Text>
                            <Text className='step-description'>配送员会在您选择的时间段内上门</Text>
                        </View>
                    </View>

                    <View className='step-item'>
                        <View className='step-number'>3</View>
                        <View className='step-content'>
                            <Text className='step-title'>现场评估定价</Text>
                            <Text className='step-description'>配送员会现场评估物品并确认最终价格</Text>
                        </View>
                    </View>

                    <View className='step-item'>
                        <View className='step-number'>4</View>
                        <View className='step-content'>
                            <Text className='step-title'>款项到账</Text>
                            <Text className='step-description'>完成后款项会立即转入您的账户</Text>
                        </View>
                    </View>
                </View>

                {/* Info Banner */}
                <View className='info-banner'>
                    <Text className='info-icon'>ℹ️</Text>
                    <Text className='info-text'>
                        您可以在&quot;我的订单&quot;中查看订单详情和配送员信息
                    </Text>
                </View>

                {/* Action Buttons */}
                <View className='action-buttons'>
                    <Button className='btn-secondary' onClick={handleViewOrder}>
                        查看订单
                    </Button>
                    <Button className='btn-primary' onClick={onComplete}>
                        返回首页
                    </Button>
                </View>
            </View>
        </View>
    )
}
