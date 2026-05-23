import { AuthService } from '@/services/auth'
import Taro from '@tarojs/taro'
import errorHandler from './errorHandler'
import logger from './logger'
import networkStatusManager from './networkStatus'
import { performanceMonitor } from './performanceMonitor'
import { requestCache } from './requestCache'
import { Storage } from './storage'

const env: Partial<NodeJS.ProcessEnv> = typeof process !== 'undefined' ? process.env : {}
export const API_BASE_URL = env.TARO_APP_API_BASE_URL || env.API_BASE_URL || 'https://backbuy.cn/api'

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    data?: any
    header?: Record<string, string>
    timeout?: number
    cache?: boolean
    cacheTTL?: number
    retry?: boolean
    maxRetries?: number
}

const generateCacheKey = (url: string, method: string, data?: any): string => {
    const dataStr = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataStr}`;
}

const attemptTokenRefresh = async (): Promise<string | null> => {
    const result = await AuthService.refreshToken()
    if (result.success && result.token) {
        return result.token
    }
    errorHandler.redirectToLogin()
    return null
}

const request = async <T = any>(url: string, options: RequestOptions = {}): Promise<T> => {
    const token = Storage.getToken()

    const defaultOptions = {
        timeout: options.timeout || 10000,
        method: options.method || 'GET',
        data: options.data,
        header: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.header
        }
    }

    const shouldCache = options.cache === true && defaultOptions.method === 'GET';
    const cacheKey = generateCacheKey(url, defaultOptions.method, defaultOptions.data);

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
}

const executeRequest = async <T = any>(url: string, options: any): Promise<T> => {
    const startTime = Date.now();

    try {
        if (!networkStatusManager.isConnected()) {
            throw errorHandler.handle(
                { code: 'NETWORK_OFFLINE', message: '当前无网络连接' },
                { showToast: true }
            );
        }

        const fullUrl = `${API_BASE_URL}${url}`
        logger.log(`[API Request] ${options.method} ${fullUrl}`)

        const response = await Taro.request({
            url: fullUrl,
            ...options
        })

        performanceMonitor.trackAPIRequest(
            url,
            options.method,
            startTime,
            response.statusCode
        );

        logger.log(`[API Response] ${response.statusCode} ${url}`)

        if (response.statusCode >= 200 && response.statusCode < 300) {
            const body = response.data as any
            if (body && typeof body === 'object' && 'success' in body) {
                if (body.success === false) {
                    const error = {
                        statusCode: response.statusCode,
                        data: response.data,
                        code: body?.error?.code || body?.code,
                        message: body?.error?.message || body?.message || '请求失败'
                    }

                    // 处理未授权错误，即使状态码是 200
                    const errorCode = (error.code || '').toUpperCase()
                    if (errorCode === 'UNAUTHORIZED' || errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
                        errorHandler.redirectToLogin()
                        return new Promise<T>(() => { })
                    }

                    throw errorHandler.handle(error, { showToast: true })
                }
                return body as T
            }
            return response.data as T
        } else if (response.statusCode === 401) {
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
                    const retryBody = retryResp.data as any
                    if (retryBody && typeof retryBody === 'object' && 'success' in retryBody) {
                        if (retryBody.success === false) {
                            const error = {
                                statusCode: retryResp.statusCode,
                                data: retryResp.data,
                                code: retryBody?.error?.code || retryBody?.code,
                                message: retryBody?.error?.message || retryBody?.message || '请求失败'
                            }
                            throw errorHandler.handle(error, { showToast: true })
                        }
                        return retryBody as T
                    }
                    return retryResp.data as T
                }
            }
            // 如果尝试刷新后依然失败，或者刷新本身失败
            // attemptTokenRefresh 内部已经调用了 redirectToLogin，无需再次调用
            // 不再抛出错误给页面，避免页面显示"加载失败"等错误状态
            // 返回一个永远不会 resolve 的 Promise，阻止页面继续处理错误
            // 页面会保持当前状态直到 redirectToLogin 完成跳转
            return new Promise<T>(() => { })
        } else {
            const body = response.data as any
            const error = {
                statusCode: response.statusCode,
                data: response.data,
                code: body?.error?.code || body?.code,
                message: body?.error?.message || body?.message || `Request failed with status ${response.statusCode}`
            };
            throw errorHandler.handle(error, { showToast: true });
        }
    } catch (error: unknown) {
        performanceMonitor.trackAPIRequest(
            url,
            options.method,
            startTime,
            0
        );

        if (typeof error === 'object' && error !== null) {
            const maybeHandled = error as { code?: unknown; timestamp?: unknown }
            if (maybeHandled.code && maybeHandled.timestamp) {
                throw error
            }
        }

        throw errorHandler.handle(error, { showToast: true })
    }
}

export function get<T = any>(url: string, params?: any, options?: { cache?: boolean; cacheTTL?: number }) {
    return request<T>(url, { method: 'GET', data: params, ...options })
}

export function post<T = any>(url: string, data?: any) {
    return request<T>(url, { method: 'POST', data })
}

export function put<T = any>(url: string, data?: any) {
    return request<T>(url, { method: 'PUT', data })
}

export function del<T = any>(url: string) {
    return request<T>(url, { method: 'DELETE' })
}

export function patch<T = any>(url: string, data?: any) {
    return request<T>(url, { method: 'PATCH', data })
}

export const clearCache = (pattern?: string | RegExp) => {
    if (pattern) {
        requestCache.invalidatePattern(pattern);
    } else {
        requestCache.clear();
    }
}

export { request }

export const upload = async <T = any>(
    url: string,
    filePath: string,
    formData?: Record<string, string>,
    header?: Record<string, string>
): Promise<T & { success: boolean; url?: string; message?: string }> => {
    const token = Storage.getToken()
    const fullUrl = `${API_BASE_URL}${url}`

    const doUpload = (authToken: string) => new Promise<T & { success: boolean; url?: string; message?: string }>((resolve, reject) => {
        Taro.uploadFile({
            url: fullUrl,
            filePath,
            name: 'file',
            formData,
            header: {
                'Authorization': authToken ? `Bearer ${authToken}` : '',
                ...header
            },
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const data = JSON.parse(res.data)
                        resolve(data)
                    } catch {
                        resolve({
                            success: true,
                            url: res.data,
                            message: '上传成功'
                        } as any)
                    }
                } else {
                    reject({ statusCode: res.statusCode, data: res.data })
                }
            },
            fail: (err) => {
                reject(new Error(err.errMsg || '上传失败'))
            }
        })
    })

    try {
        return await doUpload(token || '')
    } catch (error: any) {
        if (error && typeof error === 'object' && error.statusCode === 401) {
            const newToken = await attemptTokenRefresh()
            if (newToken) {
                return await doUpload(newToken)
            }
            // attemptTokenRefresh 内部已经调用了 redirectToLogin
            // 不再抛出错误，避免页面显示错误状态
            return new Promise<never>(() => { })
        }
        if (error instanceof Error) {
            throw error
        }
        throw new Error(`上传失败: ${error.statusCode || '未知错误'}`)
    }
}
