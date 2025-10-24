import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import './index.scss'
interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  showLoginPrompt?: boolean
}

/**
 * 登录检查守卫组件
 * 用于保护需要登录才能访问的页面
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  redirectTo = '/pages/login/index',
  showLoginPrompt = true
}) => {
  const { isLoggedIn, loading, checkAuthStatus } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuthStatus()
      } catch (error) {
        console.error('认证检查失败:', error)
      } finally {
        setIsChecking(false)
      }
    }

    initAuth()
  }, [checkAuthStatus])

  // 正在检查认证状态
  if (isChecking || loading) {
    return (
      <View className="auth-guard-loading">
        <Text className="loading-text">检查登录状态...</Text>
      </View>
    )
  }

  // 未登录状态
  if (!isLoggedIn) {
    // 如果提供了自定义的fallback组件
    if (fallback) {
      return <>{fallback}</>
    }

    // 显示默认的登录提示
    if (showLoginPrompt) {
      return (
        <View className="auth-guard-prompt">
          <View className="prompt-container">
            <Text className="prompt-icon">🔒</Text>
            <Text className="prompt-title">需要登录</Text>
            <Text className="prompt-message">请先登录后再访问此页面</Text>
            <View
              className="login-btn"
              onClick={() => {
                Taro.navigateTo({
                  url: redirectTo
                })
              }}
            >
              <Text className="login-btn-text">去登录</Text>
            </View>
          </View>
        </View>
      )
    }

    // 直接跳转到登录页
    Taro.redirectTo({
      url: redirectTo
    })

    return null
  }

  // 已登录，渲染子组件
  return <>{children}</>
}

export default AuthGuard