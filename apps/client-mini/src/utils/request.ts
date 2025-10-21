import Taro from '@tarojs/taro'
import {ENV_CONFIG} from '../config/env'
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

// 通用请求函数
const request = async (url: string, options: RequestOptions = {}) => {
    // 检查是否使用mock数据
    const shouldUseMock = ENV_CONFIG.USE_MOCK_DATA || false;
    console.log(`[Mock Enabled] ${shouldUseMock}`)
    if (shouldUseMock && mockManager.isEnabled()) {
        console.log(`[Mock Request] ${options.method || 'GET'} ${url}`)

        try {
            const mockResponse = await mockManager.handleRequest(url, options.method || 'GET', options.data)
            if (mockResponse) {
                console.log(`[Mock Response] ${url}`, mockResponse)
                return mockResponse
            }
        } catch (error) {
            console.warn(`[Mock Error] ${url}`, error)
            // 如果mock失败，继续使用真实请求
        }
    }

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
    const executeWithRetry = async () => {
        if (shouldCache) {
            return requestCache.getOrFetch(
                cacheKey,
                async () => {
                    return executeRequest(url, defaultOptions);
                },
                options.cacheTTL
            );
        }

        return executeRequest(url, defaultOptions);
    };

    // Apply retry logic for retryable requests
    if (options.retry !== false) {
        return retryWithBackoff(executeWithRetry, {
            maxRetries: options.maxRetries || 2,
            initialDelay: 1000,
            backoffMultiplier: 2,
            onRetry: (attempt) => {
                console.log(`[Retry] Attempt ${attempt} for ${url}`);
            }
        });
    }

    return executeWithRetry();
}

// Execute actual HTTP request
const executeRequest = async (url: string, options: any) => {
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
        console.log(`[API Request] ${options.method} ${fullUrl}`)

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

        console.log(`[API Response] ${response.statusCode} ${url}`)

        if (response.statusCode >= 200 && response.statusCode < 300) {
            return response.data
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
export const get = (url: string, params?: any, options?: { cache?: boolean; cacheTTL?: number }) => {
    return request(url, {method: 'GET', data: params, ...options})
}

export const post = (url: string, data?: any) => {
    return request(url, {method: 'POST', data})
}

export const put = (url: string, data?: any) => {
    return request(url, {method: 'PUT', data})
}

export const del = (url: string) => {
    return request(url, {method: 'DELETE'})
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