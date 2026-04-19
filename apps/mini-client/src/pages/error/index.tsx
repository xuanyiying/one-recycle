import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { errorTracker } from '@/utils/errorTracker'
import './index.scss'

interface ErrorPageProps {
  errorMessage?: string
}

const ErrorPage: React.FC<ErrorPageProps> = (props) => {
  const [errorMessage, setErrorMessage] = useState(props.errorMessage || '页面加载出现问题')
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    // 从路由参数获取错误信息
    const pages = Taro.getCurrentPages()
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1]
      const params = currentPage?.options || {}
      if (params.msg) {
        setErrorMessage(decodeURIComponent(params.msg as string))
      }
    }

    // 获取最近的错误日志
    const logs = errorTracker.getErrorLogs()
    if (logs.length > 0) {
      const recentError = logs[0]
      if (recentError) {
        setErrorDetails(recentError.stack || recentError.message)
      }
    }
  }, [])

  // 重新加载页面
  const handleRetry = useCallback(() => {
    Taro.reLaunch({
      url: '/pages/index/index'
    })
  }, [])

  // 返回首页
  const handleGoHome = useCallback(() => {
    Taro.reLaunch({
      url: '/pages/index/index'
    })
  }, [])

  // 查看错误详情
  const handleShowDetails = useCallback(() => {
    if (errorDetails) {
      Taro.showModal({
        title: '错误详情',
        content: errorDetails,
        showCancel: false
      })
    } else {
      Taro.showToast({
        title: '暂无错误详情',
        icon: 'none'
      })
    }
  }, [errorDetails])

  return (
    <View className="error-page">
      <View className="error-container">
        <View className="error-icon">😵</View>
        <Text className="error-title">出错了</Text>
        <Text className="error-message">{errorMessage}</Text>

        {errorDetails && (
          <Button className="details-button" onClick={handleShowDetails}>
            查看错误详情
          </Button>
        )}

        <View className="error-actions">
          <Button className="retry-button" onClick={handleRetry}>
            重新加载
          </Button>
          <Button className="home-button" onClick={handleGoHome}>
            返回首页
          </Button>
        </View>
      </View>
    </View>
  )
}

export default ErrorPage
