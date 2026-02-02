import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import ItemForm from './index'
import * as CategoryService from '../../../services/category'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
    pageScrollTo: vi.fn()
  }
}))

// Mock components
vi.mock('@tarojs/components', () => ({
  View: ({ children, className }: any) => <div className={className}>{children}</div>,
  Text: ({ children, className }: any) => <span className={className}>{children}</span>,
  Button: ({ children, onClick, className }: any) => <button className={className} onClick={onClick}>{children}</button>,
  ScrollView: ({ children, className }: any) => <div className={className}>{children}</div>,
  Picker: ({ children, onChange }: any) => (
    <div data-testid="picker" onClick={() => onChange({ detail: { value: 0 } })}>
      {children}
    </div>
  )
}))

vi.mock('../../CategorySelector', () => ({
  default: () => <div data-testid="category-selector">Category Selector</div>
}))

vi.mock('../../ImageUploader', () => ({
  default: () => <div data-testid="image-uploader">Image Uploader</div>
}))

vi.mock('../PriceEstimate', () => ({
  default: () => <div data-testid="price-estimate">Price Estimate</div>
}))

vi.mock('./ItemList', () => ({
  default: () => <div data-testid="item-list">Item List</div>
}))

vi.mock('./ItemDetailsForm', () => ({
  default: () => <div data-testid="item-details-form">Item Details Form</div>
}))

describe('ItemForm Title Dynamic Rendering', () => {
  const mockCategories = [
    { id: 1, name: '旧书', seo: { slug: 'books' } },
    { id: 2, name: '旧衣', seo: { slug: 'clothing' } },
    { id: 3, name: '电子产品', seo: { slug: 'electronics' } }
  ]

  beforeEach(() => {
    vi.spyOn(CategoryService, 'getActiveCategories').mockResolvedValue(mockCategories as any)
  })

  it('should render default title when no initial category provided', async () => {
    render(<ItemForm onNext={vi.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('添加回收物品')).toBeDefined()
    })
  })

  it('should render dynamic title for books category', async () => {
    render(<ItemForm onNext={vi.fn()} initialCategory="books" />)
    
    await waitFor(() => {
      // Should append '回收' to '旧书'
      expect(screen.getByText('旧书回收')).toBeDefined()
    })
  })

  it('should render dynamic title for clothing category', async () => {
    render(<ItemForm onNext={vi.fn()} initialCategory="clothing" />)
    
    await waitFor(() => {
      // Should append '回收' to '旧衣'
      expect(screen.getByText('旧衣回收')).toBeDefined()
    })
  })

  it('should render correct title if category name already contains "回收"', async () => {
    const categoriesWithSuffix = [
      { id: 4, name: '家电回收', seo: { slug: 'appliances' } }
    ]
    vi.spyOn(CategoryService, 'getActiveCategories').mockResolvedValue(categoriesWithSuffix as any)
    
    render(<ItemForm onNext={vi.fn()} initialCategory="appliances" />)
    
    await waitFor(() => {
      // Use selector to target the title specifically, avoiding conflict with "Current category" display
      const titles = screen.getAllByText('家电回收')
      const headerTitle = titles.find(el => el.className === 'form-title')
      expect(headerTitle).toBeDefined()
    })
  })
})
