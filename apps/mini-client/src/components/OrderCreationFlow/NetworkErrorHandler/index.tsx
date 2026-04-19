/**
 * NetworkErrorHandler Component
 * Handles network errors with retry logic and user feedback
 * 
 * Requirements: 7.5
 */

import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AppError, ErrorCode } from '../../../utils/errorHandler'
import { logger } from '@/utils/logger'
import './index.scss'

// ============================================================================
// Types
// ============================================================================

interface NetworkErrorHandlerProps {
    error?: AppError
    visible?: boolean
    onRetry?: () => Promise<void>
    onDismiss?: () => void
    isRetrying?: boolean
}

// ============================================================================
// Component
// ============================================================================

export default function NetworkErrorHandler({
    error,
    visible = true,
    onRetry,
    onDismiss,
    isRetrying = false,
}: NetworkErrorHandlerProps) {
    if (!visible || !error) {
        return null
    }

    const isNetworkError =
        error.code === ErrorCode.NETWORK_ERROR ||
        error.code === ErrorCode.NETWORK_TIMEOUT ||
        error.code === ErrorCode.NETWORK_OFFLINE

    const isServerError =
        error.code === ErrorCode.INTERNAL_SERVER_ERROR ||
        error.code === ErrorCode.SERVICE_UNAVAILABLE ||
        error.code === ErrorCode.BAD_GATEWAY ||
        error.code === ErrorCode.GATEWAY_TIMEOUT

    const isRetryable = error.retryable

    const handleRetry = async () => {
        if (onRetry) {
            try {
                await onRetry()
            } catch (err) {
                logger.error('Retry failed:', err)
                Taro.showToast({
                    title: '重试失败，请稍后再试',
                    icon: 'none',
                })
            }
        }
    }

    return (
        <View className='network-error-handler'>
            <View className='error-container'>
                <Text className='error-icon'>
                    {isNetworkError && '📡'}
                    {isServerError && '🔧'}
                    ⚠️
                </Text>

                <View className='error-content'>
                    <Text className='error-title'>
                        {isNetworkError && '网络连接失败'}
                        {isServerError && '服务器错误'}
                        {!isNetworkError && !isServerError && '请求失败'}
                    </Text>

                    <Text className='error-message'>{error.message}</Text>

                    {isNetworkError && (
                        <Text className='error-hint'>
                            请检查您的网络连接，然后重试
                        </Text>
                    )}

                    {isServerError && (
                        <Text className='error-hint'>
                            服务器暂时不可用，请稍后重试
                        </Text>
                    )}
                </View>
            </View>

            <View className='error-actions'>
                {isRetryable && onRetry && (
                    <Button
                      className='btn-retry'
                      onClick={handleRetry}
                      disabled={isRetrying}
                    >
                        {isRetrying ? '重试中...' : '重试'}
                    </Button>
                )}

                {onDismiss && (
                    <Button className='btn-dismiss' onClick={onDismiss}>
                        关闭
                    </Button>
                )}
            </View>
        </View>
    )
}
