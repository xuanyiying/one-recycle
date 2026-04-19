import React from 'react'
import { Button } from '@nutui/nutui-react-taro'
import { View } from '@tarojs/components'
import './index.scss'

interface IconButtonProps {
  icon: React.ReactNode
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'text'
  className?: string
  onClick?: () => void
  disabled?: boolean
  size?: 'small' | 'normal' | 'large'
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
  size = 'normal'
}) => {
  // Map variant to NutUI button type/plain
  const getButtonType = () => {
    switch (variant) {
      case 'primary': return 'primary'
      case 'secondary': return 'default'
      case 'text': return 'default' // handled by custom class
      default: return 'default'
    }
  }

  const isPlain = variant === 'secondary' || variant === 'text'

  return (
    <Button
      className={`icon-button icon-button-${variant} icon-button-${size} ${className}`}
      type={getButtonType()}
      plain={isPlain}
      onClick={onClick}
      disabled={disabled}
    >
      <View className="btn-content">
        <View className="btn-icon">{icon}</View>
        <View className="btn-text">{children}</View>
      </View>
    </Button>
  )
}
