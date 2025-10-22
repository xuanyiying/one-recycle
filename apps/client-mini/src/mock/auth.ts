// 认证相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'
import { LoginParams, LoginResponse, UserInfoResponse } from '@/services/auth'

// Mock用户数据
const mockUsers = [
  {
    id: 'user_001',
    nickname: '环保小达人',
    avatar: 'https://via.placeholder.com/100x100?text=User1',
    phone: '138****8888',
    email: 'user1@example.com',
    points: 1250,
    level: 'VIP',
    registerTime: '2024-01-15T08:30:00Z'
  },
  {
    id: 'user_002',
    nickname: '绿色生活家',
    avatar: 'https://via.placeholder.com/100x100?text=User2',
    phone: '139****9999',
    email: 'user2@example.com',
    points: 850,
    level: '普通',
    registerTime: '2024-02-20T10:15:00Z'
  }
]

// Mock登录响应
export const mockLogin = async (params: LoginParams): Promise<MockResponse<LoginResponse['data']>> => {
  // 模拟登录验证
  const user = mockUsers[0] // 默认返回第一个用户
  
  const loginData = {
    token: `mock_token_${MockDataGenerator.generateId()}`,
    user: {
      ...user,
      platform: params.platform
    }
  }

  return createMockResponse(loginData, true, '登录成功')
}

// Mock获取用户信息
export const mockGetUserInfo = async (): Promise<MockResponse<UserInfoResponse['data']>> => {
  const user = mockUsers[0]
  return createMockResponse(user, true, '获取用户信息成功')
}

// Mock微信登录
export const mockWechatLogin = async (params: { code: string; nickname: string; avatar?: string }): Promise<MockResponse<LoginResponse['data']>> => {
  const loginData = {
    token: `wechat_token_${MockDataGenerator.generateId()}`,
    user: {
      ...mockUsers[0],
      nickname: params.nickname,
      avatar: params.avatar || mockUsers[0].avatar,
      platform: 'wechat' as const
    }
  }

  return createMockResponse(loginData, true, '微信登录成功')
}

// Mock支付宝登录
export const mockAlipayLogin = async (params: { code: string; nickname: string; avatar?: string }): Promise<MockResponse<LoginResponse['data']>> => {
  const loginData = {
    token: `alipay_token_${MockDataGenerator.generateId()}`,
    user: {
      ...mockUsers[0],
      nickname: params.nickname,
      avatar: params.avatar || mockUsers[0].avatar,
      platform: 'alipay' as const
    }
  }

  return createMockResponse(loginData, true, '支付宝登录成功')
}

// Mock抖音登录
export const mockDouyinLogin = async (params: { code: string; nickname: string; avatar?: string }): Promise<MockResponse<LoginResponse['data']>> => {
  const loginData = {
    token: `douyin_token_${MockDataGenerator.generateId()}`,
    user: {
      ...mockUsers[0],
      nickname: params.nickname,
      avatar: params.avatar || mockUsers[0].avatar,
      platform: 'douyin' as const
    }
  }

  return createMockResponse(loginData, true, '抖音登录成功')
}

// 导出认证相关的mock数据
export const authMockData = {
  login: mockLogin,
  getUserInfo: mockGetUserInfo,
  wechatLogin: mockWechatLogin,
  alipayLogin: mockAlipayLogin,
  douyinLogin: mockDouyinLogin
}