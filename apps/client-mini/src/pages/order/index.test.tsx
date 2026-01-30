import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import OrderListPage from './index'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { getUserOrders } from '@/services/order'

// Mock dependencies
vi.mock('@tarojs/components', () => ({
  View: (props) => <div {...props} />,
  Text: (props) => <span {...props} />,
  ScrollView: (props) => <div {...props} />,
  Button: (props) => <button {...props} />,
  Image: (props) => <img {...props} />,
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
  default: vi.fn(({ children, redirectTo }) => (
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

vi.mock('@nutui/icons-react-taro', () => ({
  Edit: () => null,
  Star: () => null,
  Close: () => null,
}))

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
})
