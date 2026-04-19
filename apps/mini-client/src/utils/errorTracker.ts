import { logger } from './logger'
import Taro from '@tarojs/taro'
import { useEffect } from 'react'

// ============= 类型定义 ====================

export interface ErrorContext {
  /** 错误时间戳 */
  timestamp: string
  /** 错误消息 */
  message: string
  /** 错误堆栈 */
  stack?: string
  /** 组件堆栈 */
  componentStack?: string
  /** 用户代理信息 */
  userAgent?: any
  /** 当前页面 */
  currentPage?: string
  /** 额外上下文数据 */
  extra?: Record<string, any>
  /** 错误类型 */
  type: 'runtime' | 'network' | 'render' | 'promise' | 'unknown'
}

export interface ErrorTrackerConfig {
  /** 是否启用错误追踪 */
  enabled?: boolean
  /** 最大错误日志数量 */
  maxLogs?: number
  /** 是否上报到服务器 */
  reportToServer?: boolean
  /** 上报接口地址 */
  reportUrl?: string
  /** 自定义错误处理 */
  onError?: (error: ErrorContext) => void
}

// ============= 错误追踪器 ====================

class ErrorTracker {
  private config: Required<ErrorTrackerConfig>
  private errorLogs: ErrorContext[] = []
  private isInitialized: boolean = false

