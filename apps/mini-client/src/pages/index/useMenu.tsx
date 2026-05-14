import { logger } from '@/utils/logger'
import React from 'react'
import Taro from '@tarojs/taro'
import { Image } from '@tarojs/components'

import leaderboardIcon from '../../assets/icons/leaderboard.svg'
import pickupIcon from '../../assets/icons/pickup.svg'
import Icon from '@/components/Icon'

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
      icon: <Icon name="order" size={24} style={{ color: '#4CAF50' }} />,
      bgColor: '#4CAF5015',
      path: '/pages/order/index'
    },
    {
      key: 'rank',
      name: '环保榜单',
      icon: <Image className="feature-icon" src={leaderboardIcon} mode="aspectFit" />,
      bgColor: '#FFC10715',
      path: '/pages/rank/index'
    },
    {
      key: 'service',
      name: '回收规则',
      icon: <Image className="feature-icon" src={pickupIcon} mode="aspectFit" />,
      bgColor: '#2196F315',
      path: '/pages/recycle-rules/index'
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
          } catch (_) { }
        }

        if (typeof (Taro as any).switchTab === 'function') {
          Taro.switchTab({
            url: feature.path,
            success: () => {
              logger.log('Switch tab success:', feature.path)
            },
            fail: (err) => {
              logger.error('Switch tab failed:', err)
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
            logger.error('Navigate failed:', err)
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
