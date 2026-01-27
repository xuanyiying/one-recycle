import Taro from '@tarojs/taro'
import {ENV_CONFIG, isDevelopment} from '../config/env'
import {requestCache} from './requestCache'
import {performanceMonitor} from './performanceMonitor'
import errorHandler, {retryWithBackoff} from './errorHandler'
import networkStatusManager from './networkStatus'
import {mockManager} from '../mock'

// 请求配置接口
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    header?: Record<string, string>
    timeout?: number
    cache?: boolean
    cacheTTL?: number
    retry?: boolean
    maxRetries?: number
}

// 生成缓存键
const generateCacheKey = (url: string, method: string, data?: any): string => {
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataStr}`;
}

// 简单的刷新逻辑（避免并发情况下重复刷新）
let refreshing = false
let refreshPromise: Promise<string | null> | null = null

export const attemptTokenRefresh = async (): Promise<string | null> => {
    const refreshToken = Taro.getStorageSync('refreshToken')
    if (!refreshToken) return null

    if (refreshing && refreshPromise) {
        return refreshPromise
    }

    refreshing = true
    refreshPromise = (async () => {
        try {
            const response = await Taro.request({
                url: `${ENV_CONFIG.API_BASE_URL}/auth/refresh`,
                method: 'POST',
                header: { 'Content-Type': 'application/json' },
                data: { refreshToken }
            })

            if (response.statusCode >= 200 && response.statusCode < 300) {
                const body = response.data || {}
                const newToken = body.accessToken || body.token
                if (newToken) {
                    Taro.setStorageSync('token', newToken)
                    return newToken
                }
                return null
            }
            return null
        } catch (e) {
            return null
        } finally {
            refreshing = false
            refreshPromise = null
        }
    })()

    return refreshPromise
}

// 通用请求函数
const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<T> => {
    // 检查是否使用mock数据（仅开发环境考虑 mock）
    const shouldUseMock = isDevelopment() && ENV_CONFIG.USE_MOCK_DATA === true;
    if (isDevelopment()) {
        console.log(`[Mock System] ==================== Mock Request Debug ====================`)
        console.log(`[Mock System] ENV_CONFIG.USE_MOCK_DATA:`, ENV_CONFIG.USE_MOCK_DATA)
        console.log(`[Mock System] shouldUseMock:`, shouldUseMock)
        console.log(`[Mock System] mockManager.isEnabled():`, mockManager.isEnabled())
        console.log(`[Mock System] Request URL:`, url)
        console.log(`[Mock System] Request Method:`, options.method || 'GET')
        console.log(`[Mock System] Request Data:`, options.data)
    }
    
    if (shouldUseMock && mockManager.isEnabled()) {
        if (isDevelopment()) console.log(`[Mock System] ✅ Mock conditions met, attempting mock request...`)

        try {
            const mockResponse = await mockManager.handleRequest(url, options.method || 'GET', options.data)
            if (mockResponse) {
                if (isDevelopment()) {
                    console.log(`[Mock System] ✅ Mock response received:`, mockResponse)
                    console.log(`[Mock System] ==================== Mock Request Success ====================`)
                }
                return mockResponse as T
            } else {
                if (isDevelopment()) {
                    console.log(`[Mock System] ❌ No mock response returned`)
                    console.log(`[Mock System] Running mock diagnosis...`)
                }
                mockManager.diagnose()
            }
        } catch (error) {
            if (isDevelopment()) {
                console.error(`[Mock System] ❌ Mock request failed:`, error)
                console.log(`[Mock System] Running mock diagnosis...`)
            }
            mockManager.diagnose()
            // 如果mock失败，继续使用真实请求
        }
    } else {
        if (isDevelopment()) {
            console.log(`[Mock System] ❌ Mock conditions not met:`)
            console.log(`[Mock System]   - shouldUseMock: ${shouldUseMock}`)
            console.log(`[Mock System]   - mockManager.isEnabled(): ${mockManager.isEnabled()}`)
            console.log(`[Mock System] Proceeding with real API request...`)
        }
    }
    
    if (isDevelopment()) console.log(`[Mock System] ==================== Proceeding to Real API ====================`)

    const token = Taro.getStorageSync('token')

    const defaultOptions = {
        timeout: options.timeout || ENV_CONFIG.API_TIMEOUT,
        method: options.method || 'GET',
        data: options.data,
        header: {
            'Content-Type': 'application/json',
            ...(token ? {'Authorization': `Bearer ${token}`} : {}),
            ...options.header
        }
    }

    // Check cache for GET requests if caching is enabled
    const shouldCache = options.cache !== false && defaultOptions.method === 'GET';
    const cacheKey = generateCacheKey(url, defaultOptions.method, defaultOptions.data);

    // Wrap request with retry logic if enabled
    const executeWithRetry = async (): Promise<T> => {
        if (shouldCache) {
            return requestCache.getOrFetch(
                cacheKey,
                async () => {
                    return executeRequest<T>(url, defaultOptions);
                },
                options.cacheTTL
            );
        }

        return executeRequest<T>(url, defaultOptions);
    };

    // Apply retry logic仅在显式开启时执行
    if (options.retry === true) {
        return retryWithBackoff(executeWithRetry, {
            maxRetries: options.maxRetries || 2,
            initialDelay: 1000,
            backoffMultiplier: 2,
            onRetry: (attempt) => {
                if (isDevelopment()) console.log(`[Retry] Attempt ${attempt} for ${url}`);
            }
        });
    }

    return executeWithRetry();
}

// Execute actual HTTP request
const executeRequest = async <T = any>(url: string, options: any): Promise<T> => {
    const startTime = Date.now();

    try {
        // Check network status before making request
        if (!networkStatusManager.isConnected()) {
            throw errorHandler.handle(
                {code: 'NETWORK_OFFLINE', message: '当前无网络连接'},
                {showToast: true}
            );
        }

        const fullUrl = `${ENV_CONFIG.API_BASE_URL}${url}`
        if (isDevelopment()) console.log(`[API Request] ${options.method} ${fullUrl}`)

        const response = await Taro.request({
            url: fullUrl,
            ...options
        })

        // Track API performance
        performanceMonitor.trackAPIRequest(
            url,
            options.method,
            startTime,
            response.statusCode
        );

        if (isDevelopment()) console.log(`[API Response] ${response.statusCode} ${url}`)

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return response.data as T
        } else if (response.statusCode === 401) {
            // 尝试刷新token并重试一次
            const newToken = await attemptTokenRefresh()
            if (newToken) {
                const retryOptions = {
                    ...options,
                    header: {
                        ...options.header,
                        Authorization: `Bearer ${newToken}`
                    }
                }
                const retryResp = await Taro.request({ url: fullUrl, ...retryOptions })
                if (retryResp.statusCode >= 200 && retryResp.statusCode < 300) {
                    return retryResp.data as T
                }
            }
            // 刷新失败或重试失败，走统一错误处理
            const error = {
                statusCode: response.statusCode,
                data: response.data,
                message: response.data?.message || '未授权或会话已过期'
            }
            throw errorHandler.handle(error, {showToast: true})
        } else {
            // Handle HTTP error with error handler
            const error = {
                statusCode: response.statusCode,
                data: response.data,
                message: response.data?.message || `Request failed with status ${response.statusCode}`
            };
            throw errorHandler.handle(error, {showToast: true});
        }
    } catch (error) {
        // Track failed request
        performanceMonitor.trackAPIRequest(
            url,
            options.method,
            startTime,
            0
        );

        // Handle error with error handler
        if (error.code && error.timestamp) {
            // Already handled by error handler
            throw error;
        }

        throw errorHandler.handle(error, {showToast: true});
    }
}

// 封装各种HTTP方法
export function get<T = any>(url: string, params?: any, options?: { cache?: boolean; cacheTTL?: number }) {
    return request<T>(url, {method: 'GET', data: params, ...options})
}

export function post<T = any>(url: string, data?: any) {
    return request<T>(url, {method: 'POST', data})
}

export function put<T = any>(url: string, data?: any) {
    return request<T>(url, {method: 'PUT', data})
}

export function del<T = any>(url: string) {
    return request<T>(url, {method: 'DELETE'})
}

// 清除缓存工具函数
export const clearCache = (pattern?: string | RegExp) => {
    if (pattern) {
        requestCache.invalidatePattern(pattern);
    } else {
        requestCache.clear();
    }
}

// 导出request函数供高级用法
export {request}
