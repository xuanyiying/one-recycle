import { View, Text, Image } from '@tarojs/components'
import React from 'react'
import { Category } from '@/types/category'
import './index.scss'

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  className?: string;
}

// 根据分类ID或名称生成对应的颜色主题
const getCategoryTheme = (category: Category): { bgColor: string; shadowColor: string; btnColor: string } => {
  // 根据分类名称关键词匹配主题色
  const name = category.name.toLowerCase()

  if (name.includes('书') || name.includes('book')) {
    return {
      bgColor: 'linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)',
      shadowColor: 'rgba(33, 150, 243, 0.15)',
      btnColor: '#2196F3'
    }
  }

  if (name.includes('衣') || name.includes('cloth') || name.includes('服')) {
    return {
      bgColor: 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%)',
      shadowColor: 'rgba(76, 175, 80, 0.15)',
      btnColor: '#4CAF50'
    }
  }

  if (name.includes('电') || name.includes('器') || name.includes('数码') || name.includes('electronic')) {
    return {
      bgColor: 'linear-gradient(135deg, #FFF3E0 0%, #FFFFFF 100%)',
      shadowColor: 'rgba(255, 152, 0, 0.15)',
      btnColor: '#FF9800'
    }
  }

  if (name.includes('家') || name.includes('具') || name.includes('furniture')) {
    return {
      bgColor: 'linear-gradient(135deg, #F3E5F5 0%, #FFFFFF 100%)',
      shadowColor: 'rgba(156, 39, 176, 0.15)',
      btnColor: '#9C27B0'
    }
  }

  if (name.includes('纸') || name.includes('paper') || name.includes('塑料') || name.includes('瓶')) {
    return {
      bgColor: 'linear-gradient(135deg, #E0F7FA 0%, #FFFFFF 100%)',
      shadowColor: 'rgba(0, 188, 212, 0.15)',
      btnColor: '#00BCD4'
    }
  }

  if (name.includes('金') || name.includes('属') || name.includes('metal')) {
    return {
      bgColor: 'linear-gradient(135deg, #ECEFF1 0%, #FFFFFF 100%)',
      shadowColor: 'rgba(96, 125, 139, 0.15)',
      btnColor: '#607D8B'
    }
  }

  // 默认主题色
  return {
    bgColor: 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%)',
    shadowColor: 'rgba(76, 175, 80, 0.15)',
    btnColor: '#4CAF50'
  }
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, className = '' }) => {
  const theme = getCategoryTheme(category)

  // 获取价格显示文本
  const getPriceText = (): string => {
    const { priceInfo } = category
    if (!priceInfo) return '查看实时价格'

    switch (priceInfo.type) {
      case 'fixed':
        return priceInfo.unitPrice ? `¥${priceInfo.unitPrice}/${priceInfo.unit}` : '查看实时价格'
      case 'range':
        if (priceInfo.minPrice && priceInfo.maxPrice) {
          return `¥${priceInfo.minPrice}-${priceInfo.maxPrice}/${priceInfo.unit}`
        }
        return '查看实时价格'
      case 'negotiable':
      default:
        return '查看实时价格'
    }
  }

  return (
    <View
      className={`category-card ${className}`}
      onClick={onClick}
      hoverClass='category-card-hover'
      hoverStayTime={100}
      style={{
        background: theme.bgColor,
        boxShadow: `0 16rpx 32rpx ${theme.shadowColor}`
      }}
    >
      <View className='card-content'>
        <Text className='card-title'>{category.name}</Text>
        <Text className='card-desc'>{category.description || '环保回收 · 免费上门'}</Text>
        <View className='price-pill'>
          <Text className='unit'>{getPriceText()}</Text>
        </View>
        <View
          className='action-btn'
          style={{ backgroundColor: theme.btnColor }}
        >
          立即预约
        </View>
      </View>
      {category.icon?.url ? (
        <Image
          className='card-bg-img'
          src={category.icon.url}
          mode='aspectFit'
        />
      ) : (
        <View className='card-bg-placeholder'>
          <Text className='card-bg-emoji'>♻️</Text>
        </View>
      )}
    </View>
  )
}
