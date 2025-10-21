// 统一认证服务
import Taro from '@tarojs/taro'
import {post} from '../utils/request'
import {PlatformDetector} from '../utils/platformDetector'
import {LoginProvider, LoginResult} from '../types'

export interface SmsCodeParams {
    phone: string
    type?: 'login' | 'register' | 'reset'
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
     * 快捷登录 - 统一入口
     */
    static async quickLogin(provider: string): Promise<LoginResult> {
        try {
            // 检查是否支持该登录方式
            if (!this.isLoginMethodSupported(provider)) {
                throw new Error(`当前平台不支持${provider}登录`)
            }

            // 调用统一的第三方登录接口
            const response = await post('/account/auth/third-party-login', {provider})

            if (response.success) {
                // 保存登录信息
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

            // 验证手机号格式
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
     * 刷新token（暂时返回当前token，实际项目中应该调用后端API）
     */
    static async refreshToken(): Promise<{ success: boolean; token?: string }> {
        try {
            const currentToken = this.getToken()
            if (!currentToken) {
                return {success: false}
            }
            // 这里应该调用后端API刷新token
            // 暂时返回当前token
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