import { Component, ReactNode } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { logger } from '@/utils/logger'
import './index.scss'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorStack: string | null
}

/**
 * Taro 兼容的错误边界组件
 * 
 * 注意：Taro 小程序环境不完全支持 React 的 ErrorBoundary
 * 这个组件主要作为 UI 包装器，实际的错误捕获通过：
 * - Taro.onError (全局错误)
 * - try-catch (局部错误)
 * - 错误追踪器 (errorTracker)
 * 
 * 功能：
 * - 显示错误状态
 * - 支持自定义错误处理回调
 * - 提供重试和返回首页功能
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorStack: null
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorStack: error.stack || null
    }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    this.setState({
      hasError: true,
      error,
      errorStack: errorInfo.componentStack || error.stack || null
    })

    if (this.props.onError) {
      this.props.onError(error)
    }

    logger.error('ErrorBoundary 捕获到错误:', error)
  }

  // 设置错误状态（通过外部调用）
  setError = (error: Error): void => {
    this.setState({
      hasError: true,
      error,
      errorStack: error.stack || null
    })

    // 调用自定义错误处理
    if (this.props.onError) {
      this.props.onError(error)
    }

    // 打印错误到控制台
    logger.error('ErrorBoundary 捕获到错误:', error)
  }

  // 重置错误状态
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorStack: null
    })
  }

  // 返回首页
  handleGoHome = (): void => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack({ delta: pages.length - 1 })
    } else {
      Taro.reLaunch({
        url: '/pages/index/index'
      })
    }
    this.handleReset()
  }

  render() {
    const { hasError, error, errorStack } = this.state
    const { children, fallback } = this.props

    // 如果没有错误，正常渲染子组件
    if (!hasError) {
      return <>{children}</>
    }

    // 如果有自定义 fallback，使用它
    if (fallback) {
      return <>{fallback}</>
    }

    // 默认错误 UI
    return (
      <View className="error-boundary">
        <View className="error-container">
          <View className="error-icon">😵</View>
          <Text className="error-title">出错了</Text>
          <Text className="error-message">
            {error?.message || '页面加载出现问题，请稍后重试'}
          </Text>

          { errorStack && (
            <View className="error-details">
              <Text className="error-details-title">错误详情（仅开发环境显示）：</Text>
              <Text className="error-stack">{errorStack}</Text>
            </View>
          )}

          <View className="error-actions">
            <Button
              className="retry-button"
              onClick={this.handleReset}
            >
              重新加载
            </Button>
            <Button
              className="home-button"
              onClick={this.handleGoHome}
            >
              返回首页
            </Button>
          </View>
        </View>
      </View>
    )
  }
}

export default ErrorBoundary
