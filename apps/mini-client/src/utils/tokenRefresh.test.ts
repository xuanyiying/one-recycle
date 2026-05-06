import { describe, it, expect, vi, beforeEach } from 'vitest'
import Taro from '@tarojs/taro'
import { attemptTokenRefresh } from './request'

// Mock Taro
vi.mock('@tarojs/taro', () => {
  return {
    default: {
      getStorageSync: vi.fn(),
      setStorageSync: vi.fn(),
      removeStorageSync: vi.fn(),
      clearStorageSync: vi.fn(),
      request: vi.fn(),
      showToast: vi.fn(),
      redirectTo: vi.fn()
    }
  }
})

describe('Token Refresh Mechanism', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset module state if possible, but since 'refreshing' is module-level, 
    // we might need to rely on the fact that it resets after each call resolves.
    // Ideally we would export a reset function for testing, but for now assuming
    // tests run sequentially and wait for completion.
  })

  it('should return null if no refreshToken is present', async () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('')
    
    const result = await attemptTokenRefresh()
    
    expect(result).toBeNull()
    expect(Taro.request).not.toHaveBeenCalled()
  })

  it('should successfully refresh token', async () => {
    const mockRefreshToken = 'mock-refresh-token'
    const mockNewToken = 'new-access-token'
    
    vi.mocked(Taro.getStorageSync).mockReturnValue(mockRefreshToken)
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 200,
      data: {
        accessToken: mockNewToken
      }
    } as any)

    const result = await attemptTokenRefresh()

    expect(result).toBe(mockNewToken)
    expect(Taro.request).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining('/auth/refresh'),
      method: 'POST',
      data: { refreshToken: mockRefreshToken }
    }))
    expect(Taro.setStorageSync).toHaveBeenCalledWith('token', mockNewToken)
  })

  it('should handle refresh failure (non-2xx response)', async () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('mock-refresh-token')
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 400,
      data: { message: 'Invalid token' }
    } as any)

    const result = await attemptTokenRefresh()

    expect(result).toBeNull()
    expect(Taro.setStorageSync).not.toHaveBeenCalled()
  })

  it('should handle network error during refresh', async () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('mock-refresh-token')
    vi.mocked(Taro.request).mockRejectedValue(new Error('Network error'))

    const result = await attemptTokenRefresh()

    expect(result).toBeNull()
  })

  it('should prevent concurrent refresh requests', async () => {
    const mockRefreshToken = 'mock-refresh-token'
    const mockNewToken = 'new-access-token'
    
    vi.mocked(Taro.getStorageSync).mockReturnValue(mockRefreshToken)
    
    // Simulate a slow request
    vi.mocked(Taro.request).mockImplementation(() => {
      const p: any = new Promise(resolve => setTimeout(() => {
        resolve({
          statusCode: 200,
          data: { accessToken: mockNewToken }
        })
      }, 50))
      
      p.abort = vi.fn()
      p.onHeadersReceived = vi.fn()
      p.offHeadersReceived = vi.fn()
      p.onChunkReceived = vi.fn()
      p.offChunkReceived = vi.fn()
      
      return p
    })

    // Call twice rapidly
    const promise1 = attemptTokenRefresh()
    const promise2 = attemptTokenRefresh()

    // Since attemptTokenRefresh is an async function, it returns a new Promise wrapper each time.
    // We verify deduping by checking that the underlying request is only called once.

    const [result1, result2] = await Promise.all([promise1, promise2])

    expect(result1).toBe(mockNewToken)
    expect(result2).toBe(mockNewToken)
    expect(Taro.request).toHaveBeenCalledTimes(1)
  })
})
