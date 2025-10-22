// Mock数据管理系统
// 提供完整的mock数据服务，支持动态开关控制

import { ENV_CONFIG } from '@/config/env'

// Mock数据类型定义
export interface MockResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

// Mock配置接口
interface MockConfig {
  enabled: boolean
  delay: number // 模拟网络延迟
}

// Mock配置
const mockConfig: MockConfig = {
  enabled: ENV_CONFIG.USE_MOCK_DATA || true ,
  delay: 300 // 300ms延迟模拟真实网络请求
}

// 模拟网络延迟
const delay = (ms: number = mockConfig.delay): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock数据生成器
class MockDataGenerator {
  // 生成随机ID
  static generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  // 生成随机时间戳
  static generateTimestamp(): string {
    return new Date().toISOString()
  }

  // 生成随机价格
  static generatePrice(min: number = 10, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // 生成随机状态
  static generateStatus<T>(statuses: T[]): T {
    return statuses[Math.floor(Math.random() * statuses.length)]
  }
}

// Mock响应包装器
const createMockResponse = async <T>(data: T, success: boolean = true, message?: string): Promise<MockResponse<T>> => {
  await delay()
  return {
    success,
    data: success ? data : undefined,
    message: message || (success ? '操作成功' : '操作失败'),
    code: success ? 200 : 400
  }
}

// Mock路由映射类型
type MockRouteHandler = (data?: any, params?: Record<string, string>) => Promise<MockResponse<any>>

// Mock路由映射
const mockRoutes: Record<string, MockRouteHandler> = {}

// 注册mock路由的函数
export const registerMockRoute = (pattern: string, handler: MockRouteHandler) => {
  mockRoutes[pattern] = handler
}

// Mock管理器
export const mockManager = {
  // 检查是否启用mock
  isEnabled(): boolean {
    return mockConfig.enabled
  },

  // 设置mock启用状态
  setEnabled(enabled: boolean): void {
    mockConfig.enabled = enabled
  },

  // 设置延迟时间
  setDelay(ms: number): void {
    mockConfig.delay = ms
  },

  // 获取当前配置
  getConfig(): MockConfig {
    return { ...mockConfig }
  },

  // 处理请求
  async handleRequest(url: string, method: string, data?: any): Promise<MockResponse<any> | null> {
    if (!this.isEnabled()) {
      return null
    }

    // 构建路由键
    const routeKey = `${method.toUpperCase()} ${url}`
    
    // 查找精确匹配的路由
    if (mockRoutes[routeKey]) {
      return await mockRoutes[routeKey](data)
    }

    // 查找模式匹配的路由
    for (const pattern in mockRoutes) {
      const matchResult = this.matchRouteWithParams(pattern, routeKey)
      if (matchResult) {
        return await mockRoutes[pattern](data, matchResult.params)
      }
    }

    console.warn(`[Mock] No handler found for ${routeKey}`)
    return null
  },

  // 路由匹配函数
  matchRoute(pattern: string, route: string): boolean {
    // 简单的通配符匹配，支持 * 和 :param 格式
    const patternRegex = pattern
      .replace(/\*/g, '.*')
      .replace(/:([^/]+)/g, '([^/]+)')
    
    const regex = new RegExp(`^${patternRegex}$`)
    return regex.test(route)
  },

  // 路由匹配并提取参数
  matchRouteWithParams(pattern: string, route: string): { params: Record<string, string> } | null {
    const paramNames: string[] = []
    const patternRegex = pattern
      .replace(/\*/g, '.*')
      .replace(/:([^/]+)/g, (fullMatch) => {
        const paramName = fullMatch.slice(1)
        paramNames.push(paramName)
        return '([^/]+)'
      })
    
    const regex = new RegExp(`^${patternRegex}$`)
    const match = route.match(regex)
    
    if (!match) {
      return null
    }

    const params: Record<string, string> = {}
    paramNames.forEach((paramName, index) => {
      params[paramName] = match[index + 1]
    })

    return { params }
  },

  // 注册路由
  registerRoute(pattern: string, handler: MockRouteHandler): void {
    mockRoutes[pattern] = handler
  },

  // 获取所有注册的路由
  getRoutes(): Record<string, MockRouteHandler> {
    return { ...mockRoutes }
  }
}

// 导出工具函数
export { delay, createMockResponse, MockDataGenerator }

// 导出所有mock数据模块
export * from './auth'
export * from './category'
export * from './order'
export * from './account'
export * from './payment'
export * from './notification'
export * from './system'

// 自动注册所有mock路由
;(async () => {
  try {
    const { registerAllMockRoutes } = await import('./routes')
    registerAllMockRoutes()
  } catch (e) {
    console.warn('[Mock] Failed to auto-register routes:', e)
  }
})()