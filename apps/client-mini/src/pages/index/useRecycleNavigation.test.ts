import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRecycleNavigation } from './useRecycleNavigation'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    navigateTo: vi.fn(),
    showToast: vi.fn(),
    getCurrentPages: vi.fn(() => [{ route: 'pages/index/index' }]),
  },
}))

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('useRecycleNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should navigate to recycle page when logged in', async () => {
    // Setup mock for logged in state
    const mockCheckAuthStatus = vi.fn().mockResolvedValue({ isLoggedIn: true })
    vi.mocked(useAuth).mockReturnValue({
      checkAuthStatus: mockCheckAuthStatus,
      user: { id: '1', nickname: 'Test User' }, // Add other necessary user properties if needed
    } as any)

    const { result } = renderHook(() => useRecycleNavigation())

    await result.current.handleRecycleClick('book')

    expect(mockCheckAuthStatus).toHaveBeenCalled()
    expect(Taro.navigateTo).toHaveBeenCalledWith({
      url: '/pages/recycle/index?category=book',
    })
  })

  it('should redirect to login page when not logged in', async () => {
    // Setup mock for not logged in state
    const mockCheckAuthStatus = vi.fn().mockResolvedValue({ isLoggedIn: false })
    vi.mocked(useAuth).mockReturnValue({
      checkAuthStatus: mockCheckAuthStatus,
      user: null,
    } as any)

    const { result } = renderHook(() => useRecycleNavigation())

    await result.current.handleRecycleClick('clothes')

    expect(mockCheckAuthStatus).toHaveBeenCalled()
    expect(Taro.navigateTo).toHaveBeenCalledWith({
      url: `/pages/login/index?redirect=${encodeURIComponent('/pages/index/index')}`,
    })
  })

  it('should handle auth check failure', async () => {
    // Setup mock for error state
    const mockCheckAuthStatus = vi.fn().mockRejectedValue(new Error('Auth service error'))
    vi.mocked(useAuth).mockReturnValue({
      checkAuthStatus: mockCheckAuthStatus,
      user: null,
    } as any)

    const { result } = renderHook(() => useRecycleNavigation())

    await result.current.handleRecycleClick('book')

    expect(mockCheckAuthStatus).toHaveBeenCalled()
    expect(Taro.showToast).toHaveBeenCalledWith({
      title: '验证失败，请重试',
      icon: 'none',
    })
  })
})
