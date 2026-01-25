import Taro from '@tarojs/taro'
import { post } from '../utils/request'
import { PlatformDetector } from '../utils/platformDetector'
import { LoginProvider, LoginResult } from '../types'
import { ENV_CONFIG } from '../config/env'

export interface LoginParams {
  code: string
  nickname: string
  avatar?: string
  platform: 'wechat' | 'alipay' | 'douyin'
  uniqueId?: string
}

export interface SmsCodeParams {
    phone: string
    type?: 'login' | 'register' | 'reset'
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
 * 统一认证服务
 * 整合所有登录相关功能，支持多平台
 */
export class AuthService {
    /**
     * 获取当前平台支持的登录方式
     */
    static getSupportedLoginProviders(): LoginProvider[] {
        return PlatformDetector.getSupportedLoginMethods()
    }

    /**
     * 检查登录方式是否支持
     */
    static isLoginMethodSupported(method: string): boolean {
        return PlatformDetector.isLoginMethodSupported(method)
    }

    /**
     * 统一登录入口 (支持 LoginParams)
     */
    static async login(params: LoginParams): Promise<LoginResponse> {
        try {
            const url = `/account/auth/third-party-login` // 统一使用 authService 的路径
            // 或者根据 params.platform 决定？
            // 原 auth.ts 使用 `/auth/third-party/${params.platform}`
            // 原 authService.ts 使用 `/account/auth/third-party-login` 并传 provider
            
            // 为了兼容性，我们构造一个符合后端预期的 payload
            // 假设后端支持统一接口，或者我们需要在这里做适配
            // 鉴于 authService.ts 是"更完善"的，我们优先使用它的路径，但需要确认 payload 结构
            // authService.ts 传的是 { provider }
            // auth.ts 传的是 { code, nickname, avatarUrl, deviceFingerprint }
            
            // 混合策略：使用 auth.ts 的 payload 结构，但统一路径（如果后端支持）
            // 如果不确定，我们暂时保留 auth.ts 的路径逻辑，但在 Class 内部实现
            
            const requestUrl = `/auth/third-party/${params.platform}`
            const payload = {
                code: params.code,
                nickname: params.nickname,
                avatarUrl: params.avatar,
                deviceFingerprint: params.uniqueId,
                provider: params.platform // 冗余字段以防万一
            }

            const response = await post(requestUrl, payload)

            // Mock模式支持
            if (ENV_CONFIG.USE_MOCK_DATA && typeof response?.success !== 'undefined') {
                 // 如果是 Mock 数据，直接返回
                 // 确保 Mock 数据结构符合 LoginResponse
                 if (response.success && response.data) {
                     await this.saveLoginInfo(response.data.token, response.data.user)
                 }
                 return response
            }

            if (response?.tokens?.accessToken && response?.user) {
                const accessToken = response.tokens.accessToken
                const refreshToken = response.tokens.refreshToken

                await this.saveLoginInfo(accessToken, response.user)
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
            
            // 尝试适配 authService 的响应结构 (如果是直接返回 data)
            if (response.success && response.data?.token) {
                 await this.saveLoginInfo(response.data.token, response.data.user)
                 return response
            }

            return {
                success: false,
                message: response.message || '登录响应格式不正确'
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
     * 快捷登录 (原 authService 方法)
     */
    static async quickLogin(provider: string): Promise<LoginResult> {
         // 这是一个简化的登录，可能需要完善参数
         // 这里保留原逻辑
        try {
            if (!this.isLoginMethodSupported(provider)) {
                throw new Error(`当前平台不支持${provider}登录`)
            }
            const response = await post('/account/auth/third-party-login', {provider})
            if (response.success) {
                await this.saveLoginInfo(response.data.token, response.data.user)
                return {
                    success: true,
                    token: response.data.token,
                    user: response.data.user
                }
            } else {
                throw new Error(response.message || '登录失败')
            }
        } catch (error) {
            console.error(`${provider}登录失败:`, error)
            return {
                success: false,
                error: error instanceof Error ? error.message : '登录失败'
            }
        }
    }

    /**
     * 手机号登录
     */
    static async phoneLogin(phone: string, smsCode: string): Promise<LoginResult> {
        try {
            if (!phone || !smsCode) {
                throw new Error('手机号和验证码不能为空')
            }

            if (!this.validatePhone(phone)) {
                throw new Error('手机号格式不正确')
            }

            const response = await post('/account/auth/phone-login', {phone, smsCode})

            if (response.success) {
                await this.saveLoginInfo(response.data.token, response.data.user)
                return {
                    success: true,
                    token: response.data.token,
                    user: response.data.user
                }
            } else {
                throw new Error(response.message || '登录失败')
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '手机号登录失败'
            }
        }
    }

    /**
     * 获取用户信息
     */
    static async getUserInfo(): Promise<UserInfoResponse> {
        try {
            if (ENV_CONFIG.USE_MOCK_DATA) {
                const response = await post('/user/profile')
                return response
            }

            const cachedUser = Taro.getStorageSync('user')
            if (cachedUser) {
                return { success: true, data: cachedUser }
            }

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
     * 发送短信验证码
     */
    static async sendSmsCode(params: SmsCodeParams): Promise<{ success: boolean; message?: string }> {
        try {
            if (!params.phone) {
                throw new Error('手机号不能为空')
            }

            if (!this.validatePhone(params.phone)) {
                throw new Error('手机号格式不正确')
            }

            const response = await post('/account/auth/send-sms-code', {
                phone: params.phone,
                type: params.type || 'login'
            })

            return {
                success: response.success,
                message: response.message || (response.success ? '验证码发送成功' : '验证码发送失败')
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : '发送验证码失败'
            }
        }
    }

    /**
     * 微信小程序登录
     */
    static async wechatLogin(params: { code: string; nickname: string; avatar?: string }): Promise<LoginResponse> {
        return this.login({
            ...params,
            platform: 'wechat'
        })
    }

    /**
     * 支付宝小程序登录
     */
    static async alipayLogin(params: { code: string; nickname: string; avatar?: string }): Promise<LoginResponse> {
        return this.login({
            ...params,
            platform: 'alipay'
        })
    }

    /**
     * 抖音小程序登录
     */
    static async douyinLogin(params: { code: string; nickname: string; avatar?: string }): Promise<LoginResponse> {
        return this.login({
            ...params,
            platform: 'douyin'
        })
    }

    /**
     * 验证手机号格式
     */
    private static validatePhone(phone: string): boolean {
        const phoneRegex = /^1[3-9]\d{9}$/
        return phoneRegex.test(phone)
    }

    /**
     * 保存登录信息
     */
    static async saveLoginInfo(token: string, user: any): Promise<void> {
        try {
            await Taro.setStorageSync('token', token)
            await Taro.setStorageSync('user', user)
        } catch (error) {
            console.error('保存登录信息失败:', error)
        }
    }

    /**
     * 获取保存的token
     */
    static getToken(): string | null {
        try {
            return Taro.getStorageSync('token') || null
        } catch (error) {
            console.error('获取token失败:', error)
            return null
        }
    }

    /**
     * 获取保存的用户信息
     */
    static getUser(): any | null {
        try {
            return Taro.getStorageSync('user') || null
        } catch (error) {
            console.error('获取用户信息失败:', error)
            return null
        }
    }

    /**
     * 检查是否已登录
     */
    static isLoggedIn(): boolean {
        const token = this.getToken()
        return !!token
    }

    /**
     * 退出登录
     */
    static async logout(): Promise<void> {
        try {
            await Taro.removeStorageSync('token')
            await Taro.removeStorageSync('user')
            await Taro.removeStorageSync('refreshToken')
        } catch (error) {
            console.error('退出登录失败:', error)
        }
    }

    /**
     * 获取平台名称
     */
    static getPlatformName(): string {
        return PlatformDetector.getPlatformName()
    }

    /**
     * 获取当前平台类型
     */
    static getCurrentPlatform() {
        return PlatformDetector.getCurrentPlatform()
    }

    /**
     * 检查登录状态
     */
    static checkLoginStatus(): { isLoggedIn: boolean; user?: any; token?: string } {
        const token = this.getToken()
        const user = this.getUser()

        return {
            isLoggedIn: !!token,
            user: user || undefined,
            token: token || undefined
        }
    }

    /**
     * 刷新token
     */
    static async refreshToken(): Promise<{ success: boolean; token?: string }> {
        try {
            const currentToken = this.getToken()
            if (!currentToken) {
                return {success: false}
            }
            // TODO: 调用后端API刷新token
            return {
                success: true,
                token: currentToken
            }
        } catch (error) {
            console.error('刷新token失败:', error)
            return {success: false}
        }
    }
}

// 导出单例对象（为了兼容性）
export const authService = new AuthService()

// 导出独立函数（为了兼容旧代码）
export const login = AuthService.login.bind(AuthService)
export const getUserInfo = AuthService.getUserInfo.bind(AuthService)
export const wechatLogin = AuthService.wechatLogin.bind(AuthService)
export const alipayLogin = AuthService.alipayLogin.bind(AuthService)
export const douyinLogin = AuthService.douyinLogin.bind(AuthService)
