import { useState, useEffect, useCallback, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { logger } from '@/utils/logger'

export interface ScreenSize {
  width: number
  height: number
  screenType: 'small' | 'standard' | 'large'
  isPortrait: boolean
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

// iOS design breakpoints (in logical pixels)
const BREAKPOINTS = {
  small: 375,    // iPhone SE, iPhone 12 mini
  standard: 414, // iPhone 12, iPhone 13
  large: 430     // iPhone 12 Pro Max, iPhone 14 Pro Max
} as const

export function useResponsive(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    // 初始化时获取屏幕信息，避免闪烁
    try {
      const systemInfo = Taro.getSystemInfoSync()
      const width = systemInfo.screenWidth
      const height = systemInfo.screenHeight
      
      let screenType: 'small' | 'standard' | 'large' = 'standard'
      if (width <= BREAKPOINTS.small) {
        screenType = 'small'
      } else if (width <= BREAKPOINTS.standard) {
        screenType = 'standard'
      } else {
        screenType = 'large'
      }

      return {
        width,
        height,
        screenType,
        isPortrait: height > width,
        safeAreaInsets: {
          top: systemInfo.safeArea?.top || 0,
          bottom: systemInfo.screenHeight - (systemInfo.safeArea?.bottom || systemInfo.screenHeight),
          left: systemInfo.safeArea?.left || 0,
          right: systemInfo.screenWidth - (systemInfo.safeArea?.right || systemInfo.screenWidth)
        }
      }
    } catch (error) {
      logger.warn('获取系统信息失败，使用默认值:', error)
      return {
        width: 375,
        height: 667,
        screenType: 'standard',
        isPortrait: true,
        safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
      }
    }
  })

  const updateScreenSize = useCallback(() => {
    try {
      const systemInfo = Taro.getSystemInfoSync()
      const width = systemInfo.screenWidth
      const height = systemInfo.screenHeight
      
      let screenType: 'small' | 'standard' | 'large'
      if (width <= BREAKPOINTS.small) {
        screenType = 'small'
      } else if (width <= BREAKPOINTS.standard) {
        screenType = 'standard'
      } else {
        screenType = 'large'
      }

      const newScreenSize: ScreenSize = {
        width,
        height,
        screenType,
        isPortrait: height > width,
        safeAreaInsets: {
          top: systemInfo.safeArea?.top || 0,
          bottom: systemInfo.screenHeight - (systemInfo.safeArea?.bottom || systemInfo.screenHeight),
          left: systemInfo.safeArea?.left || 0,
          right: systemInfo.screenWidth - (systemInfo.safeArea?.right || systemInfo.screenWidth)
        }
      }

      // 只在实际发生变化时更新状态，避免不必要的重渲染
      setScreenSize(prevSize => {
        if (
          prevSize.width !== newScreenSize.width ||
          prevSize.height !== newScreenSize.height ||
          prevSize.screenType !== newScreenSize.screenType ||
          prevSize.isPortrait !== newScreenSize.isPortrait
        ) {
          return newScreenSize
        }
        return prevSize
      })
    } catch (error) {
      logger.warn('更新屏幕尺寸失败:', error)
    }
  }, [])

  useEffect(() => {
    // 监听屏幕方向变化
    const handleOrientationChange = () => {
      // 延迟更新，确保系统信息已更新
      setTimeout(updateScreenSize, 100)
    }

    // 监听应用显示事件
    const handleAppShow = () => {
      updateScreenSize()
    }

    // 注册事件监听
    Taro.onAppShow(handleAppShow)
    
    // 某些平台支持设备运动变化监听（用于检测屏幕方向变化）
    if (typeof Taro.onDeviceMotionChange === 'function') {
      Taro.onDeviceMotionChange(handleOrientationChange)
    }

    return () => {
      // 清理事件监听
      if (typeof Taro.offAppShow === 'function') {
        Taro.offAppShow(handleAppShow)
      }
      if (typeof Taro.offDeviceMotionChange === 'function') {
        Taro.offDeviceMotionChange(handleOrientationChange)
      }
    }
  }, [updateScreenSize])

  // 返回 memoized 的结果，避免不必要的重渲染
  return useMemo(() => screenSize, [screenSize])
}