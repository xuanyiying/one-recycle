import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import './index.scss'
import { Loading } from '@nutui/nutui-react-taro'
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
  showLoginPrompt = false // 默认为自动跳转，不显示提示
}) => {
  const { isLoggedIn, loading, checkAuthStatus } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  // 初始检查
  useEffect(() => {
    const initAuth = async () => {
      // 如果已经有登录态，就不需要重新checkAuthStatus(会发请求)，除非强制检查
      // 这里依赖 useAuth 的状态即可
      if (!isLoggedIn) {
          try {
            await checkAuthStatus()
          } catch (error) {
            console.error('认证检查失败:', error)
          }
      }
      setIsChecking(false)
    }

    initAuth()
  }, [checkAuthStatus, isLoggedIn])

  // 处理自动跳转
  useEffect(() => {
    if (!isChecking && !loading && !isLoggedIn && !fallback && !showLoginPrompt) {
        // 保存当前页面路径作为登录后的重定向地址（可选，视需求而定）
        // 这里简单处理，直接跳转登录页
        Taro.navigateTo({
            url: redirectTo,
            fail: () => {
                // 如果是 tabbar 页面或 navigateTo 失败，尝试 reLaunch
                Taro.reLaunch({ url: redirectTo })
            }
        })
    }
  }, [isChecking, loading, isLoggedIn, fallback, showLoginPrompt, redirectTo])

  // 正在检查认证状态
  if (isChecking || loading) {
    return (
      <View className="auth-guard-loading">
        <Loading className="loading-text">加载中...</Loading> 
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

    return null
  }
  
  // 已登录，渲染子组件
  return <>{children}</>
}

export default AuthGuard