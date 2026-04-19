// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { getUserOrders } from '@/services/order'
import OrderListPage from './index'

// Mock dependencies
vi.mock('@tarojs/components', () => ({
  View: (props: any) => <div {...props} />,
  Text: (props: any) => <span {...props} />,
  ScrollView: (props: any) => <div {...props} />,
  Button: (props: any) => <button {...props} />,
  Image: (props: any) => <img {...props} />,
}))

vi.mock('@tarojs/taro', () => ({
  default: {
    useDidShow: vi.fn(), // Do not execute callback immediately
    getStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
    navigateTo: vi.fn(),
    showToast: vi.fn(),
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/services/order', () => ({
  getUserOrders: vi.fn(),
}))

// Mock AuthGuard to verify props
vi.mock('@/components/AuthGuard', () => ({
  default: vi.fn(({ children, redirectTo }: any) => (
    <div data-testid="auth-guard" data-redirect-to={redirectTo}>
      {children}
    </div>
  )),
}))

vi.mock('@/utils/cdn', () => ({
  getCdnUrl: vi.fn(),
}))

vi.mock('@nutui/nutui-react-taro', () => ({
  Popup: () => null,
}))

vi.mock('@/components/Icon', () => ({
  default: ({ name }: any) => <div data-testid={`icon-${name}`} />
}))

vi.mock('@/assets/images/empty-box.webp', () => ({
  default: 'empty-box.webp'
}))

vi.mock('@/components/RecycleCard', () => ({
  RecycleCard: (props: any) => <div data-testid="recycle-card" {...props} />
}))

vi.mock('../index/useRecycleNavigation', () => ({
  useRecycleNavigation: () => ({
    handleRecycleClick: vi.fn()
  })
}))

vi.mock('./index.scss', () => ({}))

describe('OrderListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not load orders when user is not logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoggedIn: false,
      checkAuthStatus: vi.fn(),
    } as any)

    render(<OrderListPage />)
    
    // Wait for useEffect
    await waitFor(() => {})

    expect(getUserOrders).not.toHaveBeenCalled()
    expect(Taro.showToast).not.toHaveBeenCalled()
  })

  it('should load orders when user is logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '123' },
      isLoggedIn: true,
      checkAuthStatus: vi.fn(),
    } as any)
    vi.mocked(getUserOrders).mockResolvedValue({ success: true, data: [] } as any)

    render(<OrderListPage />)

    await waitFor(() => {
      expect(getUserOrders).toHaveBeenCalledWith('123')
    })
  })

  it('should handle orders under data.orders', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '123' },
      isLoggedIn: true,
      checkAuthStatus: vi.fn(),
    } as any)
    vi.mocked(getUserOrders).mockResolvedValue({
      success: true,
      data: {
        orders: [
          {
            id: 2,
            status: 'PENDING',
            createdAt: '2026-02-05T11:55:40.187Z',
            items: [{ categoryId: 2, categoryName: '旧书', photos: [] }],
            estimatedAmount: 0,
          },
        ],
      },
    } as any)

    render(<OrderListPage />)

    await waitFor(() => {
      expect(getUserOrders).toHaveBeenCalledWith('123')
    })
  })
})
