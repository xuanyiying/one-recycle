import { describe, it, expect, vi, beforeEach } from 'vitest'
import Taro from '@tarojs/taro'
import { authMockData, mockUsers, MockAutoLogin } from './auth'

// Mock Taro
vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: vi.fn(),
    setStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
    showToast: vi.fn(),
    showModal: vi.fn(),
    reLaunch: vi.fn(),
    getLaunchOptionsSync: vi.fn().mockReturnValue({ query: {} })
  }
}))

// Mock ENV_CONFIG
vi.mock('@/config/env', () => ({
  ENV_CONFIG: {
    USE_MOCK_DATA: true
  }
}))

describe('Mock Auth Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API Mock Functions', () => {
    it('mockLogin should return success response with mock user', async () => {
      const params = { phone: '13800138000', code: '1234', platform: 'wechat' as const, nickname: 'Test' }
      const response = await authMockData.login(params)
      
      expect(response.success).toBe(true)
      expect(response.data?.user.nickname).toBe(mockUsers[0].nickname)
      expect(response.data?.tokens.accessToken).toContain('mock_token_')
    })

    it('mockGetUserInfo should return success response with mock user', async () => {
      const response = await authMockData.getUserInfo()
      
      expect(response.success).toBe(true)
      expect(response.data?.nickname).toBe(mockUsers[0].nickname)
    })

    it('mockWechatLogin should return success with provided nickname', async () => {
      const params = { code: 'wechat_code', nickname: 'New User' }
      const response = await authMockData.wechatLogin(params)
      
      expect(response.success).toBe(true)
      expect(response.data?.user.nickname).toBe('New User')
      expect(response.data?.tokens.accessToken).toContain('wechat_token_')
    })
  })

  describe('MockAutoLogin Class', () => {
    it('initialize should set token and user in storage if not logged in', async () => {
      vi.mocked(Taro.getStorageSync).mockReturnValue(undefined)
      
      await MockAutoLogin.initialize()
      
      expect(Taro.setStorageSync).toHaveBeenCalledWith('token', expect.stringContaining('mock_token_'))
      expect(Taro.setStorageSync).toHaveBeenCalledWith('user', expect.objectContaining({
        id: mockUsers[0].id,
        nickname: mockUsers[0].nickname
      }))
    })

    it('initialize should skip if already logged in', async () => {
      vi.mocked(Taro.getStorageSync).mockImplementation((key) => {
        if (key === 'token') return 'existing_token'
        if (key === 'user') return { id: 'user_1' }
        return undefined
      })
      
      await MockAutoLogin.initialize()
      
      expect(Taro.setStorageSync).not.toHaveBeenCalled()
    })

    it('isMockAutoLogin should return true if mock token matches current token', () => {
      vi.mocked(Taro.getStorageSync).mockImplementation((key) => {
        if (key === 'mock_auto_token') return 'mock_token'
        if (key === 'token') return 'mock_token'
        return undefined
      })
      
      expect(MockAutoLogin.isMockAutoLogin()).toBe(true)
    })

    it('cleanup should remove storage keys if mock auto login is active', async () => {
      vi.mocked(Taro.getStorageSync).mockImplementation((key) => {
        if (key === 'mock_auto_token') return 'mock_token'
        if (key === 'token') return 'mock_token'
        return undefined
      })
      
      await MockAutoLogin.cleanup()
      
      expect(Taro.removeStorageSync).toHaveBeenCalledWith('token')
      expect(Taro.removeStorageSync).toHaveBeenCalledWith('user')
    })
  })
})
