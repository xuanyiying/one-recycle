import React, { useEffect, useState, useCallback, memo, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/utils/logger'
import './index.scss'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
  showLoginPrompt?: boolean
  /** 超时时间 (ms)，默认 3000 */
  timeout?: number
}

/**
 * 统一路由守卫组件
 * 
 * 特性：
 * 1. 性能优化：使用 React.memo 和 useRef 减少不必要的渲染
 * 2. 体验优化：增加骨架屏加载状态，避免白屏
 * 3. 容错机制：3s 超时降级处理，支持手动重试
 * 4. 统一逻辑：整合所有鉴权边界情况
 */
const AuthGuard: React.FC<AuthGuardProps> = memo(({
  children,
  fallback,
  redirectTo = '/pages/login/index',
  showLoginPrompt = false,
  timeout = 3000
}) => {
  const { isLoggedIn, loading, checkAuthStatus } = useAuth()
  
  // 内部状态
  const [status, setStatus] = useState<'idle' | 'checking' | 'authorized' | 'unauthorized' | 'timeout' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // 使用 Ref 记录是否已卸载，防止内存泄漏
  const isMounted = useRef(true)
  // 记录鉴权开始时间，用于性能监控
  const startTime = useRef(Date.now())
  // 记录最新状态，避免闭包问题和不必要的依赖
  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    return () => { isMounted.current = false }
  }, [])

  // 判断是否为 TabBar 页面
  const isTabBarPage = useCallback(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const route = currentPage ? currentPage.route : ''
    const tabBarRoutes = [
      'pages/index/index',
      'pages/order/index',
      'pages/profile/index'
    ]
    return tabBarRoutes.some(r => route && route.includes(r))
  }, [])

  // 获取重定向 URL
  const getRedirectUrl = useCallback(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentPath = currentPage ? `/${currentPage.route}` : ''
    
    // 如果已经在目标页面，避免循环跳转
    if (redirectTo.includes(currentPage?.route || '')) {
       return redirectTo
    }

    let finalRedirectUrl = redirectTo
    if (currentPath && !redirectTo.includes('?')) {
      const options = (currentPage as any).options || {}
      const queryString = Object.keys(options)
        .map(key => `${key}=${options[key]}`)
        .join('&')
      
      const fullPath = queryString ? `${currentPath}?${queryString}` : currentPath
      if (!redirectTo.includes('redirect=')) {
          finalRedirectUrl = `${redirectTo}?redirect=${encodeURIComponent(fullPath)}`
      }
    }
    return finalRedirectUrl
  }, [redirectTo])

  // 执行跳转
  const performRedirect = useCallback(() => {
    const url = getRedirectUrl()
    // 延迟跳转确保页面挂载完成
    setTimeout(() => {
      if (!isMounted.current) return
      
      // TabBar 页面不能用 navigateTo / redirectTo 跳转到另一个 TabBar 页面
      // 但通常登录页不是 TabBar 页面。
      // 如果 redirectTo 是 TabBar 页面，需要用 switchTab
      // 这里假设登录页是普通页面
      Taro.navigateTo({
        url,
        fail: () => {
           // 降级尝试
           Taro.redirectTo({ url })
        }
      })
    }, 100)
  }, [getRedirectUrl])

  // 核心鉴权逻辑
  const performCheck = useCallback(async () => {
    if (!isMounted.current) return
    
    setStatus('checking')
    setErrorMsg(null)
    startTime.current = Date.now()

    // 快速路径：如果已经登录，直接通过
    if (isLoggedIn) {
      setStatus('authorized')
      return
    }

    try {
      // 设置超时计时器
      const timeoutId = setTimeout(() => {
        if (isMounted.current && statusRef.current !== 'authorized') {
          setStatus('timeout')
        }
      }, timeout)

      const result = await checkAuthStatus()
      clearTimeout(timeoutId)
      
      if (!isMounted.current) return

      if (result.isLoggedIn) {
        setStatus('authorized')
      } else {
        setStatus('unauthorized')
      }
    } catch (err) {
      if (!isMounted.current) return
      logger.error('Auth check failed:', err)
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : '鉴权服务异常')
    }
  }, [isLoggedIn, checkAuthStatus, timeout])

  // 初始触发
  useEffect(() => {
    performCheck()
  }, [performCheck])

  // 页面重新显示时检查 (防止后台 token 失效)
  useDidShow(() => {
    if (status === 'authorized' && !isLoggedIn) {
      performCheck()
    }
  })

  // 状态处理副作用
  useEffect(() => {
    if (status === 'unauthorized') {
      const isTab = isTabBarPage()
      const shouldPrompt = showLoginPrompt || isTab

      if (!fallback && !shouldPrompt) {
        performRedirect()
      }
    }
  }, [status, fallback, showLoginPrompt, isTabBarPage, performRedirect])

  // 渲染逻辑
  if (status === 'authorized') {
    return <>{children}</>
  }

  // 超时或错误 (优先级高于 Loading，防止 useAuth loading 导致一直显示骨架屏)
  if (status === 'timeout' || status === 'error') {
    return (
      <View className="auth-guard-container">
        <View className="error-state">
           <Text className="error-icon">⚠️</Text>
           <Text className="error-title">
             {status === 'timeout' ? '加载超时' : '鉴权失败'}
           </Text>
           <Text className="error-desc">
             {status === 'timeout' ? '网络连接较慢，请检查网络设置' : errorMsg}
           </Text>
           <View className="btn-retry" onClick={performCheck}>
             重新加载
           </View>
        </View>
      </View>
    )
  }

  // 自定义未登录展示
  if (status === 'unauthorized') {
    if (fallback) return <>{fallback}</>
    
    const isTab = isTabBarPage()
    if (showLoginPrompt || isTab) {
      return (
        <View className="auth-guard-container">
          <View className="auth-prompt">
            <View className="icon-lock">🔒</View>
            <Text className="title">访问受限</Text>
            <Text className="desc">当前页面需要登录后才能访问</Text>
            <View className="btn-login" onClick={performRedirect}>
              立即登录
            </View>
          </View>
        </View>
      )
    }
    // 正在跳转中...
    return (
       <View className="auth-guard-container">
          <View className="skeleton-screen">
            <View className="skeleton-banner" />
            <View className="skeleton-list">
               <View className="skeleton-item" />
               <View className="skeleton-item" />
               <View className="skeleton-item" />
            </View>
            <Text className="loading-tips">正在前往登录页...</Text>
          </View>
       </View>
    )
  }

  // 加载中 / 检查中
  if (status === 'idle' || status === 'checking' || loading) {
    return (
      <View className="auth-guard-container">
         <View className="skeleton-screen">
            <View className="skeleton-banner" />
            <View className="skeleton-title" />
            <View className="skeleton-content" />
         </View>
      </View>
    )
  }

  return null
})

AuthGuard.displayName = 'AuthGuard'

export default AuthGuard
