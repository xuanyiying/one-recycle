import React from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

interface IOSListItemProps {
  /** 主标题 */
  title: string
  /** 副标题 */
  subtitle?: string
  /** 右侧附件内容 */
  accessory?: React.ReactNode
  /** 点击事件 */
  onClick?: () => void
  /** 是否显示分隔线 */
  showDivider?: boolean
}

interface IOSListSectionProps {
  /** 分组标题 */
  header?: string
  /** 分组底部说明 */
  footer?: string
  /** 列表项 */
  children: React.ReactNode
}

interface IOSListProps {
  /** 列表分组 */
  children: React.ReactNode
}

// 定义复合组件类型
interface IOSListComponent extends React.FC<IOSListProps> {
  Section: React.FC<IOSListSectionProps>
  Item: React.FC<IOSListItemProps>
}

const IOSListItem: React.FC<IOSListItemProps> = ({
  title,
  subtitle,
  accessory,
  onClick,
  showDivider = true
}) => {
  return (
    <View 
      className={`ios-list-item ${!showDivider ? 'no-divider' : ''}`}
      onClick={onClick}
    >
      <View className="ios-list-item-content">
        <Text className="ios-list-item-title">{title}</Text>
        {subtitle && (
          <Text className="ios-list-item-subtitle">{subtitle}</Text>
        )}
      </View>
      {accessory && (
        <View className="ios-list-item-accessory">
          {accessory}
        </View>
      )}
    </View>
  )
}

const IOSListSection: React.FC<IOSListSectionProps> = ({
  header,
  footer,
  children
}) => {
  return (
    <View className="ios-list-section">
      {header && (
        <Text className="ios-list-header">{header}</Text>
      )}
      <View className="ios-list-group">
        {children}
      </View>
      {footer && (
        <Text className="ios-list-footer">{footer}</Text>
      )}
    </View>
  )
}

const IOSList: IOSListComponent = ({ children }) => {
  return (
    <View className="ios-list">
      {children}
    </View>
  )
}

// 添加子组件到主组件
IOSList.Section = IOSListSection
IOSList.Item = IOSListItem

export default IOSList