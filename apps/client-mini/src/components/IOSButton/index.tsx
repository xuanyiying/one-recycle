import React from 'react'
import { Button } from '@tarojs/components'
import { ButtonProps } from '@tarojs/components/types/Button'
import './index.scss'

interface IOSButtonProps extends Omit<ButtonProps, 'size' | 'type'> {
  /** iOS 按钮类型 */
  variant?: 'primary' | 'secondary' | 'text' | 'destructive'
  /** iOS 按钮尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否为加载状态 */
  loading?: boolean
  /** 按钮文字 */
  children: React.ReactNode
}

const IOSButton: React.FC<IOSButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const buttonClass = [
    'ios-button',
    `ios-button-${variant}`,
    `ios-button-${size}`,
    loading && 'loading',
    disabled && 'disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <Button
      className={buttonClass}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '' : children}
    </Button>
  )
}

export default IOSButton