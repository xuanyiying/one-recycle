import Taro from '@tarojs/taro'
import { logger } from './logger'

/**
 * Storage Key 常量定义
 * 统一使用这些常量，避免硬编码导致的 key 不一致问题
 */
export const STORAGE_KEYS = {
    // 用户信息
    USER: 'user',
    // 访问令牌
    TOKEN: 'token',
    // 刷新令牌
    REFRESH_TOKEN: 'refreshToken',
    // 登录方式
    LOGIN_PROVIDER: 'loginProvider',
    // 用户地址列表
    ADDRESSES: 'addresses',
    // 草稿订单
    DRAFT_ORDER: 'draftOrder',
    // 搜索历史
    SEARCH_HISTORY: 'searchHistory',
    // 浏览历史
    BROWSE_HISTORY: 'browseHistory',
    // 购物车
    CART: 'cart',
    // 设置项
    SETTINGS: 'settings',
    // 消息已读状态
    MESSAGE_READ_STATUS: 'messageReadStatus',
    // 上次登录时间
    LAST_LOGIN_TIME: 'lastLoginTime',
    // 设备指纹
    DEVICE_FINGERPRINT: 'deviceFingerprint',
    // 订单列表
    ORDERS: 'orders',
} as const

/**
 * Storage 类型定义
 */
export type StorageKey = keyof typeof STORAGE_KEYS
export type StorageValue = string | object | number | boolean | null | undefined

/**
 * 统一的 Storage 操作类
 */
export class Storage {
    /**
     * 获取存储项
     * @param key - StorageKey 常量
     * @returns 存储的值，不存在则返回 null
     */
    static get<T = any>(key: StorageKey): T | null {
        try {
            const storageKey = STORAGE_KEYS[key]
            const value = Taro.getStorageSync(storageKey)
            return value || null
        } catch (error) {
            logger.error(`[Storage] Get ${key} failed:`, error)
            return null
        }
    }

    /**
     * 设置存储项
     * @param key - StorageKey 常量
     * @param value - 要存储的值
     * @returns 是否成功
     */
    static set(key: StorageKey, value: StorageValue): boolean {
        try {
            const storageKey = STORAGE_KEYS[key]
            Taro.setStorageSync(storageKey, value)
            return true
        } catch (error) {
            logger.error(`[Storage] Set ${key} failed:`, error)
            return false
        }
    }

    /**
     * 移除存储项
     * @param key - StorageKey 常量
     * @returns 是否成功
     */
    static remove(key: StorageKey): boolean {
        try {
            const storageKey = STORAGE_KEYS[key]
            Taro.removeStorageSync(storageKey)
            return true
        } catch (error) {
            logger.error(`[Storage] Remove ${key} failed:`, error)
            return false
        }
    }

    /**
     * 清空所有存储
     * @returns 是否成功
     */
    static clear(): boolean {
        try {
            Taro.clearStorageSync()
            return true
        } catch (error) {
            logger.error('[Storage] Clear failed:', error)
            return false
        }
    }

    /**
     * 获取用户信息
     * @returns 用户信息对象或 null
     */
    static getUser<T = any>(): T | null {
        return this.get('USER')
    }

    /**
     * 设置用户信息
     * @param user - 用户信息对象
     * @returns 是否成功
     */
    static setUser<T = any>(user: T | null): boolean {
        if (!user) {
            return this.remove('USER')
        }
        return this.set('USER', user)
    }

    /**
     * 获取用户 ID
     * 优先返回 id，其次返回 sub
     * @returns 用户 ID 或 null
     */
    static getUserId(): string | null {
        const user = this.getUser()
        if (!user) return null
        return user.id || user.sub || null
    }

    /**
     * 获取 Token
     * @returns Token 字符串或 null
     */
    static getToken(): string | null {
        return this.get('TOKEN')
    }

    /**
     * 设置 Token
     * @param token - Token 字符串
     * @returns 是否成功
     */
    static setToken(token: string | null): boolean {
        if (!token) {
            return this.remove('TOKEN')
        }
        return this.set('TOKEN', token)
    }

    /**
     * 获取 Refresh Token
     * @returns Refresh Token 字符串或 null
     */
    static getRefreshToken(): string | null {
        return this.get('REFRESH_TOKEN')
    }

    /**
     * 设置 Refresh Token
     * @param refreshToken - Refresh Token 字符串
     * @returns 是否成功
     */
    static setRefreshToken(refreshToken: string | null): boolean {
        if (!refreshToken) {
            return this.remove('REFRESH_TOKEN')
        }
        return this.set('REFRESH_TOKEN', refreshToken)
    }

    /**
     * 清除登录相关信息
     * @returns 是否成功
     */
    static clearAuth(): boolean {
        try {
            this.remove('USER')
            this.remove('TOKEN')
            this.remove('REFRESH_TOKEN')
            this.remove('LOGIN_PROVIDER')
            return true
        } catch (error) {
            logger.error('[Storage] Clear auth failed:', error)
            return false
        }
    }
}

export default Storage
