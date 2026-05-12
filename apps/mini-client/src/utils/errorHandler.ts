import Taro from '@tarojs/taro';
import { logger } from './logger';

/**
 * Global Error Handler
 * Provides centralized error handling with user-friendly messages and retry logic
 */

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',

  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  INVALID_SMS_CODE = 'INVALID_SMS_CODE',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',

  // Business logic errors
  DUPLICATE_PHONE = 'DUPLICATE_PHONE',
  ORDER_ALREADY_CANCELLED = 'ORDER_ALREADY_CANCELLED',
  CANNOT_DELETE_DEFAULT_ADDRESS = 'CANNOT_DELETE_DEFAULT_ADDRESS',

  // Rate limiting
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SMS_RATE_LIMIT_EXCEEDED = 'SMS_RATE_LIMIT_EXCEEDED',

  // Server errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  BAD_GATEWAY = 'BAD_GATEWAY',
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT',

  // Unknown error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode?: number;
  timestamp: number;
  retryable: boolean;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: AppError) => void;
}

class ErrorHandler {
  private lastToastTime = 0
  private lastToastMessage = ''
  private static readonly TOAST_DEBOUNCE_MS = 2000

  private readonly ERROR_MESSAGES: Record<ErrorCode, string> = {
    // Network errors
    [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
    [ErrorCode.NETWORK_TIMEOUT]: '网络请求超时，请稍后重试',
    [ErrorCode.NETWORK_OFFLINE]: '当前无网络连接',

    // Authentication errors
    [ErrorCode.UNAUTHORIZED]: '请先登录',
    [ErrorCode.TOKEN_EXPIRED]: '登录已过期，请重新登录',
    [ErrorCode.INVALID_TOKEN]: '登录信息无效，请重新登录',

    // Authorization errors
    [ErrorCode.FORBIDDEN]: '没有权限执行此操作',
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: '权限不足',

    // Validation errors
    [ErrorCode.INVALID_INPUT]: '输入信息有误，请检查后重试',
    [ErrorCode.MISSING_REQUIRED_FIELD]: '请填写必填项',
    [ErrorCode.INVALID_PHONE_FORMAT]: '手机号格式不正确',
    [ErrorCode.INVALID_SMS_CODE]: '验证码错误或已过期',

    // Resource errors
    [ErrorCode.NOT_FOUND]: '请求的资源不存在',
    [ErrorCode.USER_NOT_FOUND]: '用户不存在',
    [ErrorCode.ORDER_NOT_FOUND]: '订单不存在',
    [ErrorCode.ADDRESS_NOT_FOUND]: '地址不存在',

    // Business logic errors
    [ErrorCode.DUPLICATE_PHONE]: '该手机号已被注册',
    [ErrorCode.ORDER_ALREADY_CANCELLED]: '订单已取消',
    [ErrorCode.CANNOT_DELETE_DEFAULT_ADDRESS]: '无法删除默认地址',

    // Rate limiting
    [ErrorCode.TOO_MANY_REQUESTS]: '操作过于频繁，请稍后重试',
    [ErrorCode.SMS_RATE_LIMIT_EXCEEDED]: '验证码发送过于频繁，请稍后重试',

    // Server errors
    [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器繁忙，请稍后重试',
    [ErrorCode.SERVICE_UNAVAILABLE]: '服务暂时不可用',
    [ErrorCode.BAD_GATEWAY]: '网关错误',
    [ErrorCode.GATEWAY_TIMEOUT]: '网关超时',

    // Unknown error
    [ErrorCode.UNKNOWN_ERROR]: '未知错误，请稍后重试',
  };

  private readonly RETRYABLE_ERRORS = new Set([
    ErrorCode.NETWORK_ERROR,
    ErrorCode.NETWORK_TIMEOUT,
    ErrorCode.NETWORK_OFFLINE,
    ErrorCode.INTERNAL_SERVER_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.BAD_GATEWAY,
    ErrorCode.GATEWAY_TIMEOUT,
  ]);

  /**
   * Handle error and convert to AppError
   */
  handle(error: any, options: ErrorHandlerOptions = {}): AppError {
    const appError = this.parseError(error);

    if (options.logError !== false) {
      this.logError(appError);
    }

    if (options.showToast !== false) {
      this.showErrorToast(appError);
    }

    if (options.onError) {
      options.onError(appError);
    }

    return appError;
  }

  /**
   * Parse error into AppError format
   */
  private parseError(error: any): AppError {
    // Already an AppError
    if (error.code && error.message && error.timestamp) {
      return error as AppError;
    }

    // Network error
    if (error.errMsg && error.errMsg.includes('request:fail')) {
      if (error.errMsg.includes('timeout')) {
        return this.createError(ErrorCode.NETWORK_TIMEOUT);
      }
      return this.createError(ErrorCode.NETWORK_ERROR);
    }

    // HTTP error response
    if (error.statusCode || error.status) {
      const statusCode = error.statusCode || error.status;
      return this.parseHttpError(statusCode, error.data || error.response?.data);
    }

    // API error response
    if (error.code && typeof error.code === 'string') {
      const errorCode = this.mapErrorCode(error.code);
      return this.createError(errorCode, error.message, error.details, error.statusCode);
    }

    // Generic error
    if (error instanceof Error) {
      return this.createError(
        ErrorCode.UNKNOWN_ERROR,
        error.message,
        { stack: error.stack }
      );
    }

    // Unknown error format
    return this.createError(ErrorCode.UNKNOWN_ERROR, String(error));
  }

  /**
   * Parse HTTP error based on status code
   */
  private parseHttpError(statusCode: number, data?: any): AppError {
    let errorCode: ErrorCode;

    switch (statusCode) {
      case 400:
        errorCode = ErrorCode.INVALID_INPUT;
        break;
      case 401:
        errorCode = data?.code === 'TOKEN_EXPIRED'
          ? ErrorCode.TOKEN_EXPIRED
          : ErrorCode.UNAUTHORIZED;
        break;
      case 403:
        errorCode = ErrorCode.FORBIDDEN;
        break;
      case 404:
        errorCode = ErrorCode.NOT_FOUND;
        break;
      case 409:
        errorCode = ErrorCode.DUPLICATE_PHONE;
        break;
      case 429:
        errorCode = ErrorCode.TOO_MANY_REQUESTS;
        break;
      case 500:
        errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
        break;
      case 502:
        errorCode = ErrorCode.BAD_GATEWAY;
        break;
      case 503:
        errorCode = ErrorCode.SERVICE_UNAVAILABLE;
        break;
      case 504:
        errorCode = ErrorCode.GATEWAY_TIMEOUT;
        break;
      default:
        errorCode = ErrorCode.UNKNOWN_ERROR;
    }

    const message = data?.message || data?.error?.message;
    const details = data?.details || data?.error?.details;

    return this.createError(errorCode, message, details, statusCode);
  }

  /**
   * Map string error code to ErrorCode enum
   */
  private mapErrorCode(code: string): ErrorCode {
    const upperCode = code.toUpperCase();
    if (upperCode in ErrorCode) {
      return ErrorCode[upperCode as keyof typeof ErrorCode];
    }
    return ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * Create AppError object
   */
  private createError(
    code: ErrorCode,
    message?: string,
    details?: any,
    statusCode?: number
  ): AppError {
    return {
      code,
      message: message || this.ERROR_MESSAGES[code],
      details,
      statusCode,
      timestamp: Date.now(),
      retryable: this.RETRYABLE_ERRORS.has(code),
    };
  }

  /**
   * Show error toast to user
   */
  private showErrorToast(error: AppError): void {
    const now = Date.now()
    if (
      error.message === this.lastToastMessage &&
      now - this.lastToastTime < ErrorHandler.TOAST_DEBOUNCE_MS
    ) {
      return
    }
    this.lastToastTime = now
    this.lastToastMessage = error.message
    Taro.showToast({
      title: error.message,
      icon: 'none',
      duration: 2500,
    });
  }

  /**
   * Log error for debugging
   */
  private logError(error: AppError): void {
    logger.error('[Error Handler]', {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode,
      timestamp: new Date(error.timestamp).toISOString(),
      retryable: error.retryable,
    });

    // In production, send to error tracking service
    this.sendToErrorTracking(error);
  }

  /**
   * Send error to tracking service (placeholder)
   */
  private sendToErrorTracking(error: AppError): void {
    // TODO: Implement error tracking service integration
    // e.g., Sentry, Bugsnag, etc.
    logger.log('[Error Tracking]', error);
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: AppError): boolean {
    return error.retryable;
  }

  /**
   * Get user-friendly error message
   */
  getMessage(error: AppError): string {
    return error.message;
  }
}

// Singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;

/**
 * Retry logic with exponential backoff
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: AppError) => void;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: AppError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = errorHandler.handle(error, { showToast: false, logError: attempt === maxRetries });

      // Don't retry if error is not retryable
      if (!errorHandler.isRetryable(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Notify retry callback
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));

      // Increase delay for next retry (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}
