import React from 'react'
import Taro from '@tarojs/taro'
import { Order, Cart, Star, Service } from '@nutui/icons-react-taro'

export interface FeatureItem {
  key: string
  name: string
  icon: React.ReactNode
  bgColor: string
  path?: string
  action?: () => void
}

export const useMenu = () => {
  const features: FeatureItem[] = [
    {
      key: 'order',
      name: '预约记录',
      icon: <Order size={24} color='#4CAF50' />,
      bgColor: '#4CAF5015',
      path: '/pages/order/index'
    },
    {
      key: 'mall',
      name: '积分商城',
      icon: <Cart size={24} color='#FF9800' />,
      bgColor: '#FF980015',
      action: () => Taro.showToast({ title: '积分商城即将上线', icon: 'none' })
    },
    {
      key: 'rank',
      name: '环保榜单',
      icon: <Star size={24} color='#FFC107' />,
      bgColor: '#FFC10715',
      path: '/pages/rank/index'
    },
    {
      key: 'service',
      name: '服务说明',
      icon: <Service size={24} color='#2196F3' />,
      bgColor: '#2196F315',
      path: '/pages/agreement/index?type=user'
    }
  ]

  const handleFeatureClick = (feature: FeatureItem) => {
    if (feature.action) {
      feature.action()
      return
    }
    
    if (feature.path) {
      const isTabBar = ['/pages/index/index', '/pages/order/index', '/pages/profile/index'].includes(feature.path)
      
      if (isTabBar) {
        // 如果是订单页面，设置默认选中 Tab
        if (feature.key === 'order') {
          try {
            if (typeof (Taro as any).setStorageSync === 'function') {
              Taro.setStorageSync('ORDER_ACTIVE_TAB', 'all')
            }
          } catch (_) {}
        }

        if (typeof (Taro as any).switchTab === 'function') {
          Taro.switchTab({
            url: feature.path,
            success: () => {
              console.log('Switch tab success:', feature.path)
            },
            fail: (err) => {
               console.error('Switch tab failed:', err)
               Taro.showToast({ title: `跳转失败: ${err.errMsg}`, icon: 'none' })
            }
          })
        } else {
          Taro.navigateTo({ url: feature.path })
        }
      } else {
        Taro.navigateTo({
          url: feature.path,
          fail: (err) => {
            console.error('Navigate failed:', err)
            Taro.showToast({ title: '页面跳转失败', icon: 'none' })
          }
        })
      }
    }
  }

  return {
    features,
    handleFeatureClick
  }
}
