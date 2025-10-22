import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useAppContext } from '@/store'
import { AuthService } from '@/services/authService'

export const useAuth = () => {
  const { state, dispatch } = useAppContext()
  const [loading, setLoading] = useState(false)

  // 从全局状态获取登录状态
  const isLoggedIn = !!state.token && !!state.user
  const user = state.user
  const token = state.token

  // 初始化时检查本地存储的登录状态
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const authStatus = AuthService.checkLoginStatus()
        
        if (authStatus.isLoggedIn && authStatus.token && authStatus.user) {
          // 同步到全局状态
          dispatch({ type: 'SET_TOKEN', payload: authStatus.token })
          dispatch({ type: 'SET_USER', payload: authStatus.user })
        } else {
          // 清理无效的状态
          dispatch({ type: 'LOGOUT' })
        }
      } catch (error) {
        console.error('检查存储的认证信息失败:', error)
        dispatch({ type: 'LOGOUT' })
      }
    }

    // 只在全局状态为空时检查本地存储
    if (!state.token || !state.user) {
      checkStoredAuth()
    }
  }, [dispatch, state.token, state.user])

  // 检查认证状态
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true)
      
      const loginStatus = AuthService.checkLoginStatus()
      
      if (loginStatus.isLoggedIn && loginStatus.token && loginStatus.user) {
        // 更新全局状态
        dispatch({
          type: 'LOGIN',
          payload: {
            user: loginStatus.user,
            token: loginStatus.token
          }
        })
      } else {
        // 清理状态
        dispatch({ type: 'LOGOUT' })
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      dispatch({ type: 'LOGOUT' })
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // 登录
  const login = useCallback(async (user: any, token: string, provider?: string) => {
    try {
      setLoading(true)
      
      // 保存到本地存储
      await AuthService.saveLoginInfo(token, user)
      
      // 保存登录提供商信息
      if (provider) {
        Taro.setStorageSync('loginProvider', provider)
      }
      
      // 更新全局状态
      dispatch({
        type: 'LOGIN',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      console.error('登录状态更新失败:', error)
      return { success: false, error: '登录状态更新失败' }
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // 登出
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      
      // 调用登出服务
      await AuthService.logout()
      
      // 清理登录提供商信息
      Taro.removeStorageSync('loginProvider')
      
      // 更新全局状态
      dispatch({ type: 'LOGOUT' })
      
      return { success: true }
    } catch (error) {
      console.error('登出失败:', error)
      return { success: false, error: '登出失败' }
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // 更新用户信息
  const updateUser = useCallback((userData: any) => {
    try {
      // 更新本地存储
      Taro.setStorageSync('user', userData)
      
      // 更新全局状态
      dispatch({
        type: 'UPDATE_USER',
        payload: userData
      })
      
      return { success: true }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return { success: false, error: '更新用户信息失败' }
    }
  }, [dispatch])

  // 刷新token
  const refreshToken = useCallback(async () => {
    try {
      setLoading(true)
      
      const result = await AuthService.refreshToken()
      
      if (result.success && result.token) {
        // 更新全局状态
        dispatch({
          type: 'SET_TOKEN',
          payload: result.token
        })
        
        return { success: true, token: result.token }
      } else {
        // token刷新失败，需要重新登录
        await logout()
        return { success: false, error: 'Token已过期，请重新登录' }
      }
    } catch (error) {
      console.error('刷新token失败:', error)
      await logout()
      return { success: false, error: 'Token刷新失败' }
    } finally {
      setLoading(false)
    }
  }, [dispatch, logout])

  // 检查是否需要登录，如果未登录则跳转到登录页
  const requireAuth = useCallback((showModal: boolean = true) => {
    if (!isLoggedIn) {
      if (showModal) {
        Taro.showModal({
          title: '提示',
          content: '请先登录',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({
                url: '/pages/login/index'
              })
            }
          }
        })
      } else {
        Taro.navigateTo({
          url: '/pages/login/index'
        })
      }
      return false
    }
    return true
  }, [isLoggedIn])

  // 静默检查登录状态，不显示弹窗
  const checkLoginSilently = useCallback(() => {
    return isLoggedIn
  }, [isLoggedIn])

  return {
    // 状态
    isLoggedIn,
    user,
    token,
    loading,
    
    // 方法
    checkAuthStatus,
    login,
    logout,
    updateUser,
    refreshToken,
    requireAuth,
    checkLoginSilently
  }
}