/**
 * DraftRecoveryModal Component
 * Displays a modal offering to restore a saved draft order
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import { View, Text, Button } from '@tarojs/components'
import { DraftOrder } from '../../../types/order'
import { getDraftOrderTimeRemainingFormatted } from '../../../services/draftOrderService'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface DraftRecoveryModalProps {
    draft: DraftOrder
    completionPercentage: number
    onRestore: () => void
    onDiscard: () => void
}

// ============================================================================
// Component
// ============================================================================

export default function DraftRecoveryModal({
    draft,
    completionPercentage,
    onRestore,
    onDiscard,
}: DraftRecoveryModalProps) {
    // Format the time remaining
    const timeRemaining = getDraftOrderTimeRemainingFormatted()

    // Format the creation time
    const createdAt = new Date(draft.createdAt)
    const createdTime = createdAt.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <View className='draft-recovery-modal-overlay'>
            <View className='draft-recovery-modal'>
                {/* Header */}
                <View className='modal-header'>
                    <Text className='modal-title'>恢复草稿订单</Text>
                    <Text className='modal-subtitle'>您有一个未完成的订单</Text>
                </View>

                {/* Content */}
                <View className='modal-content'>
                    {/* Draft Info */}
                    <View className='draft-info'>
                        <View className='info-row'>
                            <Text className='info-label'>物品数量：</Text>
                            <Text className='info-value'>{draft.items.length} 件</Text>
                        </View>

                        <View className='info-row'>
                            <Text className='info-label'>创建时间：</Text>
                            <Text className='info-value'>{createdTime}</Text>
                        </View>

                        {timeRemaining && (
                            <View className='info-row'>
                                <Text className='info-label'>有效期：</Text>
                                <Text className='info-value'>{timeRemaining}</Text>
                            </View>
                        )}
                    </View>

                    {/* Progress Bar */}
                    <View className='progress-section'>
                        <View className='progress-header'>
                            <Text className='progress-label'>完成进度</Text>
                            <Text className='progress-percentage'>{Math.round(completionPercentage)}%</Text>
                        </View>

                        <View className='progress-bar'>
                            <View
                                className='progress-fill'
                                style={{
                                    width: `${completionPercentage}%`,
                                }}
                            />
                        </View>

                        <View className='progress-steps'>
                            <View className={`step ${completionPercentage >= 25 ? 'completed' : ''}`}>
                                <Text className='step-number'>1</Text>
                                <Text className='step-label'>物品</Text>
                            </View>

                            <View className={`step ${completionPercentage >= 50 ? 'completed' : ''}`}>
                                <Text className='step-number'>2</Text>
                                <Text className='step-label'>地址</Text>
                            </View>

                            <View className={`step ${completionPercentage >= 75 ? 'completed' : ''}`}>
                                <Text className='step-number'>3</Text>
                                <Text className='step-label'>时间</Text>
                            </View>

                            <View className={`step ${completionPercentage >= 100 ? 'completed' : ''}`}>
                                <Text className='step-number'>4</Text>
                                <Text className='step-label'>确认</Text>
                            </View>
                        </View>
                    </View>

                    {/* Message */}
                    <View className='modal-message'>
                        <Text className='message-text'>
                            您可以继续完成这个订单，或者开始一个新的订单
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View className='modal-actions'>
                    <Button className='btn-secondary' onClick={onDiscard}>
                        开始新订单
                    </Button>
                    <Button className='btn-primary' onClick={onRestore}>
                        恢复草稿
                    </Button>
                </View>
            </View>
        </View>
    )
}