  constructor(config: ErrorTrackerConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxLogs: config.maxLogs ?? 100,
      reportToServer: config.reportToServer ?? false,
      reportUrl: config.reportUrl ?? '',
      onError: config.onError ?? (() => {})
    }
  }

  /**
   * 初始化错误追踪器
   */
  init(): void {
    if (this.isInitialized) {
      return
    }

    if (!this.config.enabled) {
      logger.log('错误追踪器未启用')
      return
    }

    // 加载本地存储的错误日志
    this.loadErrorLogs()

    // 监听全局错误
    this.setupGlobalHandlers()

    // 启动时清理过期日志
    this.cleanupOldLogs()

    this.isInitialized = true
    logger.log('错误追踪器已初始化')
  }

  /**
   * 设置全局错误处理器
   */
  private setupGlobalHandlers(): void {
    // 监听未捕获的 Promise 错误
    Taro.onError?.((error) => {
      // @ts-ignore
      this.captureError(error, 'promise')
    })

    // 监听页面未找到错误
    Taro.onPageNotFound?.((res) => {
      this.captureError(
        new Error(`页面未找到: ${res.path}`),
        'runtime',
        { path: res.path, query: res.query }
      )
    })

    // 监听内存警告
    Taro.onMemoryWarning?.((res) => {
      logger.warn('内存警告:', res.level)
      this.captureError(
        new Error(`内存警告: level ${res.level}`),
        'runtime',
        { level: res.level }
      )
    })
  }

  /**
   * 捕获错误
   */
  captureError(
    error: Error | string,
    type: ErrorContext['type'] = 'runtime',
    extra?: Record<string, any>
  ): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error

    const errorContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      message: errorObj.message,
      stack: errorObj.stack,
      userAgent: this.getUserAgent(),
      currentPage: this.getCurrentPage(),
      type,
      extra
    }

    // 添加到日志
    this.addErrorLog(errorContext)

    // 调用自定义处理
    try {
      this.config.onError(errorContext)
    } catch (e) {
      logger.error('自定义错误处理失败:', e)
    }

    // 如果是运行时错误且不在错误页面，跳转到错误页面
    if (type === 'runtime' || type === 'render') {
      const currentPage = this.getCurrentPage()
      if (!currentPage?.includes('pages/error/index')) {
        try {
          Taro.redirectTo({
            url: `/pages/error/index?msg=${encodeURIComponent(errorObj.message)}`,
            fail: (err) => {
              logger.error('跳转到错误页面失败:', err)
            }
          })
        } catch (e) {
          logger.error('跳转错误页面异常:', e)
        }
      }
    }

    // 上报到服务器
    if (this.config.reportToServer && this.config.reportUrl) {
      this.reportToServer(errorContext)
    }
  }

  /**
   * 捕获渲染错误
   */
  captureRenderError(
    error: Error,
    errorInfo: { componentStack: string }
  ): void {
    this.captureError(error, 'render', {
      componentStack: errorInfo.componentStack
    })
  }

  /**
   * 捕获网络错误
   */
  captureNetworkError(
    url: string,
    method: string,
    error: Error | any
  ): void {
    this.captureError(
      typeof error === 'string' ? new Error(error) : error,
      'network',
      {
        url,
        method,
        status: error?.statusCode,
        response: error?.data
      }
    )
  }

  /**
   * 添加错误日志
   */
  private addErrorLog(error: ErrorContext): void {
    this.errorLogs.unshift(error)

    // 限制日志数量
    if (this.errorLogs.length > this.config.maxLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.config.maxLogs)
    }

    // 持久化到本地
    this.saveErrorLogs()
  }

  /**
   * 保存错误日志到本地
   */
  private saveErrorLogs(): void {
    try {
      Taro.setStorageSync('error_logs', this.errorLogs)
    } catch (e) {
      logger.error('保存错误日志失败:', e)
    }
  }

  /**
   * 从本地加载错误日志
   */
  private loadErrorLogs(): void {
    try {
      const logs = Taro.getStorageSync('error_logs')
      if (Array.isArray(logs)) {
        this.errorLogs = logs
      }
    } catch (e) {
      logger.error('加载错误日志失败:', e)
    }
  }

  /**
   * 清理旧的错误日志（超过 7 天）
   */
  private cleanupOldLogs(): void {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    this.errorLogs = this.errorLogs.filter(
      log => new Date(log.timestamp).getTime() > sevenDaysAgo
    )
    this.saveErrorLogs()
  }

  /**
   * 获取所有错误日志
   */
  getErrorLogs(): ErrorContext[] {
    return [...this.errorLogs]
  }

  /**
   * 清空错误日志
   */
  clearErrorLogs(): void {
    this.errorLogs = []
    try {
      Taro.removeStorageSync('error_logs')
    } catch (e) {
      logger.error('清空错误日志失败:', e)
    }
  }

  /**
   * 上报到服务器
   */
  private async reportToServer(error: ErrorContext): Promise<void> {
    if (!this.config.reportUrl) {
      return
    }

    try {
      await Taro.request({
        url: this.config.reportUrl,
        method: 'POST',
        data: {
          error: error,
          appVersion: Taro.getStorageSync('appVersion') || '1.0.0',
          platform: Taro.getSystemInfoSync().platform
        },
        header: {
          'Content-Type': 'application/json'
        }
      })
    } catch (e) {
      logger.error('上报错误失败:', e)
    }
  }

  /**
   * 获取用户代理信息
   */
  private getUserAgent(): any {
    try {
      return Taro.getSystemInfoSync()
    } catch (e) {
      return {}
    }
  }

  /**
   * 获取当前页面
   */
  private getCurrentPage(): string {
    try {
      const pages = Taro.getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        return currentPage?.route || ''
      }
    } catch (e) {
      logger.error('获取当前页面失败:', e)
    }
    return ''
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number
    byType: Record<string, number>
    recentErrors: ErrorContext[]
  } {
    const byType: Record<string, number> = {}
    
    this.errorLogs.forEach(log => {
      byType[log.type] = (byType[log.type] || 0) + 1
    })

    return {
      total: this.errorLogs.length,
      byType,
      recentErrors: this.errorLogs.slice(0, 10)
    }
  }

  /**
   * 导出错误日志
   */
  exportErrorLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2)
  }

  /**
   * 启用/禁用错误追踪
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    if (enabled && !this.isInitialized) {
      this.init()
    }
  }
}

// ============= 导出默认实例 ====================

export const errorTracker = new ErrorTracker()

// ============= 便捷的 React Hook ====================

/**
 * React Hook：自动捕获组件错误
 */
export const useErrorTracking = (extra?: Record<string, any>) => {
  useEffect(() => {
    // 确保 errorTracker 已初始化
    if (!errorTracker['isInitialized']) {
      errorTracker.init()
    }

    return () => {
      // 清理逻辑（如果需要）
    }
  }, [])

  return {
    captureError: (error: Error | string, type?: ErrorContext['type']) => {
      errorTracker.captureError(error, type, extra)
    },
    getErrorLogs: () => errorTracker.getErrorLogs(),
    clearErrorLogs: () => errorTracker.clearErrorLogs(),
    getErrorStats: () => errorTracker.getErrorStats()
  }
}

// ============= 初始化：应用启动时自动初始化 ====================

export const initErrorTracking = (config?: ErrorTrackerConfig): void => {
  if (config) {
    Object.assign(errorTracker['config'], config)
  }
  errorTracker.init()
}
