import { post } from '../utils/request'

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
 * 用户登录
 */
export async function login(params: LoginParams): Promise<LoginResponse> {
  try {
    const response = await post('/auth/login', params)
    return response
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
    const response = await post('/user/profile')
    return response
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