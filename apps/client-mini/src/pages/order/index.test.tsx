import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import OrderListPage from './index'
import Taro from '@tarojs/taro'

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
    useDidShow: vi.fn(),
    getStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
    navigateTo: vi.fn(),
    showToast: vi.fn(),
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1' },
    checkAuthStatus: vi.fn(),
  })),
}))

vi.mock('@/services/order', () => ({
  getUserOrders: vi.fn().mockResolvedValue({ success: true, data: [] }),
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
  it('should render AuthGuard with correct redirectTo prop', () => {
    const { getByTestId } = render(<OrderListPage />)
    const authGuard = getByTestId('auth-guard')
    
    expect(authGuard.getAttribute('data-redirect-to')).toBe(
      `/pages/login/index?redirect=${encodeURIComponent('/pages/order/index')}`
    )
  })
})
