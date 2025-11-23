/**
 * useNetworkError Hook
 * Manages network errors and provides retry logic
 * 
 * Requirements: 7.5
 */

import { useState, useCallback } from 'react'
import { AppError, ErrorCode } from '../utils/errorHandler'

// ============================================================================
// Types
// ============================================================================

interface UseNetworkErrorReturn {
  error: AppError | undefined
  isRetrying: boolean
  setError: (error: AppError | undefined) => void
  clearError: () => void
  retry: (fn: () => Promise<void>) => Promise<void>
  isNetworkError: boolean
  isServerError: boolean
  isRetryable: boolean
}

// ============================================================================
// Hook
// ============================================================================

export function useNetworkError(): UseNetworkErrorReturn {
  const [error, setError] = useState<AppError | undefined>()
  const [isRetrying, setIsRetrying] = useState(false)

  // ============================================================================
  // Error Detection
  // ============================================================================

  const isNetworkError =
    error?.code === ErrorCode.NETWORK_ERROR ||
    error?.code === ErrorCode.NETWORK_TIMEOUT ||
    error?.code === ErrorCode.NETWORK_OFFLINE

  const isServerError =
    error?.code === ErrorCode.INTERNAL_SERVER_ERROR ||
    error?.code === ErrorCode.SERVICE_UNAVAILABLE ||
    error?.code === ErrorCode.BAD_GATEWAY ||
    error?.code === ErrorCode.GATEWAY_TIMEOUT

  const isRetryable = error?.retryable ?? false

  // ============================================================================
  // Error Management
  // ============================================================================

  const handleClearError = useCallback(() => {
    setError(undefined)
  }, [])

  const handleRetry = useCallback(async (fn: () => Promise<void>) => {
    setIsRetrying(true)
    try {
      await fn()
      handleClearError()
    } catch (err) {
      // Error will be set by the caller
      console.error('Retry failed:', err)
    } finally {
      setIsRetrying(false)
    }
  }, [handleClearError])

  // ============================================================================
  // Return
  // ============================================================================

  return {
    error,
    isRetrying,
    setError,
    clearError: handleClearError,
    retry: handleRetry,
    isNetworkError,
    isServerError,
    isRetryable,
  }
}
