import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface IOSCardProps {
  /** 卡片内容 */
  children: React.ReactNode
  /** 自定义样式类名 */
  className?: string
  /** 点击事件 */
  onClick?: () => void
  /** 是否有悬浮效果 */
  hover?: boolean
}

const IOSCard: React.FC<IOSCardProps> = ({
  children,
  className = '',
  onClick,
  hover = false
}) => {
  const cardClass = [
    'ios-card-component',
    hover && 'hover-effect',
    onClick && 'clickable',
    className
  ].filter(Boolean).join(' ')

  return (
    <View className={cardClass} onClick={onClick}>
      {children}
    </View>
  )
}

export default IOSCard