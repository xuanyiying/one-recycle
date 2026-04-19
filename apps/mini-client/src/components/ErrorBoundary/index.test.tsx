import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './index'

describe('ErrorBoundary', () => {
  const errorSpy = vi.spyOn(console, 'error')

  beforeEach(() => {
    errorSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>正常内容</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('正常内容')).toBeInTheDocument()
  })

  it('renders fallback UI when a child throws', () => {
    const onError = vi.fn()
    const Thrower = () => {
      throw new Error('boom')
    }

    render(
      <ErrorBoundary onError={onError}>
        <Thrower />
      </ErrorBoundary>
    )

    expect(screen.getByText('出错了')).toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
  })
})
