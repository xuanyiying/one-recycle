import Taro from '@tarojs/taro'
import { ENV_CONFIG } from '@/config/env'
import { mockUsers } from './auth'
import { MockDataGenerator } from './index'

/**
 * Mock环境下的自动登录功能
 * 在mock环境下自动设置登录状态，避免AuthGuard要求用户登录
 */
export class MockAutoLogin {
  private static readonly MOCK_TOKEN_KEY = 'mock_auto_token'
  private static readonly MOCK_USER_KEY = 'mock_auto_user'
  
  /**
   * 初始化mock环境下的自动登录
   */
  static async initialize(): Promise<void> {
    // 只在mock环境下执行
    if (!ENV_CONFIG.USE_MOCK_DATA) {
      return
    }

    try {
      console.log('[Mock Auto Login] Initializing mock auto login...')
      
      // 检查是否已经有登录状态
      const existingToken = Taro.getStorageSync('token')
      const existingUser = Taro.getStorageSync('user')
      
      if (existingToken && existingUser) {
        console.log('[Mock Auto Login] ✅ User already logged in, skipping auto login')
        return
      }

      // 生成mock登录状态
      const mockToken = `mock_token_${MockDataGenerator.generateId()}`
      const mockUser = {
        ...mockUsers[0], // 使用第一个mock用户
        id: MockDataGenerator.generateId(),
        loginTime: new Date().toISOString(),
        platform: 'mock'
      }

      // 保存到本地存储
      await Taro.setStorageSync('token', mockToken)
      await Taro.setStorageSync('user', mockUser)
      
      // 标记为mock自动登录
      await Taro.setStorageSync(this.MOCK_TOKEN_KEY, mockToken)
      await Taro.setStorageSync(this.MOCK_USER_KEY, mockUser)

      console.log('[Mock Auto Login] ✅ Mock auto login completed')
      console.log('[Mock Auto Login] Mock user:', mockUser.nickname)
      console.log('[Mock Auto Login] Mock token:', mockToken.substring(0, 20) + '...')
      
    } catch (error) {
      console.error('[Mock Auto Login] ❌ Failed to initialize mock auto login:', error)
    }
  }

  /**
   * 清理mock自动登录状态
   */
  static async cleanup(): Promise<void> {
    try {
      const mockToken = Taro.getStorageSync(this.MOCK_TOKEN_KEY)
      const currentToken = Taro.getStorageSync('token')
      
      // 只清理mock自动登录的token
      if (mockToken && currentToken === mockToken) {
        await Taro.removeStorageSync('token')
        await Taro.removeStorageSync('user')
        console.log('[Mock Auto Login] ✅ Mock auto login cleaned up')
      }
      
      await Taro.removeStorageSync(this.MOCK_TOKEN_KEY)
      await Taro.removeStorageSync(this.MOCK_USER_KEY)
      
    } catch (error) {
      console.error('[Mock Auto Login] ❌ Failed to cleanup mock auto login:', error)
    }
  }

  /**
   * 检查当前是否为mock自动登录状态
   */
  static isMockAutoLogin(): boolean {
    try {
      const mockToken = Taro.getStorageSync(this.MOCK_TOKEN_KEY)
      const currentToken = Taro.getStorageSync('token')
      return !!(mockToken && currentToken === mockToken)
    } catch (error) {
      return false
    }
  }

  /**
   * 获取mock登录状态信息
   */
  static getMockLoginInfo(): { token?: string; user?: any } | null {
    try {
      if (!this.isMockAutoLogin()) {
        return null
      }
      
      return {
        token: Taro.getStorageSync('token'),
        user: Taro.getStorageSync('user')
      }
    } catch (error) {
      return null
    }
  }
}