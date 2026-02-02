import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMenu } from './useMenu'
import Taro from '@tarojs/taro'
import { renderHook } from '@testing-library/react'

vi.mock('@tarojs/taro', () => ({
  default: {
    navigateTo: vi.fn(),
    showToast: vi.fn(),
  },
}))

vi.mock('@nutui/icons-react-taro', () => ({
  Order: () => 'OrderIcon',
  Cart: () => 'CartIcon',
  Star: () => 'StarIcon',
  Service: () => 'ServiceIcon',
}))

describe('useMenu Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return correct menu items', () => {
    const { result } = renderHook(() => useMenu())
    expect(result.current.features).toHaveLength(4)
    expect(result.current.features[0].name).toBe('预约记录')
    expect(result.current.features[1].name).toBe('积分商城')
    expect(result.current.features[2].name).toBe('环保榜单')
    expect(result.current.features[3].name).toBe('服务说明')
  })

  it('should navigate to order page when order item is clicked', () => {
    const { result } = renderHook(() => useMenu())
    const orderItem = result.current.features.find(f => f.key === 'order')
    expect(orderItem).toBeDefined()
    if (orderItem) {
      result.current.handleFeatureClick(orderItem)
      expect(Taro.navigateTo).toHaveBeenCalledWith(expect.objectContaining({
        url: '/pages/order/index'
      }))
    }
  })

  it('should show toast for mall item', () => {
    const { result } = renderHook(() => useMenu())
    const mallItem = result.current.features.find(f => f.key === 'mall')
    expect(mallItem).toBeDefined()
    if (mallItem) {
      result.current.handleFeatureClick(mallItem)
      expect(Taro.showToast).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining('积分商城')
      }))
    }
  })

  it('should show toast for rank item', () => {
    const { result } = renderHook(() => useMenu())
    const rankItem = result.current.features.find(f => f.key === 'rank')
    expect(rankItem).toBeDefined()
    if (rankItem) {
      result.current.handleFeatureClick(rankItem)
      expect(Taro.navigateTo).toHaveBeenCalledWith(expect.objectContaining({
        url: '/pages/rank/index'
      }))
    }
  })

  it('should navigate to service agreement page when service item is clicked', () => {
    const { result } = renderHook(() => useMenu())
    const serviceItem = result.current.features.find(f => f.key === 'service')
    expect(serviceItem).toBeDefined()
    if (serviceItem) {
      result.current.handleFeatureClick(serviceItem)
      expect(Taro.navigateTo).toHaveBeenCalledWith(expect.objectContaining({
        url: '/pages/agreement/index?type=user'
      }))
    }
  })
})
