/**
 * useFormErrors Hook Unit Tests
 * Tests form error management functionality
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormErrors } from './useFormErrors'
import { ValidationError } from '../types/order'

// ============================================================================
// Tests
// ============================================================================

describe('useFormErrors Hook', () => {
  it('should initialize with empty errors', () => {
    const { result } = renderHook(() => useFormErrors())
    expect(result.current.errors).toHaveLength(0)
    expect(result.current.fieldErrors).toEqual({})
    expect(result.current.hasErrors).toBe(false)
  })

  it('should set errors', () => {
    const { result } = renderHook(() => useFormErrors())
    const errors: ValidationError[] = [
      { field: 'categoryId', message: 'Required' },
      { field: 'weight', message: 'Invalid' },
    ]

    act(() => {
      result.current.setErrors(errors)
    })

    expect(result.current.errors).toHaveLength(2)
    expect(result.current.hasErrors).toBe(true)
    expect(result.current.fieldErrors.categoryId).toBe('Required')
    expect(result.current.fieldErrors.weight).toBe('Invalid')
  })

  it('should set field error', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      result.current.setFieldError('categoryId', 'Category is required')
    })

    expect(result.current.errors).toHaveLength(1)
    expect(result.current.fieldErrors.categoryId).toBe('Category is required')
  })

  it('should clear field error', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      result.current.setFieldError('categoryId', 'Required')
      result.current.setFieldError('weight', 'Invalid')
    })

    expect(result.current.errors).toHaveLength(2)

    act(() => {
      result.current.clearFieldError('categoryId')
    })

    expect(result.current.errors).toHaveLength(1)
    expect(result.current.fieldErrors.categoryId).toBeUndefined()
    expect(result.current.fieldErrors.weight).toBe('Invalid')
  })

  it('should clear all errors', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      result.current.setFieldError('categoryId', 'Required')
      result.current.setFieldError('weight', 'Invalid')
    })

    expect(result.current.errors).toHaveLength(2)

    act(() => {
      result.current.clearAllErrors()
    })

    expect(result.current.errors).toHaveLength(0)
    expect(result.current.fieldErrors).toEqual({})
    expect(result.current.hasErrors).toBe(false)
  })

  it('should get field error', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      result.current.setFieldError('categoryId', 'Required')
    })

    const error = result.current.getFieldError('categoryId')
    expect(error).toBe('Required')

    const nonExistentError = result.current.getFieldError('weight')
    expect(nonExistentError).toBeUndefined()
  })

  it('should validate field', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      const isValid = result.current.validateField('categoryId', 'electronics')
      expect(isValid).toBe(true)
    })

    expect(result.current.hasErrors).toBe(false)

    act(() => {
      const isValid = result.current.validateField('categoryId', '')
      expect(isValid).toBe(false)
    })

    expect(result.current.hasErrors).toBe(true)
    expect(result.current.fieldErrors.categoryId).toBeDefined()
  })

  it('should validate multiple fields', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      const isValid = result.current.validateFields({
        categoryId: 'electronics',
        weight: 1.5,
        phoneNumber: '13800138000',
      })
      expect(isValid).toBe(true)
    })

    expect(result.current.hasErrors).toBe(false)

    act(() => {
      const isValid = result.current.validateFields({
        categoryId: '',
        weight: 0,
        phoneNumber: 'invalid',
      })
      expect(isValid).toBe(false)
    })

    expect(result.current.hasErrors).toBe(true)
    expect(Object.keys(result.current.fieldErrors).length).toBeGreaterThan(0)
  })

  it('should add error', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      result.current.addError('categoryId', 'Required')
    })

    expect(result.current.errors).toHaveLength(1)
    expect(result.current.fieldErrors.categoryId).toBe('Required')
  })

  it('should not add duplicate errors', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      result.current.addError('categoryId', 'Required')
      result.current.addError('categoryId', 'Required')
    })

    expect(result.current.errors).toHaveLength(1)
  })

  it('should remove error', () => {
    const { result } = renderHook(() => useFormErrors())

    act(() => {
      result.current.addError('categoryId', 'Required')
    })

    expect(result.current.errors).toHaveLength(1)

    act(() => {
      result.current.removeError('categoryId')
    })

    expect(result.current.errors).toHaveLength(0)
    expect(result.current.fieldErrors.categoryId).toBeUndefined()
  })
})
