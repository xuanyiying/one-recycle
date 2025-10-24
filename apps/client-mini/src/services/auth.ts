import Taro from '@tarojs/taro'
import { post } from '../utils/request'
import { ENV_CONFIG } from '../config/env'

export interface LoginParams {
  code: string
  nickname: string
  avatar?: string
  platform: 'wechat' | 'alipay' | 'douyin'
  uniqueId?: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    token: string
    refreshToken?: string
    user: {
      id: string
      nickname: string
      avatar?: string
      phone?: string
      [key: string]: any
    }
  }
  message?: string
}

export interface UserInfoResponse {
  success: boolean
  data?: {
    id: string
    nickname: string
    avatar?: string
    phone?: string
    [key: string]: any
  }
  message?: string
}

/**
 * 用户登录（第三方平台）
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  try {
    const url = `/auth/third-party/${params.platform}`
    const payload = {
      code: params.code,
      nickname: params.nickname,
      avatarUrl: params.avatar,
      deviceFingerprint: params.uniqueId
    }

    const response = await post(url, payload)

    // Mock模式：返回统一的 MockResponse 结构
    if (typeof response?.success !== 'undefined') {
      return response
    }

    // 后端真实响应：AuthResult 结构 { user, tokens, sessionId }
    if (response?.tokens?.accessToken && response?.user) {
      const accessToken = response.tokens.accessToken
      const refreshToken = response.tokens.refreshToken

      // 缓存刷新令牌，便于后续自动刷新
      if (refreshToken) {
        try { Taro.setStorageSync('refreshToken', refreshToken) } catch (e) { /* ignore */ }
      }

      return {
        success: true,
        data: {
          token: accessToken,
          refreshToken,
          user: response.user
        }
      }
    }

    return {
      success: false,
      message: '登录响应格式不正确'
    }
  } catch (error: any) {
    console.error('登录API调用失败:', error)
    return {
      success: false,
      message: error.message || '登录失败'
    }
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<UserInfoResponse> {
  try {
    // 在 Mock 环境下，使用原有的模拟接口
    if (ENV_CONFIG.USE_MOCK_DATA) {
      const response = await post('/user/profile')
      return response
    }

    // 非 Mock 环境：优先从本地缓存读取登录时保存的用户信息
    const cachedUser = Taro.getStorageSync('user')
    if (cachedUser) {
      return { success: true, data: cachedUser }
    }

    // 如果没有缓存，则返回未登录，需要重新登录
    return {
      success: false,
      message: '未登录或用户信息缺失'
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    return {
      success: false,
      message: error.message || '获取用户信息失败'
    }
  }
}

/**
 * 微信小程序登录
 */
export async function wechatLogin(params: { code: string; nickname: string; avatar?: string }): Promise<LoginResponse> {
  return login({
    ...params,
    platform: 'wechat'
  })
}

/**
 * 支付宝小程序登录
 */
export async function alipayLogin(params: { code: string; nickname: string; avatar?: string }): Promise<LoginResponse> {
  return login({
    ...params,
    platform: 'alipay'
  })
}

/**
 * 抖音小程序登录
 */
export async function douyinLogin(params: { code: string; nickname: string; avatar?: string }): Promise<LoginResponse> {
  return login({
    ...params,
    platform: 'douyin'
  })
}