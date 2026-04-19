import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useRouter } from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import RecycleForm from './index'

vi.mock('@tarojs/taro', () => ({
  default: {
    useRouter: vi.fn(),
  },
  useRouter: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/components/AuthGuard', () => ({
  default: ({ children }: any) => <div data-testid="auth-guard">{children}</div>,
}))

vi.mock('@/components/ErrorBoundary', () => ({
  default: ({ children }: any) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}))

vi.mock('@/components/OrderCreationFlow', () => ({
  default: ({ initialCategory, userId }: any) => (
    <div data-testid="order-creation-flow" data-category={initialCategory} data-user-id={userId} />
  ),
}))

vi.mock('@/store/orderStore', () => ({
  OrderStoreProvider: ({ children }: any) => (
    <div data-testid="order-store">{children}</div>
  ),
}))

vi.mock('@/utils/errorTracker', () => ({
  errorTracker: { captureError: vi.fn() },
}))

describe('RecycleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({ params: {} } as any)
  })

  it('shows loading state when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: false,
      loading: true,
      user: null,
    } as any)

    render(<RecycleForm />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('shows redirect hint when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: false,
      loading: false,
      user: null,
    } as any)

    render(<RecycleForm />)
    expect(screen.getByText('正在跳转...')).toBeInTheDocument()
  })

  it('renders order flow when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: true,
      loading: false,
      user: { id: 'user-1' },
    } as any)
    vi.mocked(useRouter).mockReturnValue({ params: { categoryId: '1' } } as any)

    render(<RecycleForm />)

    const flow = screen.getByTestId('order-creation-flow')
    expect(flow).toBeInTheDocument()
    expect(flow.getAttribute('data-category')).toBe('1')
    expect(flow.getAttribute('data-user-id')).toBe('user-1')
  })
})
