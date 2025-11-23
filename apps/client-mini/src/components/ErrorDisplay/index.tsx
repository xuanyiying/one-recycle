/**
 * ErrorDisplay Component
 * 统一的错误显示组件，支持多种显示模式
 */

import { View, Text, Button } from '@tarojs/components'
import './index.scss'

export type ErrorType = 'error' | 'warning' | 'info'
export type ErrorMode = 'inline' | 'banner' | 'message'

interface ErrorDisplayProps {
    message?: string
    title?: string
    visible?: boolean
    type?: ErrorType
    mode?: ErrorMode
    onRetry?: () => void
    onDismiss?: () => void
}

export default function ErrorDisplay({
    message,
    title,
    visible = true,
    type = 'error',
    mode = 'inline',
    onRetry,
    onDismiss,
}: ErrorDisplayProps) {
    if (!visible || !message) {
        return null
    }

    const getIcon = () => {
        switch (type) {
            case 'error': return '⚠️'
            case 'warning': return '⚡'
            case 'info': return 'ℹ️'
            default: return '⚠️'
        }
    }

    // Inline mode - 简单的字段错误提示
    if (mode === 'inline') {
        return (
            <View className={`error-display error-inline error-${type}`}>
                <Text className='error-icon'>{getIcon()}</Text>
                <Text className='error-text'>{message}</Text>
            </View>
        )
    }

    // Banner mode - 顶部横幅错误提示
    if (mode === 'banner') {
        return (
            <View className={`error-display error-banner error-${type}`}>
                <View className='banner-content'>
                    <Text className='banner-icon'>{getIcon()}</Text>
                    <View className='banner-text'>
                        {title && <Text className='banner-title'>{title}</Text>}
                        <Text className='banner-message'>{message}</Text>
                    </View>
                </View>
                {(onRetry || onDismiss) && (
                    <View className='banner-actions'>
                        {onRetry && (
                            <Button className='btn-retry' onClick={onRetry}>
                                重试
                            </Button>
                        )}
                        {onDismiss && (
                            <Button className='btn-dismiss' onClick={onDismiss}>
                                关闭
                            </Button>
                        )}
                    </View>
                )}
            </View>
        )
    }

    // Message mode - 消息框样式
    return (
        <View className={`error-display error-message error-${type}`}>
            <Text className='error-icon'>{getIcon()}</Text>
            <Text className='error-text'>{message}</Text>
        </View>
    )
}
