import {useCallback, useEffect, useRef, useState} from 'react'
import Taro from '@tarojs/taro'
import {useAppContext} from '@/store'
import {AuthService} from '@/services/auth'
import {MockAutoLogin} from '@/mock'
import {User} from '@/types'

export const useAuth = () => {
  const { state, dispatch } = useAppContext()
  const [loading, setLoading] = useState(false)

  // 从全局状态获取登录状态
  const isLoggedIn = !!state.token && !!state.user
  const user = state.user
  const token = state.token
  
  // 使用 Ref 保持 user 的最新引用，解决 updateUser 的依赖循环问题
  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])

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
      const refreshToken = Taro.getStorageSync('refreshToken')
      
      // 1. 如果全局状态已经完整，直接返回（优化点：减少重复检查）
      if (state.token && state.user) {
        return { isLoggedIn: true, user: state.user, token: state.token }
      }

      // 2. 如果本地存储完整，同步到全局状态
      if (storedToken && storedUser) {
        if (!state.token || !state.user) {
          dispatch({
            type: 'LOGIN',
            payload: { user: storedUser, token: storedToken }
          })
        }
        return { isLoggedIn: true, user: storedUser, token: storedToken }
      }
      
      // 3. 如果没有有效token但有refreshToken，尝试刷新
      if (!storedToken && refreshToken) {
        console.log('检测到refreshToken，尝试自动刷新...')
        const refreshResult = await AuthService.refreshToken()
        if (refreshResult.success && refreshResult.token) {
           const currentUser = storedUser || (await AuthService.getUserInfo()).data
           if (currentUser) {
             dispatch({
               type: 'LOGIN',
               payload: { user: currentUser, token: refreshResult.token }
             })
             return { isLoggedIn: true, user: currentUser, token: refreshResult.token }
           }
        }
        // 刷新失败，确保登出清理
        dispatch({ type: 'LOGOUT' })
        return { isLoggedIn: false }
      }
      
      // 4. 最后尝试通过API检查登录状态（通常是Session Cookie方式，这里作为兜底）
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
      dispatch({ type: 'LOGOUT' })
      return { isLoggedIn: false }
    } finally {
      setLoading(false)
    }
  }, [dispatch, state.token, state.user])


  // 登录
  const login = useCallback(async (userData: User, userToken: string, provider?: string) => {
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

  // 更新用户信息
  const updateUser = useCallback(async (newUserData: any) => {
    try {
      const currentUser = userRef.current
      if (!currentUser) return { success: false, message: '用户未登录' }
      
      const updatedUser = { ...currentUser, ...newUserData }
      
      // 更新本地存储
      Taro.setStorageSync('user', updatedUser)
      
      // 更新全局状态
      dispatch({
        type: 'UPDATE_USER',
        payload: updatedUser
      })
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      return { success: false, message: '更新失败' }
    }
  }, [dispatch])

  // 发送验证码
  const sendSmsCode = useCallback(async (mobile: string) => {
    try {
      setLoading(true)
      return await AuthService.sendSmsCode({mobile, type: 'login'})
    } catch (error: any) {
      console.error('发送验证码失败:', error)
      return { success: false, message: error.message || '发送失败' }
    } finally {
      setLoading(false)
    }
  }, [])

  // 手机号登录
  const loginWithPhone = useCallback(async (phone: string, code: string) => {
    try {
      setLoading(true)
      const result = await AuthService.phoneLogin(phone, code)
      if (result.success && result.token && result.user) {
        await login(result.user, result.token, 'phone')
        return { success: true }
      }
      return { success: false, message: result.error || '登录失败' }
    } catch (error: any) {
      console.error('手机号登录失败:', error)
      return { success: false, message: error.message || '登录失败' }
    } finally {
      setLoading(false)
    }
  }, [login])

  // 处理社交登录 (微信/支付宝)
  const handleSocialLogin = useCallback(async (provider: 'wechat' | 'alipay') => {
    try {
      setLoading(true)
      let result

      if (provider === 'wechat') {
        // 微信登录流程
        const { code } = await Taro.login()
        // 注意：getUserProfile 可能会被限制，这里作为可选信息获取
        let userInfo = { nickName: '微信用户', avatarUrl: '' }
        try {
            // 尝试获取用户信息，如果失败则使用默认值
            // 实际项目中通常在登录后引导用户完善信息
            const profile = await Taro.getUserProfile({ desc: '用于完善会员资料' })
           userInfo = profile.userInfo
        } catch (e) {
            console.log('获取微信用户信息失败或用户拒绝:', e)
        }
        
        result = await AuthService.wechatLogin({
          code,
          nickname: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        })
      } else if (provider === 'alipay') {
        // 支付宝登录流程
        // @ts-ignore
        const { authCode } = await Taro.getAuthCode({ scopes: 'auth_user' })
        
        result = await AuthService.alipayLogin({
          code: authCode,
          nickname: '支付宝用户'
        })
      }

      if (result?.success && result.data?.tokens?.accessToken) {
        const { user } = result.data
        const token = result.data.tokens.accessToken
        await login(user, token, provider)
        return { success: true }
      } else {
        throw new Error(result?.message || '登录失败')
      }
    } catch (error: any) {
      console.error(`${provider}登录失败:`, error)
      return { success: false, message: error.message || '登录失败' }
    } finally {
      setLoading(false)
    }
  }, [login])

  return {
    isLoggedIn,
    user,
    token,
    loading,
    checkAuthStatus,
    login,
    logout,
    updateUser,
    sendSmsCode,
    loginWithPhone,
    handleSocialLogin
  }
}
