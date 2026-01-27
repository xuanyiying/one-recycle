import Taro from '@tarojs/taro'
import { post } from '../utils/request'
import { PlatformDetector } from '../utils/platformDetector'
import { LoginProvider, LoginResult } from '../types'
import { ENV_CONFIG } from '../config/env'

export interface LoginParams {
  code: string
  nickname: string
  avatarUrl?: string
  platform: 'wechat' | 'alipay' | 'douyin'
  deviceFingerprint?: string
}

export interface SmsCodeParams {
    mobile: string
    type?: 'login' | 'register' | 'reset_password'
}

export interface LoginResponse {
  success: boolean
  data?: {
    token: string
    refreshToken?: string
    user: {
      id: string
      nickname: string
      avatarUrl?: string
      mobile: string
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
    avatarUrl?: string
    mobile: string
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
            const requestUrl = `/auth/third-party/${params.platform}`
            const payload = {
                code: params.code,
                nickname: params.nickname,
                avatarUrl: params.avatarUrl,
                deviceFingerprint: params.deviceFingerprint,
            }

            const response = await post(requestUrl, payload)
            if (response.success && response.data?.token) {
                 await this.saveLoginInfo(response.data.token, response.data.user)
                 return response
            }

            return {
                success: false,
                message: response.message || '登录失败'
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
        try {
            if (!this.isLoginMethodSupported(provider)) {
                throw new Error(`当前平台不支持${provider}登录`)
            }
            const response = await post(`/auth/third-party/${provider}`, { provider })
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

            const response = await post('/auth/login', {mobile: phone, verificationCode: smsCode})

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
                const response = await post('/user/me')
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
            if (!params.mobile) {
                throw new Error('手机号不能为空')
            }

            if (!this.validatePhone(params.mobile)) {
                throw new Error('手机号格式不正确')
            }

            const response = await post('/auth/send-sms-code', {
                mobile: params.mobile,
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
     * 刷新令牌
     */
    static async refreshToken(): Promise<{ success: boolean; token?: string }> {
        try {
            const refreshToken = Taro.getStorageSync('refreshToken')
            if (!refreshToken) {
                return { success: false }
            }

            // 使用 Taro.request 直接请求，避免循环依赖和拦截器干扰
            const response = await Taro.request({
                url: `${ENV_CONFIG.API_BASE_URL}/auth/refresh`,
                method: 'POST',
                header: { 'Content-Type': 'application/json' },
                data: { refreshToken }
            })

            if (response.statusCode >= 200 && response.statusCode < 300) {
                const data = response.data
                const newToken = data.accessToken || data.token
                
                if (newToken) {
                    // 更新本地存储
                    Taro.setStorageSync('token', newToken)
                    return { success: true, token: newToken }
                }
            }
            
            return { success: false }
        } catch (error) {
            console.error('刷新token失败:', error)
            return { success: false }
        }
    }

    /**
     * 微信小程序登录
     */
    static async wechatLogin(params: { code: string; nickname: string; avatarUrl?: string }): Promise<LoginResponse> {
        return this.login({
            ...params,
            platform: 'wechat'
        })
    }

    /**
     * 支付宝小程序登录
     */
    static async alipayLogin(params: { code: string; nickname: string; avatarUrl?: string }): Promise<LoginResponse> {
        return this.login({
            ...params,
            platform: 'alipay'
        })
    }

    /**
     * 抖音小程序登录
     */
    static async douyinLogin(params: { code: string; nickname: string; avatarUrl?: string }): Promise<LoginResponse> {
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

}

// 导出单例对象（为了兼容性）
export const authService = new AuthService()

// 导出独立函数（为了兼容旧代码）
export const login = AuthService.login.bind(AuthService)
export const getUserInfo = AuthService.getUserInfo.bind(AuthService)
export const wechatLogin = AuthService.wechatLogin.bind(AuthService)
export const alipayLogin = AuthService.alipayLogin.bind(AuthService)
export const douyinLogin = AuthService.douyinLogin.bind(AuthService)
