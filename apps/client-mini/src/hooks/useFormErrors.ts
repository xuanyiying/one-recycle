/**
 * useFormErrors Hook
 * Manages form validation errors and provides error handling utilities
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useCallback } from 'react'
import { ValidationError } from '../types/order'
import { validationService } from '../services/validationService'

// ============================================================================
// Types
// ============================================================================

interface FormErrorsState {
  errors: ValidationError[]
  fieldErrors: Record<string, string>
  hasErrors: boolean
}

interface UseFormErrorsReturn extends FormErrorsState {
  setErrors: (errors: ValidationError[]) => void
  setFieldError: (field: string, message: string) => void
  clearFieldError: (field: string) => void
  clearAllErrors: () => void
  getFieldError: (field: string) => string | undefined
  validateField: (field: string, value: any) => boolean
  validateFields: (fields: Record<string, any>) => boolean
  addError: (field: string, message: string) => void
  removeError: (field: string) => void
}

// ============================================================================
// Hook
// ============================================================================

export function useFormErrors(): UseFormErrorsReturn {
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // ============================================================================
  // Error Management
  // ============================================================================

  const updateFieldErrors = useCallback((validationErrors: ValidationError[]) => {
    const grouped: Record<string, string> = {}
    validationErrors.forEach((error) => {
      // Use the first error message for each field
      if (!grouped[error.field]) {
        grouped[error.field] = error.message
      }
    })
    setFieldErrors(grouped)
  }, [])

  const handleSetErrors = useCallback((newErrors: ValidationError[]) => {
    setErrors(newErrors)
    updateFieldErrors(newErrors)
  }, [updateFieldErrors])

  const handleSetFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => {
      // Remove existing error for this field
      const filtered = prev.filter((e) => e.field !== field)
      // Add new error
      return [...filtered, { field, message }]
    })

    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }, [])

  const handleClearFieldError = useCallback((field: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== field))
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const handleClearAllErrors = useCallback(() => {
    setErrors([])
    setFieldErrors({})
  }, [])

  const handleGetFieldError = useCallback(
    (field: string): string | undefined => {
      return fieldErrors[field]
    },
    [fieldErrors]
  )

  const handleValidateField = useCallback((field: string, value: any): boolean => {
    const validationErrors = validationService.validateField(field, value)

    if (validationErrors.length > 0) {
      handleSetFieldError(field, validationErrors[0].message)
      return false
    } else {
      handleClearFieldError(field)
      return true
    }
  }, [handleSetFieldError, handleClearFieldError])

  const handleValidateFields = useCallback(
    (fields: Record<string, any>): boolean => {
      const allErrors: ValidationError[] = []

      Object.entries(fields).forEach(([field, value]) => {
        const fieldErrors = validationService.validateField(field, value)
        allErrors.push(...fieldErrors)
      })

      if (allErrors.length > 0) {
        handleSetErrors(allErrors)
        return false
      } else {
        handleClearAllErrors()
        return true
      }
    },
    [handleSetErrors, handleClearAllErrors]
  )

  const handleAddError = useCallback((field: string, message: string) => {
    setErrors((prev) => {
      // Check if error already exists
      if (prev.some((e) => e.field === field && e.message === message)) {
        return prev
      }
      return [...prev, { field, message }]
    })

    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }, [])

  const handleRemoveError = useCallback((field: string) => {
    handleClearFieldError(field)
  }, [handleClearFieldError])

  // ============================================================================
  // Return
  // ============================================================================

  return {
    errors,
    fieldErrors,
    hasErrors: errors.length > 0,
    setErrors: handleSetErrors,
    setFieldError: handleSetFieldError,
    clearFieldError: handleClearFieldError,
    clearAllErrors: handleClearAllErrors,
    getFieldError: handleGetFieldError,
    validateField: handleValidateField,
    validateFields: handleValidateFields,
    addError: handleAddError,
    removeError: handleRemoveError,
  }
}
