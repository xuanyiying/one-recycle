import Taro from '@tarojs/taro'
import { API_BASE_URL, post } from '@/utils/request'
import { PlatformDetector } from '@/utils/platformDetector'
import { LoginProvider, LoginResult } from '@/types'
import { Storage } from '@/utils/storage'
import { logger } from '@/utils/logger'

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
        tokens: {
            accessToken: string
            refreshToken: string
            expiresIn: number
        }
        user: {
            id: string
            nickname: string
            avatarUrl?: string
            mobile: string
            [key: string]: any
        }
    }
    message?: string
    error?: {
        code: string
        message: string
        details?: any
    }
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
    error?: {
        code: string
        message: string
        details?: any
    }
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

            const response = await post<any>(requestUrl, payload)
            const authData = response?.data ?? response

            if (authData && authData.tokens?.accessToken) {
                await this.saveLoginInfo(authData.tokens.accessToken, authData.user, authData.tokens.refreshToken)
                return {
                    success: true,
                    data: {
                        tokens: authData.tokens,
                        user: authData.user
                    }
                }
            }

            return {
                success: false,
                message: '登录失败：响应数据缺失'
            }
        } catch (error: any) {
            logger.error('登录API调用失败:', error)
            return {
                success: false,
                message: error.message || '登录失败',
                error: {
                    code: error.code || 'LOGIN_FAILED',
                    message: error.message || '登录失败'
                }
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
            const response = await post<any>(`/auth/third-party/${provider}`, { provider })
            const authData = response?.data ?? response

            if (authData && authData.tokens?.accessToken) {
                await this.saveLoginInfo(authData.tokens.accessToken, authData.user, authData.tokens.refreshToken)
                return {
                    success: true,
                    token: authData.tokens.accessToken,
                    user: authData.user
                }
            } else {
                throw new Error('登录失败：响应数据缺失')
            }
        } catch (error) {
            logger.error(`${provider}登录失败:`, error)
            return {
                success: false,
                error: error instanceof Error ? error.message : '登录失败'
            }
        }
    }

    /**
     * 手机号登录 {"success":true,"data":{"user":{"id":"1","mobile":"13800138000","nickname":"测试用户","role":"USER","status":"ACTIVE","createdAt":"2026-02-02T12:56:21.415Z","updatedAt":"2026-02-02T12:56:21.415Z"},"tokens":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibW9iaWxlIjoiMTM4MDAxMzgwMDAiLCJpYXQiOjE3NzE1MTE2NjUsImV4cCI6MTc3MjExNjQ2NX0.EnsZRiPGXuxGNIIZC7QiFviOAPvLVad7kbZKK32hgMs","refreshToken":"812331262370033664","expiresIn":7200}},"message":"Success","code":"SUCCESS","timestamp":"2026-02-19T14:34:25.338Z"}
     */
    static async phoneLogin(phone: string, code: string): Promise<LoginResult> {
        try {
            if (!phone || !code) {
                throw new Error('手机号和验证码不能为空')
            }

            if (!this.validatePhone(phone)) {
                throw new Error('手机号格式不正确')
            }

            const response = await post<any>('/auth/login', { mobile: phone, verificationCode: code })
            const authData = response?.data ?? response

            if (authData && authData.tokens?.accessToken) {
                await this.saveLoginInfo(authData.tokens.accessToken, authData.user, authData.tokens.refreshToken)
                return {
                    success: true,
                    token: authData.tokens.accessToken,
                    user: authData.user
                }
            } else {
                throw new Error('登录失败：响应数据缺失')
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
            const cachedUser = Storage.getUser()
            if (cachedUser && cachedUser.id) {
                return { success: true, data: cachedUser as UserInfoResponse['data'] }
            }

            return {
                success: false,
                message: '未登录或用户信息缺失'
            }
        } catch (error: any) {
            logger.error('获取用户信息失败:', error)
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

            await post<any>('/auth/send-sms-code', {
                mobile: params.mobile,
                type: params.type || 'login'
            })

            return {
                success: true,
                message: '验证码发送成功'
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : '发送验证码失败'
            }
        }
    }

    private static refreshPromise: Promise<{ success: boolean; token?: string }> | null = null
    private static lastRefreshTime: number = 0
    private static readonly REFRESH_THROTTLE_MS = 2000 // 2秒内防止重复刷新

    /**
     * 刷新令牌
     */
    static async refreshToken(): Promise<{ success: boolean; token?: string }> {
        // 1. 检查请求锁（防止并发）
        if (this.refreshPromise) {
            return this.refreshPromise
        }

        // 2. 检查节流（防止短时间内重复调用）
        const now = Date.now()
        if (now - this.lastRefreshTime < this.REFRESH_THROTTLE_MS) {
            const token = Storage.getToken()
            if (token) {
                return { success: true, token }
            }
        }

        this.refreshPromise = (async () => {
            try {
                const refreshToken = Storage.getRefreshToken()
                if (!refreshToken) {
                    return { success: false }
                }

                // 使用 Taro.request 直接请求，避免循环依赖和拦截器干扰
                const response = await Taro.request({
                    url: `${API_BASE_URL}/auth/refresh`,
                    method: 'POST',
                    header: { 'Content-Type': 'application/json' },
                    data: { refreshToken }
                })

                if (response.statusCode >= 200 && response.statusCode < 300) {
                    const respData = response.data as any
                    const newToken = respData.data?.accessToken || respData.accessToken || respData.data?.token || respData.token

                    if (newToken) {
                        Storage.setToken(newToken)
                        this.lastRefreshTime = Date.now()
                        return { success: true, token: newToken }
                    }
                }

                // 如果刷新失败（如401/403），说明refreshToken也过期了，需要清除
                if (response.statusCode === 401 || response.statusCode === 403) {
                    await this.logout()
                }

                return { success: false }
            } catch (error) {
                logger.error('刷新token失败:', error)
                return { success: false }
            } finally {
                this.refreshPromise = null
            }
        })()

        return this.refreshPromise
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
    static async saveLoginInfo(token: string, user: any, refreshToken?: string): Promise<void> {
        try {
            Storage.setToken(token)
            Storage.setUser(user)
            if (refreshToken) {
                Storage.setRefreshToken(refreshToken)
            }
        } catch (error) {
            logger.error('保存登录信息失败:', error)
        }
    }

    /**
     * 获取保存的token
     */
    static getToken(): string | null {
        return Storage.getToken()
    }

    /**
     * 获取保存的用户信息
     */
    static getUser(): any | null {
        return Storage.getUser()
    }

    /**
     * 获取用户ID
     */
    static getUserId(): string | null {
        return Storage.getUserId()
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
            Storage.clearAuth()
        } catch (error) {
            logger.error('退出登录失败:', error)
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


