import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useAppContext } from '@/store'
import { AuthService } from '@/services/auth'
import { MockAutoLogin } from '@/mock'

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
        // 在开发环境下处理 Mock 登录
        if (process.env.NODE_ENV === 'development') {
          if (MockAutoLogin.isMockAutoLogin()) {
            const mockLoginInfo = MockAutoLogin.getMockLoginInfo()
            if (mockLoginInfo) {
              await AuthService.saveLoginInfo(mockLoginInfo.token!, mockLoginInfo.user!)
            } else {
              await MockAutoLogin.initialize()
            }
          }
        }

        const authStatus = AuthService.checkLoginStatus()
        
        if (authStatus.isLoggedIn && authStatus.token && authStatus.user) {
          // 同步到全局状态
          dispatch({ 
            type: 'LOGIN', 
            payload: { 
              user: authStatus.user, 
              token: authStatus.token 
            } 
          })
        } else {
          // 如果全局已经有值但本地没了，才清理
          if (state.token || state.user) {
            dispatch({ type: 'LOGOUT' })
          }
        }
      } catch (error) {
        console.error('检查存储的认证信息失败:', error)
      }
    }

    // 只在全局状态为空时检查本地存储
    if (!state.token || !state.user) {
      checkStoredAuth()
    }
  }, [dispatch, state.token, state.user])

  // 检查认证状态的导出函数
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true)
      
      // 先尝试从本地存储获取，以防全局状态还没更新
      const storedToken = Taro.getStorageSync('token')
      const storedUser = Taro.getStorageSync('user')
      
      if (storedToken && storedUser) {
        if (!state.token || !state.user) {
          dispatch({
            type: 'LOGIN',
            payload: { user: storedUser, token: storedToken }
          })
        }
        return { isLoggedIn: true, user: storedUser, token: storedToken }
      }
      
      const loginStatus = AuthService.checkLoginStatus()
      if (loginStatus.isLoggedIn && loginStatus.token && loginStatus.user) {
        dispatch({
          type: 'LOGIN',
          payload: { user: loginStatus.user, token: loginStatus.token }
        })
        return { isLoggedIn: true, user: loginStatus.user, token: loginStatus.token }
      } else {
        dispatch({ type: 'LOGOUT' })
        return { isLoggedIn: false }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      return { isLoggedIn: false }
    } finally {
      setLoading(false)
    }
  }, [dispatch, state.token, state.user])

  // 登录
  const login = useCallback(async (userData: any, userToken: string, provider?: string) => {
    try {
      setLoading(true)
      await AuthService.saveLoginInfo(userToken, userData)
      if (provider) {
        Taro.setStorageSync('loginProvider', provider)
      }
      dispatch({
        type: 'LOGIN',
        payload: { user: userData, token: userToken }
      })
      return { success: true }
    } catch (error) {
      console.error('登录状态更新失败:', error)
      return { success: false, message: '登录失败' }
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  // 退出登录
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await AuthService.logout()
      dispatch({ type: 'LOGOUT' })
      return { success: true }
    } catch (error) {
      console.error('退出登录失败:', error)
      return { success: false, message: '退出失败' }
    } finally {
      setLoading(false)
    }
  }, [dispatch])

  return {
    isLoggedIn,
    user,
    token,
    loading,
    checkAuthStatus,
    login,
    logout
  }
}
