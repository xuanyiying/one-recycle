import { AuthService } from '@/services/auth'
import Taro from '@tarojs/taro'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('Token Refresh Mechanism (AuthService.refreshToken)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return failure if no refreshToken is present', async () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('')

    const result = await AuthService.refreshToken()

    expect(result.success).toBe(false)
    expect(Taro.request).not.toHaveBeenCalled()
  })

  it('should successfully refresh token', async () => {
    const mockRefreshToken = 'mock-refresh-token'
    const mockNewToken = 'new-access-token'

    vi.mocked(Taro.getStorageSync).mockImplementation((key: string) => {
      if (key === 'refreshToken') return mockRefreshToken
      return ''
    })
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 200,
      data: {
        data: { accessToken: mockNewToken }
      }
    } as any)

    const result = await AuthService.refreshToken()

    expect(result.success).toBe(true)
    expect(result.token).toBe(mockNewToken)
    expect(Taro.request).toHaveBeenCalledWith(expect.objectContaining({
      url: expect.stringContaining('/auth/refresh'),
      method: 'POST',
      data: { refreshToken: mockRefreshToken }
    }))
    expect(Taro.setStorageSync).toHaveBeenCalledWith('token', mockNewToken)
  })

  it('should handle refresh failure (non-2xx response)', async () => {
    vi.mocked(Taro.getStorageSync).mockImplementation((key: string) => {
      if (key === 'refreshToken') return 'mock-refresh-token'
      return ''
    })
    vi.mocked(Taro.request).mockResolvedValue({
      statusCode: 400,
      data: { message: 'Invalid token' }
    } as any)

    const result = await AuthService.refreshToken()

    expect(result.success).toBe(false)
  })

  it('should handle network error during refresh', async () => {
    vi.mocked(Taro.getStorageSync).mockImplementation((key: string) => {
      if (key === 'refreshToken') return 'mock-refresh-token'
      return ''
    })
    vi.mocked(Taro.request).mockRejectedValue(new Error('Network error'))

    const result = await AuthService.refreshToken()

    expect(result.success).toBe(false)
  })

  it('should prevent concurrent refresh requests', async () => {
    const mockRefreshToken = 'mock-refresh-token'
    const mockNewToken = 'new-access-token'

    vi.mocked(Taro.getStorageSync).mockImplementation((key: string) => {
      if (key === 'refreshToken') return mockRefreshToken
      return ''
    })

    vi.mocked(Taro.request).mockImplementation(() => {
      const p: any = new Promise(resolve => setTimeout(() => {
        resolve({
          statusCode: 200,
          data: { data: { accessToken: mockNewToken } }
        })
      }, 50))

      p.abort = vi.fn()
      p.onHeadersReceived = vi.fn()
      p.offHeadersReceived = vi.fn()
      p.onChunkReceived = vi.fn()
      p.offChunkReceived = vi.fn()

      return p
    })

    const promise1 = AuthService.refreshToken()
    const promise2 = AuthService.refreshToken()

    const [result1, result2] = await Promise.all([promise1, promise2])

    expect(result1.success).toBe(true)
    expect(result2.success).toBe(true)
    expect(Taro.request).toHaveBeenCalledTimes(1)
  })
})
