import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AuthGuard from './index'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    getCurrentPages: vi.fn(),
    navigateTo: vi.fn(),
    reLaunch: vi.fn(),
  },
  useDidShow: vi.fn(),
}))

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('AuthGuard Component', () => {
  const mockNavigateTo = Taro.navigateTo as any
  const mockGetCurrentPages = Taro.getCurrentPages as any

  beforeEach(() => {
    vi.clearAllMocks()
    // Default current page
    mockGetCurrentPages.mockReturnValue([{ route: 'pages/profile/index', options: { id: '123' } }])
  })

  it('should render loading state when checking auth', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: false,
      loading: true,
      checkAuthStatus: vi.fn(),
    } as any)

    const { getByText } = render(
      <AuthGuard>
        <div data-testid="child">Child Content</div>
      </AuthGuard>
    )

    expect(getByText('加载中...')).toBeDefined()
  })

  it('should render children when logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: true,
      loading: false,
      checkAuthStatus: vi.fn(),
    } as any)

    const { getByText } = render(
      <AuthGuard>
        <div>Child Content</div>
      </AuthGuard>
    )

    expect(getByText('Child Content')).toBeDefined()
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })

  it('should redirect to login when not logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: false,
      loading: false,
      checkAuthStatus: vi.fn(),
    } as any)

    render(
      <AuthGuard>
        <div>Child Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
      expect(mockNavigateTo).toHaveBeenCalledWith({
        url: '/pages/login/index?redirect=%2Fpages%2Fprofile%2Findex%3Fid%3D123',
        fail: expect.any(Function)
      })
    })
  })

  it('should use provided redirectTo prop', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: false,
      loading: false,
      checkAuthStatus: vi.fn(),
    } as any)

    render(
      <AuthGuard redirectTo="/pages/custom/login">
        <div>Child Content</div>
      </AuthGuard>
    )

    await waitFor(() => {
        // Should append redirect param if not present
      expect(mockNavigateTo).toHaveBeenCalledWith({
        url: '/pages/custom/login?redirect=%2Fpages%2Fprofile%2Findex%3Fid%3D123',
        fail: expect.any(Function)
      })
    })
  })
})
