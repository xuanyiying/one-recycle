import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from './useAuth'
import { AppProvider } from '../store'
import { AuthService } from '../services/auth'
import Taro from '@tarojs/taro'
import React from 'react'

// Mock Taro
vi.mock('@tarojs/taro', () => {
  return {
    default: {
      getStorageSync: vi.fn(),
      setStorageSync: vi.fn(),
      removeStorageSync: vi.fn(),
      getEnv: vi.fn().mockReturnValue('WEAPP'),
      ENV_TYPE: { WEB: 'WEB', WEAPP: 'WEAPP' }
    }
  }
})

// Mock AuthService
vi.mock('../services/auth', () => {
  return {
    AuthService: {
      checkLoginStatus: vi.fn(),
      refreshToken: vi.fn(),
      getUserInfo: vi.fn(),
      saveLoginInfo: vi.fn(),
      logout: vi.fn()
    }
  }
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mocks
    vi.mocked(Taro.getStorageSync).mockReturnValue('')
    vi.mocked(AuthService.checkLoginStatus).mockReturnValue({ isLoggedIn: false })
  })

  it('should initialize with no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(false)
    })
  })

  it('should try to refresh token if refreshToken exists but no token', async () => {
    vi.mocked(Taro.getStorageSync).mockImplementation((key) => {
      if (key === 'refreshToken') return 'mock-refresh-token'
      return ''
    })

    vi.mocked(AuthService.refreshToken).mockResolvedValue({ success: true, token: 'new-token' })
    vi.mocked(AuthService.getUserInfo).mockResolvedValue({ 
      success: true, 
      data: { id: '1', nickname: 'User' } as any 
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    // Manually trigger checkAuthStatus
    await result.current.checkAuthStatus()
    
    await waitFor(() => {
      expect(AuthService.refreshToken).toHaveBeenCalled()
      expect(result.current.isLoggedIn).toBe(true)
      expect(result.current.token).toBe('new-token')
    })
  })

  it('should logout if refresh fails', async () => {
    vi.mocked(Taro.getStorageSync).mockImplementation((key) => {
      if (key === 'refreshToken') return 'mock-refresh-token'
      return ''
    })

    vi.mocked(AuthService.refreshToken).mockResolvedValue({ success: false })
    
    const { result } = renderHook(() => useAuth(), { wrapper })

    await result.current.checkAuthStatus()

    await waitFor(() => {
      expect(AuthService.refreshToken).toHaveBeenCalled()
      expect(result.current.isLoggedIn).toBe(false)
      // Check if LOGOUT dispatch happened (state cleared)
      // Since we don't spy on dispatch directly, we check state
      expect(result.current.user).toBeNull()
    })
  })
})
