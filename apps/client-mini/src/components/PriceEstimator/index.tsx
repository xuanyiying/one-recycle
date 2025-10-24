import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input } from '@tarojs/components'
import './index.scss'
interface Category {
  id: number
  name: string
}

interface PriceEstimatorProps {
  categories: Category[]
  category: string
  weight: string
  onWeightChange: (weight: string) => void
  title?: string
  required?: boolean
}

export default function PriceEstimator({
  categories,
  category,
  weight,
  onWeightChange,
  title = '预估重量',
  required = false
}: PriceEstimatorProps) {
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [estimating, setEstimating] = useState(false)

  // 计算估价
  const calculatePrice = useCallback(async (categoryName: string, weightValue: number) => {
    if (!categoryName || !weightValue || weightValue <= 0) {
      setEstimatedPrice(0)
      return
    }

    try {
      setEstimating(true)
      // 找到对应的分类ID
      const categoryItem = categories.find(cat => cat.name === categoryName)
      if (!categoryItem) {
        throw new Error('未找到对应分类')
      }
      
      // 简化估价逻辑，基于重量计算
      const basePrice = 5 // 基础价格每公斤5元
      const estimatedPrice = parseFloat(weightValue.toString()) * basePrice
      setEstimatedPrice(estimatedPrice)
    } catch (error) {
      console.error('估价失败:', error)
      setEstimatedPrice(0)
    } finally {
      setEstimating(false)
    }
  }, [categories])

  // 当分类或重量变化时重新计算估价
  useEffect(() => {
    if (category && weight) {
      const weightValue = parseFloat(weight)
      if (weightValue > 0) {
        calculatePrice(category, weightValue)
      }
    } else {
      setEstimatedPrice(0)
    }
  }, [category, weight, calculatePrice])

  return (
    <View className='price-estimator'>
      <Text className='section-title'>
        {title} {required && <Text className='required'>*</Text>}
      </Text>
      <View className='weight-input-container'>
        <Input
          className='weight-input'
          type='digit'
          placeholder='请输入重量'
          value={weight}
          onInput={(e) => onWeightChange(e.detail.value)}
        />
        <Text className='weight-unit'>kg</Text>
      </View>
      {estimating && <Text className='estimating-text'>正在估价...</Text>}
      {estimatedPrice > 0 && (
        <View className='price-estimate'>
          <Text className='estimate-label'>预估价格：</Text>
          <Text className='estimate-price'>¥{estimatedPrice}</Text>
        </View>
      )}
    </View>
  )
}