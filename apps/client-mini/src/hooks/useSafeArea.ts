import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'

export interface SafeArea {
  top: number
  bottom: number
  left: number
  right: number
  height: number
  width: number
  insetTop: number
  insetBottom: number
}

export const useSafeArea = (): SafeArea => {
  const [safeArea, setSafeArea] = useState<SafeArea>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
    width: 0,
    insetTop: 0,
    insetBottom: 0,
  })

  useEffect(() => {
    try {
      const systemInfo = Taro.getSystemInfoSync()
      const { safeArea: sysSafeArea, screenHeight } = systemInfo

      if (sysSafeArea) {
        setSafeArea({
          top: sysSafeArea.top,
          bottom: sysSafeArea.bottom,
          left: sysSafeArea.left,
          right: sysSafeArea.right,
          height: sysSafeArea.height,
          width: sysSafeArea.width,
          insetTop: sysSafeArea.top,
          insetBottom: screenHeight - sysSafeArea.bottom,
        })
      }
    } catch (error) {
      console.error('Failed to get system info', error)
    }
  }, [])

  return safeArea
}
