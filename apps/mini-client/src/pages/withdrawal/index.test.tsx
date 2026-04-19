import { render, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import accountService from '@/services/account'
import withdrawalService from '@/services/withdrawal'
import WalletPage from './index'

// Mock services
vi.mock('@/services/account')
vi.mock('@/services/withdrawal')
vi.mock('@/components/Icon', () => ({
  default: ({ name }: any) => <div>Icon-{name}</div>,
  Icon: ({ name }: any) => <div>Icon-{name}</div>
}))
vi.mock('@/components/AuthGuard', () => ({
  default: ({ children }: any) => <div>{children}</div>
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { openid: 'test', realName: 'Test' } })
}))
vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
    navigateTo: vi.fn(),
    getSystemInfoSync: () => ({ safeArea: { top: 20, bottom: 800 } }),
    getCurrentPages: vi.fn(() => [{ route: 'pages/withdrawal/index' }]),
  },
  useDidShow: vi.fn(),
}))
vi.mock('@nutui/nutui-react-taro', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Popup: ({ children, visible }: any) =>
    visible ? <div>{children}</div> : null,
  Input: ({ onChange, value, ...props }: any) => (
    <input
      onChange={(e: any) => onChange(e.target.value)}
      value={value}
      {...props}
    />
  ),
  Loading: ({ children }: any) => <div>{children}</div>,
}))

describe('WalletPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly and handles transactions', async () => {
    // Mock account data
    vi.mocked(accountService.getMyAccount).mockResolvedValue({
      id: '1',
      userId: '1',
      availableBalance: 100,
      frozenBalance: 0
    } as any)

    // Mock transactions
    vi.mocked(accountService.getMyTransactions).mockResolvedValue({
      transactions: [],
      total: 0
    } as any)

    const { getByText } = render(<WalletPage />)

    await waitFor(() => {
      expect(getByText('我的钱包')).toBeTruthy()
      expect(getByText('¥100.00')).toBeTruthy()
    })
  })

  it('handles undefined transactions gracefully', async () => {
    vi.mocked(accountService.getMyAccount).mockResolvedValue({
        availableBalance: 0,
        frozenBalance: 0
    } as any)
    
    vi.mocked(accountService.getMyTransactions).mockResolvedValue({} as any)

    const { getByText } = render(<WalletPage />)

    await waitFor(() => {
      expect(getByText('暂无明细记录')).toBeTruthy()
    })
  })

  it('handles withdrawal flow', async () => {
    vi.mocked(accountService.getMyAccount).mockResolvedValue({
      availableBalance: 100,
      frozenBalance: 0
    } as any)
    vi.mocked(accountService.getMyTransactions).mockResolvedValue({ transactions: [] } as any)

    const { getByText, getByPlaceholderText } = render(<WalletPage />)

    // Click withdraw button
    fireEvent.click(getByText('立即提现'))

    await waitFor(() => {
      expect(getByText('提现到微信零钱')).toBeTruthy()
    })

    // Input amount
    const input = getByPlaceholderText('请输入提现金额')
    fireEvent.change(input, { target: { value: '50' } })

    // Confirm
    fireEvent.click(getByText('确认提现'))

    await waitFor(() => {
      expect(withdrawalService.createWithdrawal).toHaveBeenCalledWith(expect.objectContaining({
        amount: 50
      }))
    })
  })
})
