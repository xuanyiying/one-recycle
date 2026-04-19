import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import Taro from '@tarojs/taro'
import { FeatureItem, useMenu } from './useMenu'

vi.mock('@tarojs/taro', () => ({
  default: {
    navigateTo: vi.fn(),
    switchTab: vi.fn(),
    showToast: vi.fn(),
    setStorageSync: vi.fn(),
  },
}))

vi.mock('@/components/Icon', () => ({
  default: ({ name }: any) => `Icon-${name}`,
  Icon: ({ name }: any) => `Icon-${name}`
}))

describe('useMenu Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return correct menu items', () => {
    const { result } = renderHook(() => useMenu())
    const { features } = result.current
    expect(features).toHaveLength(3)
    expect(features[0]!.name).toBe('预约记录')
    expect(features[1]!.name).toBe('环保榜单')
    expect(features[2]!.name).toBe('回收规则')
  })

  it('should navigate to order page when order item is clicked', () => {
    const { result } = renderHook(() => useMenu())
    const orderItem = result.current.features.find(
      (f: FeatureItem) => f.key === 'order',
    )
    expect(orderItem).toBeDefined()
    if (orderItem) {
      result.current.handleFeatureClick(orderItem)
      expect(Taro.switchTab).toHaveBeenCalledWith(expect.objectContaining({
        url: '/pages/order/index'
      }))
    }
  })

  it('should navigate to rank page when rank item is clicked', () => {
    const { result } = renderHook(() => useMenu())
    const rankItem = result.current.features.find(
      (f: FeatureItem) => f.key === 'rank',
    )
    expect(rankItem).toBeDefined()
    if (rankItem) {
      result.current.handleFeatureClick(rankItem)
      expect(Taro.navigateTo).toHaveBeenCalledWith(expect.objectContaining({
        url: '/pages/rank/index'
      }))
    }
  })

  it('should navigate to recycle-rules page when service item is clicked', () => {
    const { result } = renderHook(() => useMenu())
    const serviceItem = result.current.features.find(
      (f: FeatureItem) => f.key === 'service',
    )
    expect(serviceItem).toBeDefined()
    if (serviceItem) {
      result.current.handleFeatureClick(serviceItem)
      expect(Taro.navigateTo).toHaveBeenCalledWith(expect.objectContaining({
        url: '/pages/recycle-rules/index'
      }))
    }
  })
})
