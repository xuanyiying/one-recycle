import { useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'

export const useRecycleNavigation = () => {
  const { checkAuthStatus } = useAuth()

  const handleRecycleClick = useCallback(async (type: 'book' | 'clothes') => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Home] Checking login status for:', type)
      }

      const { isLoggedIn } = await checkAuthStatus()

      if (isLoggedIn) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Home] User is logged in, proceeding to recycle page')
        }
        Taro.navigateTo({
          url: `/pages/recycle/index?category=${type}`
        })
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Home] User not logged in, redirecting to login')
        }
        
        // 获取当前页面路径，用于登录后返回
        const pages = Taro.getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const route = currentPage ? currentPage.route : 'pages/index/index'
        const redirectUrl = `/${route}`
        
        Taro.navigateTo({
          url: `/pages/login/index?redirect=${encodeURIComponent(redirectUrl)}`
        })
      }
    } catch (error) {
      console.error('[Home] Auth check failed:', error)
      Taro.showToast({
        title: '验证失败，请重试',
        icon: 'none'
      })
    }
  }, [checkAuthStatus])

  return {
    handleRecycleClick
  }
}
