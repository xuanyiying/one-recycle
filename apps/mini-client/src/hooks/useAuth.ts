import { AuthService } from '@/services/auth'
import { useStore } from '@/store/useStore'
import { User } from '@/types'
import { logger } from '@/utils/logger'
import { Storage } from '@/utils/storage'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export const useAuth = () => {
  const storeUser = useStore((state) => state.user)
  const storeToken = useStore((state) => state.token)
  const storeLogin = useStore((state) => state.login)
  const storeLogout = useStore((state) => state.logout)
  const storeUpdateUser = useStore((state) => state.updateUser)

  const [loading, setLoading] = useState(false)

  const isLoggedIn = !!storeToken && !!storeUser
  const user = storeUser
  const token = storeToken

  const userRef = useRef(user)
  useEffect(() => {
    userRef.current = user
  }, [user])

  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return

    const checkStoredAuth = async () => {
      try {
        const authStatus = AuthService.checkLoginStatus()

        if (authStatus.isLoggedIn && authStatus.token && authStatus.user) {
          if (!storeToken || !storeUser) {
            storeLogin(authStatus.user, authStatus.token)
          }
        } else {
          if (storeToken || storeUser) {
            storeLogout()
          }
        }
      } catch (error) {
        logger.error('检查存储的认证信息失败:', error)
      } finally {
        isInitialized.current = true
      }
    }

    if (!storeToken || !storeUser) {
      checkStoredAuth()
    } else {
      isInitialized.current = true
    }
  }, [storeLogin, storeLogout, storeToken, storeUser])

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true)

      if (storeToken && storeUser) {
        return { isLoggedIn: true, user: storeUser, token: storeToken }
      }

      const storedToken = Storage.getToken()
      const storedUser = Storage.getUser()
      const refreshToken = Storage.getRefreshToken()

      if (storedToken && storedUser) {
        if (!storeToken || !storeUser) {
          storeLogin(storedUser, storedToken)
        }
        return { isLoggedIn: true, user: storedUser, token: storedToken }
      }

      if (!storedToken && refreshToken) {
        logger.log('检测到refreshToken，尝试自动刷新...')
        const refreshResult = await AuthService.refreshToken()
        if (refreshResult.success && refreshResult.token) {
          const currentUser = storedUser || (await AuthService.getUserInfo()).data
          if (currentUser) {
            storeLogin(currentUser, refreshResult.token)
            return { isLoggedIn: true, user: currentUser, token: refreshResult.token }
          }
        }
        storeLogout()
        return { isLoggedIn: false }
      }

      const loginStatus = AuthService.checkLoginStatus()
      if (loginStatus.isLoggedIn && loginStatus.token && loginStatus.user) {
        storeLogin(loginStatus.user, loginStatus.token)
        return { isLoggedIn: true, user: loginStatus.user, token: loginStatus.token }
      } else {
        storeLogout()
        return { isLoggedIn: false }
      }
    } catch (error) {
      logger.error('检查认证状态失败:', error)
      storeLogout()
      return { isLoggedIn: false }
    } finally {
      setLoading(false)
    }
  }, [storeLogin, storeLogout, storeToken, storeUser])

  const login = useCallback(async (userData: User, userToken: string, provider?: string) => {
    try {
      setLoading(true)
      await AuthService.saveLoginInfo(userToken, userData)
      if (provider) {
        Storage.set('LOGIN_PROVIDER', provider)
      }
      storeLogin(userData, userToken)
      return { success: true }
    } catch (error) {
      logger.error('登录状态更新失败:', error)
      return { success: false, message: '登录失败' }
    } finally {
      setLoading(false)
    }
  }, [storeLogin])

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await AuthService.logout()
      storeLogout()
      return { success: true }
    } catch (error) {
      logger.error('退出登录失败:', error)
      return { success: false, message: '退出失败' }
    } finally {
      setLoading(false)
    }
  }, [storeLogout])

  const updateUser = useCallback(async (newUserData: any) => {
    try {
      const currentUser = userRef.current
      if (!currentUser) return { success: false, message: '用户未登录' }

      const updatedUser = { ...currentUser, ...newUserData }

      Storage.setUser(updatedUser)
      storeUpdateUser(updatedUser)

      return { success: true, user: updatedUser }
    } catch (error) {
      logger.error('更新用户信息失败:', error)
      return { success: false, message: '更新失败' }
    }
  }, [storeUpdateUser])

  const sendSmsCode = useCallback(async (mobile: string) => {
    try {
      setLoading(true)
      return await AuthService.sendSmsCode({ mobile, type: 'login' })
    } catch (error: any) {
      logger.error('发送验证码失败:', error)
      return { success: false, message: error.message || '发送失败' }
    } finally {
      setLoading(false)
    }
  }, [])

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
      logger.error('手机号登录失败:', error)
      return { success: false, message: error.message || '登录失败' }
    } finally {
      setLoading(false)
    }
  }, [login])

  const handleSocialLogin = useCallback(async (provider: 'wechat' | 'alipay') => {
    try {
      setLoading(true)
      let result

      if (provider === 'wechat') {
        const { code } = await Taro.login()
        let userInfo = { nickName: '微信用户', avatarUrl: '' }
        try {
          const profile = await Taro.getUserProfile({ desc: '用于完善会员资料' })
          userInfo = profile.userInfo
        } catch (e) {
          logger.log('获取微信用户信息失败或用户拒绝:', e)
        }

        result = await AuthService.wechatLogin({
          code,
          nickname: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        })
      } else if (provider === 'alipay') {
        // @ts-ignore
        const { authCode } = await Taro.getAuthCode({ scopes: 'auth_user' })

        result = await AuthService.alipayLogin({
          code: authCode,
          nickname: '支付宝用户'
        })
      }

      if (result?.success && result.data?.tokens?.accessToken) {
        const { user: loggedInUser } = result.data
        const accessToken = result.data.tokens.accessToken
        await login(
          {
            id: loggedInUser.id,
            nickname: loggedInUser.nickname ?? '',
            avatarUrl: loggedInUser.avatarUrl ?? '',
            mobile: loggedInUser.mobile ?? '',
            realName: loggedInUser.realName,
            openid: loggedInUser.openid,
          },
          accessToken,
          provider,
        )
        return { success: true }
      } else {
        throw new Error(result?.message || '登录失败')
      }
    } catch (error: any) {
      logger.error(`${provider}登录失败:`, error)
      return { success: false, message: error.message || '登录失败' }
    } finally {
      setLoading(false)
    }
  }, [login])

  return useMemo(() => ({
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
  }), [isLoggedIn, user, token, loading])
}
