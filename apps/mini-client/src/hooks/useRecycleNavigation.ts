import { useCallback } from 'react'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { logger } from '@/utils/logger'

export const useRecycleNavigation = () => {
  const { checkAuthStatus } = useAuth()

  const handleRecycleClick = useCallback(async (type: 'book' | 'clothes') => {
    try {


      const { isLoggedIn } = await checkAuthStatus()

      if (isLoggedIn) {
        const categoryId = type === 'book' ? 1 : 2
        Taro.navigateTo({
          url: categoryId
            ? `/pages/recycle/index?categoryId=${categoryId}`
            : '/pages/recycle/index',
        })
      } else {

        // 获取当前页面路径，用于登录后返回
        const pages = Taro.getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const route = currentPage ? currentPage.route : 'pages/index/index'
        const redirectUrl = `/${route}`

        // 使用 navigateTo 跳转登录页
        Taro.navigateTo({
          url: `/pages/login/index?redirect=${encodeURIComponent(redirectUrl)}`,
          fail: (err) => {
            logger.error('跳转登录页失败:', err)
            Taro.showToast({ title: '跳转失败', icon: 'none' })
          }
        })
      }
    } catch (error) {
      logger.error('[Home] Auth check failed:', error)
      Taro.showToast({
        title: '系统繁忙，请重试',
        icon: 'none'
      })
    }
  }, [checkAuthStatus])

  return {
    handleRecycleClick
  }
}
