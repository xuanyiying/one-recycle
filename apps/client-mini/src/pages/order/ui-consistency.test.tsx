// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import IndexPage from '../index/index'
import OrderListPage from './index'

// Mock styles
vi.mock('../index/index.scss', () => ({}))
vi.mock('./index.scss', () => ({}))

// Mock dependencies
vi.mock('@tarojs/taro', () => ({
  default: {
    usePullDownRefresh: vi.fn(),
    useDidShow: vi.fn(),
    getStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
    navigateTo: vi.fn(),
    showToast: vi.fn(),
    stopPullDownRefresh: vi.fn(),
    getSystemInfoSync: () => ({ safeArea: { top: 20, bottom: 800 } }),
    getCurrentPages: vi.fn(() => [])
  },
  usePullDownRefresh: vi.fn(),
  useDidShow: vi.fn(),
}))

vi.mock('@tarojs/components', () => ({
  View: (props) => <div {...props} />,
  Text: (props) => <span {...props} />,
  Image: (props) => <img {...props} />,
  ScrollView: (props) => <div {...props} />,
  Button: (props) => <button {...props} />,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', nickname: 'Test User' },
    isLoggedIn: true,
    loading: false,
    checkAuthStatus: vi.fn()
  })
}))

// Mock services
vi.mock('@/services/system', () => ({
  getQAList: vi.fn().mockResolvedValue({ success: true, data: [] }),
  getNewsBriefs: vi.fn().mockResolvedValue({ success: true, data: [] })
}))

vi.mock('@/services/order', () => ({
  getUserOrders: vi.fn().mockResolvedValue({ success: true, data: [] })
}))

// Mock AuthGuard
vi.mock('@/components/AuthGuard', () => ({
  default: ({ children }) => <div>{children}</div>
}))

// Mock NutUI components
vi.mock('@nutui/nutui-react-taro', () => ({
  Popup: ({ visible, children }) => visible ? <div data-testid="popup">{children}</div> : null
}))

vi.mock('@nutui/icons-react-taro', () => ({
  Location: () => null,
  Edit: () => null,
  Star: () => null,
  Close: () => null,
  Order: () => null,
  Cart: () => null,
  Service: () => null,
}))

// Mock assets
vi.mock('@/assets/images/empty-box.png', () => ({ default: 'empty-box.png' }))

// Mock RecycleCard with data attributes for testing
vi.mock('@/components/RecycleCard', () => ({
  RecycleCard: (props) => (
    <div 
      data-testid="recycle-card" 
      data-type={props.type} 
      className={props.className} 
      onClick={props.onClick}
    >
      RecycleCard-{props.type}
    </div>
  )
}))

// Mock navigation hook
const { mockHandleRecycleClick } = vi.hoisted(() => {
  return { mockHandleRecycleClick: vi.fn() }
})

vi.mock('../index/useRecycleNavigation', () => ({
  useRecycleNavigation: () => ({
    handleRecycleClick: mockHandleRecycleClick
  })
}))

// Mock useMenu just in case
vi.mock('../index/useMenu', () => ({
  useMenu: () => ({
    features: [],
    handleFeatureClick: vi.fn()
  })
}))

describe('UI Consistency: Recycle Entry Points', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render consistent RecycleCard components in Home Page', async () => {
    const { getAllByTestId } = render(<IndexPage />)
    
    // Wait for render
    await waitFor(() => {
      const cards = getAllByTestId('recycle-card')
      expect(cards).toHaveLength(2)
      
      // Verify Book Card
      expect(cards[0]).toHaveAttribute('data-type', 'book')
      expect(cards[0]).toHaveClass('home-action-card')
      
      // Verify Clothes Card
      expect(cards[1]).toHaveAttribute('data-type', 'clothes')
      expect(cards[1]).toHaveClass('home-action-card')
    })
    
    const cards = getAllByTestId('recycle-card')
    // Verify Click Handler
    fireEvent.click(cards[0])
    expect(mockHandleRecycleClick).toHaveBeenCalledWith('book')
    
    fireEvent.click(cards[1])
    expect(mockHandleRecycleClick).toHaveBeenCalledWith('clothes')
  })

  it('should render consistent RecycleCard components in Order Page Popup', async () => {
    const { getByText, getAllByTestId, queryByTestId, queryByText } = render(<OrderListPage />)
    
    // Wait for loading to finish and "立即下单" to appear
    await waitFor(() => {
        expect(queryByText('加载中...')).toBeNull()
        expect(getByText('立即下单')).toBeTruthy()
    }, { timeout: 3000 })
    
    // Popup should be hidden initially
    expect(queryByTestId('popup')).toBeNull()
    
    // Open Popup
    fireEvent.click(getByText('立即下单'))
    
    // Check Popup visibility
    await waitFor(() => {
        expect(queryByTestId('popup')).toBeTruthy()
    })
    
    // Check if RecycleCards are rendered inside Popup
    const cards = getAllByTestId('recycle-card')
    expect(cards).toHaveLength(2)
    
    // Verify Book Card
    expect(cards[0]).toHaveAttribute('data-type', 'book')
    // Note: Order page uses 'popup-action-card' class for width adjustment
    expect(cards[0]).toHaveClass('popup-action-card') 
    
    // Verify Clothes Card
    expect(cards[1]).toHaveAttribute('data-type', 'clothes')
    expect(cards[1]).toHaveClass('popup-action-card')
    
    // Verify Book Click Handler
    fireEvent.click(cards[0])
    expect(mockHandleRecycleClick).toHaveBeenCalledWith('book')
    
    // Popup closes after click. Re-open it to test second card
    fireEvent.click(getByText('立即下单'))
    await waitFor(() => {
        expect(queryByTestId('popup')).toBeTruthy()
    })
    
    const newCards = getAllByTestId('recycle-card')
    // Verify Clothes Click Handler
    fireEvent.click(newCards[1])
    expect(mockHandleRecycleClick).toHaveBeenCalledWith('clothes')
  })
})
