// Mock数据验证工具
// 用于验证Mock数据文件的完整性和正确性

import { mockManager } from './index'

export interface MockValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  routeCount: number
  validRoutes: string[]
  invalidRoutes: string[]
}

export class MockValidator {
  // 验证Mock数据系统完整性
  static validateMockSystem(): MockValidationResult {
    const result: MockValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      routeCount: 0,
      validRoutes: [],
      invalidRoutes: []
    }

    console.log('[Mock Validator] ==================== Mock System Validation ====================')

    try {
      // 检查Mock管理器是否正确初始化
      if (!mockManager) {
        result.errors.push('Mock manager is not initialized')
        result.isValid = false
        return result
      }

      // 检查Mock是否启用
      if (!mockManager.isEnabled()) {
        result.warnings.push('Mock system is disabled')
      }

      // 获取所有注册的路由
      const routes = mockManager.getRoutes()
      result.routeCount = Object.keys(routes).length

      if (result.routeCount === 0) {
        result.errors.push('No mock routes registered')
        result.isValid = false
        return result
      }

      console.log(`[Mock Validator] Found ${result.routeCount} registered routes`)

      // 验证每个路由处理器
      Object.entries(routes).forEach(([route, handler]) => {
        try {
          if (typeof handler !== 'function') {
            result.errors.push(`Route ${route} handler is not a function`)
            result.invalidRoutes.push(route)
            result.isValid = false
          } else {
            result.validRoutes.push(route)
            console.log(`[Mock Validator] ✅ Route ${route}: Valid`)
          }
        } catch (error) {
          result.errors.push(`Route ${route} validation failed: ${error}`)
          result.invalidRoutes.push(route)
          result.isValid = false
          console.error(`[Mock Validator] ❌ Route ${route}: Invalid`, error)
        }
      })

      // 检查关键路由是否存在
      const criticalRoutes = [
        'GET /system/banners',
        'GET /category/categories', 
        'GET /system/articles'
      ]

      criticalRoutes.forEach(route => {
        if (!routes[route]) {
          result.warnings.push(`Critical route missing: ${route}`)
        } else {
          console.log(`[Mock Validator] ✅ Critical route found: ${route}`)
        }
      })

    } catch (error) {
      result.errors.push(`Mock system validation failed: ${error}`)
      result.isValid = false
      console.error('[Mock Validator] ❌ Validation error:', error)
    }

    console.log('[Mock Validator] ==================== Validation Complete ====================')
    console.log(`[Mock Validator] Val: ${result.isValid}`)
    console.log(`[Mock Validator] Errors: ${result.errors.length}`)
    console.log(`[Mock Validator] Warnings: ${result.warnings.length}`)
    console.log(`[Mock Validator] Valid routes: ${result.validRoutes.length}`)
    console.log(`[Mock Validator] Invalid routes: ${result.invalidRoutes.length}`)

    return result
  }

  // 测试特定路由
  static async testRoute(route: string, method: string = 'GET', data?: any): Promise<boolean> {
    console.log(`[Mock Validator] Testing route: ${method} ${route}`)
    
    try {
      const response = await mockManager.handleRequest(route, method, data)
      if (response) {
        console.log(`[Mock Validator] ✅ Route test successful: ${method} ${route}`)
        return true
      } else {
        console.log(`[Mock Validator] ❌ Route test failed (no response): ${method} ${route}`)
        return false
      }
    } catch (error) {
      console.error(`[Mock Validator] ❌ Route test failed (error): ${method} ${route}`, error)
      return false
    }
  }

  // 测试所有关键路由
  static async testCriticalRoutes(): Promise<{ [key: string]: boolean }> {
    console.log('[Mock Validator] ==================== Testing Critical Routes ====================')
    
    const criticalRoutes = [
      { route: '/system/banners', method: 'GET' },
      { route: '/category/categories', method: 'GET' },
      { route: '/system/articles', method: 'GET' }
    ]

    const results: { [key: string]: boolean } = {}

    for (const { route, method } of criticalRoutes) {
      const routeKey = `${method} ${route}`
      results[routeKey] = await this.testRoute(route, method)
    }

    console.log('[Mock Validator] ==================== Critical Routes Test Complete ====================')
    console.log('[Mock Validator] Results:', results)

    return results
  }
}

// 导出验证函数供外部使用
export const validateMockSystem = () => MockValidator.validateMockSystem()
export const testMockRoute = (route: string, method?: string, data?: any) => MockValidator.testRoute(route, method, data)
export const testCriticalRoutes = () => MockValidator.testCriticalRoutes()