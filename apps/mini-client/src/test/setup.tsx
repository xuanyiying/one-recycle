import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock Taro Components
vi.mock('@tarojs/components', () => {
  const MockComponent = ({ children, ...props }: any) => {
    return React.createElement('div', props, children)
  }
  
  return {
    View: MockComponent,
    Text: MockComponent,
    Image: MockComponent,
    Button: MockComponent,
    Input: MockComponent,
    ScrollView: MockComponent,
    RichText: MockComponent,
    Icon: MockComponent,
    Block: ({ children }: any) => children,
  }
})

// Global Taro Mock (can be overridden in individual tests)
vi.mock('@tarojs/taro', () => {
  return {
    default: {
      getStorageSync: vi.fn(),
      setStorageSync: vi.fn(),
      getStorage: vi.fn(),
      setStorage: vi.fn(),
      request: vi.fn(),
      getCurrentPages: vi.fn().mockReturnValue([]),
      navigateTo: vi.fn(),
      redirectTo: vi.fn(),
      switchTab: vi.fn(),
      reLaunch: vi.fn(),
      navigateBack: vi.fn(),
      showToast: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      showModal: vi.fn(),
      createSelectorQuery: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        boundingClientRect: vi.fn().mockReturnThis(),
        exec: vi.fn(),
      }),
      useDidShow: vi.fn(),
      useRouter: vi.fn().mockReturnValue({ params: {} }),
      pxTransform: (size: number) => size + 'px',
    },
    useDidShow: vi.fn(),
    useRouter: vi.fn().mockReturnValue({ params: {} }),
  }
})
