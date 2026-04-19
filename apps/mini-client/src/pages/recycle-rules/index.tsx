import logger from '@/utils/logger'
import { View, Text, ScrollView } from '@tarojs/components'
import { useSafeArea } from '@/hooks/useSafeArea'
import Icon from '@/components/Icon'
import { getRecycleRules, RecycleRuleItem, RecycleRuleCategory } from '@/services/system'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'

const CategoryConfig: Record<string, { title: string; icon: string; iconColor: string }> = {
  SERVICE_TYPE: { title: '服务类型', icon: 'recycle', iconColor: '#4CAF50' },
  SERVICE_SCOPE: { title: '服务范围', icon: 'location', iconColor: '#2196F3' },
  PROCESS: { title: '操作流程', icon: 'order', iconColor: '#FF9800' },
  STANDARD: { title: '回收标准', icon: 'check', iconColor: '#4CAF50' },
  POINTS_RULE: { title: '积分规则', icon: 'star', iconColor: '#FFC107' },
  NOTICE: { title: '注意事项', icon: 'info', iconColor: '#F44336' },
}

const RecycleRulesPage = () => {
  const { top: safeAreaTop } = useSafeArea()
  const [rules, setRules] = useState<RecycleRuleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const res = await getRecycleRules()
      if (res.success && res.data) {
        setRules(res.data)
      }
    } catch (error) {
      logger.error('加载回收规则失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  const groupedRules = rules.reduce((acc, rule) => {
    const category = rule.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(rule)
    return acc
  }, {} as Record<string, RecycleRuleItem[]>)

  const renderRuleItem = (rule: RecycleRuleItem, index: number) => {
    if (rule.category === 'PROCESS') {
      return (
        <View key={rule.id} className="step-item">
          <View className="step-number">{index + 1}</View>
          <View className="step-content">
            <Text className="step-title">{rule.title}</Text>
            <Text className="step-desc">{rule.content}</Text>
          </View>
        </View>
      )
    }

    if (rule.category === 'STANDARD' && rule.extra?.tags) {
      const tagClass = rule.extra.tagType === 'success' ? 'tag success' : 'tag error'
      return (
        <View key={rule.id} className="standard-group">
          <Text className="group-title">{rule.title}</Text>
          <View className="tag-list">
            {rule.extra.tags.map((tag, tagIndex) => (
              <Text key={tagIndex} className={tagClass}>{tag}</Text>
            ))}
          </View>
        </View>
      )
    }

    if (rule.category === 'NOTICE') {
      const noticeItems = rule.content.split('\n').filter(Boolean)
      return (
        <View key={rule.id} className="notice-list">
          {noticeItems.map((item, itemIndex) => (
            <Text key={itemIndex} className="notice-item">{item}</Text>
          ))}
        </View>
      )
    }

    return (
      <View key={rule.id} className="rule-item">
        <Text className="rule-label">{rule.title}</Text>
        <Text className="rule-value">{rule.content}</Text>
      </View>
    )
  }

  const renderSection = (category: RecycleRuleCategory, items: RecycleRuleItem[]) => {
    const config = CategoryConfig[category] || { title: category, icon: 'info', iconColor: '#666' }

    if (category === 'SERVICE_TYPE') {
      return (
        <View key={category} className="section">
          <View className="section-header">
            <View className="section-icon">
              <Icon name={config.icon} size={20} color={config.iconColor} />
            </View>
            <Text className="section-title">{config.title}</Text>
          </View>
          <View className="section-body">
            {items.map((item) => (
              <View key={item.id} className="service-item">
                <Text className="service-name">{item.title}</Text>
                <Text className="service-desc">{item.content}</Text>
              </View>
            ))}
          </View>
        </View>
      )
    }

    if (category === 'PROCESS') {
      return (
        <View key={category} className="section">
          <View className="section-header">
            <View className="section-icon">
              <Icon name={config.icon} size={20} color={config.iconColor} />
            </View>
            <Text className="section-title">{config.title}</Text>
          </View>
          <View className="section-body">
            <View className="step-list">
              {items.map((item, index) => renderRuleItem(item, index))}
            </View>
          </View>
        </View>
      )
    }

    if (category === 'STANDARD') {
      return (
        <View key={category} className="section">
          <View className="section-header">
            <View className="section-icon">
              <Icon name={config.icon} size={20} color={config.iconColor} />
            </View>
            <Text className="section-title">{config.title}</Text>
          </View>
          <View className="section-body">
            {items.map((item) => renderRuleItem(item, 0))}
          </View>
        </View>
      )
    }

    return (
      <View key={category} className="section">
        <View className="section-header">
          <View className="section-icon">
            <Icon name={config.icon} size={20} color={config.iconColor} />
          </View>
          <Text className="section-title">{config.title}</Text>
        </View>
        <View className="section-body">
          {items.map((item) => renderRuleItem(item, 0))}
        </View>
      </View>
    )
  }

  const categoryOrder: RecycleRuleCategory[] = [
    'SERVICE_TYPE',
    'SERVICE_SCOPE',
    'PROCESS',
    'STANDARD',
    'POINTS_RULE',
    'NOTICE',
  ]

  return (
    <View className="recycle-rules-page">
      <View className="custom-nav" style={{ paddingTop: `${safeAreaTop}px` }}>
        <View className="nav-content">
          <View className="nav-back" onClick={handleBack}>
            <Icon name="arrow-left" size={20} color="#333" />
          </View>
          <Text className="nav-title">平台回收规则</Text>
          <View className="nav-placeholder" />
        </View>
      </View>

      <ScrollView className="rules-content" scrollY>
        {loading ? (
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : rules.length === 0 ? (
          <View className="empty-container">
            <Text className="empty-text">暂无规则内容</Text>
          </View>
        ) : (
          categoryOrder.map((category) => {
            const items = groupedRules[category]
            if (items && items.length > 0) {
              return renderSection(category, items)
            }
            return null
          })
        )}
        <View className="bottom-padding" />
      </ScrollView>
    </View>
  )
}

export default RecycleRulesPage
