// 认证相关Mock数据与自动化工具
import Taro from '@tarojs/taro'
import { ENV_CONFIG } from '@/config/env'
import { createMockResponse, MockDataGenerator, MockResponse } from './index'
import { LoginParams, LoginResponse, UserInfoResponse } from '@/services/auth'

/**
 * Mock用户基础数据
 */
export const mockUsers = [
  {
    id: '1',
    nickname: '环保小达人',
    avatar: 'https://placehold.co/100x100/png?text=User1',
    mobile: '138****8888',
    phone: '138****8888',
    email: 'user1@example.com',
    points: 1250,
    level: 'VIP',
    registerTime: '2024-01-15T08:30:00Z'
  },
  {
    id: '2',
    nickname: '绿色生活家',
    avatar: 'https://placehold.co/100x100/png?text=User2',
    mobile: '139****9999',
    phone: '139****9999',
    email: 'user2@example.com',
    points: 850,
    level: '普通',
    registerTime: '2024-02-20T10:15:00Z'
  }
]

// --- API 模拟函数 ---

/**
 * Mock 登录响应
 */
export const mockLogin = async (params: LoginParams): Promise<MockResponse<LoginResponse['data']>> => {
  // 模拟登录验证
  const user = mockUsers[0] // 默认返回第一个用户
  
  const token = `mock_token_${MockDataGenerator.generateId()}`
  const loginData = {
    tokens: {
        accessToken: token,
        refreshToken: `mock_refresh_${token}`,
        expiresIn: 7200
    },
    user: {
      ...user,
      platform: params.platform
    }
  }

  return createMockResponse(loginData, true, '登录成功')
}

/**
 * Mock 获取用户信息
 */
export const mockGetUserInfo = async (): Promise<MockResponse<UserInfoResponse['data']>> => {
  const user = mockUsers[0]
  return createMockResponse(user, true, '获取用户信息成功')
}

/**
 * Mock 微信登录
 */
export const mockWechatLogin = async (params: { code: string; nickname: string; avatar?: string }): Promise<MockResponse<LoginResponse['data']>> => {
  const token = `wechat_token_${MockDataGenerator.generateId()}`
  const loginData = {
    tokens: {
        accessToken: token,
        refreshToken: `wechat_refresh_${token}`,
        expiresIn: 7200
    },
    user: {
      ...mockUsers[0],
      nickname: params.nickname,
      avatar: params.avatar || mockUsers[0].avatar,
      platform: 'wechat' as const
    }
  }

  return createMockResponse(loginData, true, '微信登录成功')
}

/**
 * Mock 支付宝登录
 */
export const mockAlipayLogin = async (params: { code: string; nickname: string; avatar?: string }): Promise<MockResponse<LoginResponse['data']>> => {
  const token = `alipay_token_${MockDataGenerator.generateId()}`
  const loginData = {
    tokens: {
        accessToken: token,
        refreshToken: `alipay_refresh_${token}`,
        expiresIn: 7200
    },
    user: {
      ...mockUsers[0],
      nickname: params.nickname,
      avatar: params.avatar || mockUsers[0].avatar,
      platform: 'alipay' as const
    }
  }

  return createMockResponse(loginData, true, '支付宝登录成功')
}

/**
 * Mock 抖音登录
 */
export const mockDouyinLogin = async (params: { code: string; nickname: string; avatar?: string }): Promise<MockResponse<LoginResponse['data']>> => {
  const token = `douyin_token_${MockDataGenerator.generateId()}`
  const loginData = {
    tokens: {
        accessToken: token,
        refreshToken: `douyin_refresh_${token}`,
        expiresIn: 7200
    },
    user: {
      ...mockUsers[0],
      nickname: params.nickname,
      avatar: params.avatar || mockUsers[0].avatar,
      platform: 'douyin' as const
    }
  }

  return createMockResponse(loginData, true, '抖音登录成功')
}

// --- 自动化工具 (原 autoLogin.ts 内容) ---

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
    const launchOptions = Taro.getLaunchOptionsSync()
    const query = launchOptions.query || {}
    const forceMockLogin = query.mockLogin === 'true'

    // 只在mock环境下执行，除非通过参数强制开启
    if (!ENV_CONFIG.USE_MOCK_DATA && !forceMockLogin) {
      return
    }

    try {
      console.log(`[Mock Auto Login] Initializing mock auto login... (force: ${forceMockLogin})`)
      
      // 检查是否已经有登录状态
      const existingToken = Taro.getStorageSync('token')
      const existingUser = Taro.getStorageSync('user')
      
      // 如果不是强制开启，且已有登录状态，则跳过
      if (!forceMockLogin && existingToken && existingUser) {
        console.log('[Mock Auto Login] ✅ User already logged in, skipping auto login')
        return
      }

      // 生成mock登录状态
      const mockToken = `mock_token_${MockDataGenerator.generateId()}`
      const mockUser = {
        ...mockUsers[0], // 使用第一个mock用户
        id: '1', // 强制设置为 1 以适配后端
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
      
      // 如果是通过参数强制开启的，且我们在非首页，可能需要刷新当前页面或通知应用状态更新
      // 这里的 initialize 是在 App.componentDidMount 中调用的，此时页面还未完全挂载
      
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

  /**
   * 切换Mock用户
   */
  static async switchUser(): Promise<void> {
    try {
        const currentUser = Taro.getStorageSync('user')
        const currentIndex = mockUsers.findIndex(u => u.id === currentUser?.id)
        const nextIndex = (currentIndex + 1) % mockUsers.length
        const nextUser = mockUsers[nextIndex]

        const mockToken = `mock_token_${MockDataGenerator.generateId()}`
        const user = {
            ...nextUser,
            loginTime: new Date().toISOString(),
            platform: 'mock'
        }

        // 保存到本地存储
        await Taro.setStorageSync('token', mockToken)
        await Taro.setStorageSync('user', user)
        
        // 标记为mock自动登录
        await Taro.setStorageSync(this.MOCK_TOKEN_KEY, mockToken)
        await Taro.setStorageSync(this.MOCK_USER_KEY, user)

        // 刷新页面
        Taro.reLaunch({ url: '/pages/index/index' })
        
    } catch (error) {
        console.error('[Mock Auto Login] Failed to switch user:', error)
    }
  }
}

// --- 统一导出 ---

/**
 * 导出认证相关的mock数据与接口
 */
export const authMockData = {
  login: mockLogin,
  getUserInfo: mockGetUserInfo,
  wechatLogin: mockWechatLogin,
  alipayLogin: mockAlipayLogin,
  douyinLogin: mockDouyinLogin,
  // 注入自动化工具
  automation: MockAutoLogin
}
