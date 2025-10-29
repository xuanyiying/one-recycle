import React from 'react'
import { Input } from '@tarojs/components'
import { InputProps } from '@tarojs/components/types/Input'
import './index.scss'

interface IOSInputProps extends Omit<InputProps, 'className'> {
  /** 输入框类型 */
  variant?: 'default' | 'search' | 'number'
  /** 是否有错误状态 */
  error?: boolean
  /** 错误信息 */
  errorMessage?: string
  /** 自定义样式类名 */
  className?: string
}

const IOSInput: React.FC<IOSInputProps> = ({
  variant = 'default',
  error = false,
  errorMessage,
  className = '',
  ...props
}) => {
  const inputClass = [
    'ios-input-component',
    `ios-input-${variant}`,
    error && 'ios-input-error',
    className
  ].filter(Boolean).join(' ')

  return (
    <>
      <Input
        className={inputClass}
        {...props}
      />
      {error && errorMessage && (
        <text className="ios-input-error-message">{errorMessage}</text>
      )}
    </>
  )
}

export default IOSInput