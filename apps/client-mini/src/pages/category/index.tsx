import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { Icon } from '@taroify/icons'
import './index.scss'

// 分类数据 - 使用taro-ui图标
const CATEGORIES = [
  { id: 1, name: '手机数码', icon: 'iphone', color: '#4A90E2' },
  { id: 2, name: '家用电器', icon: 'home', color: '#50C878' },
  { id: 3, name: '电脑办公', icon: 'laptop', color: '#FF6B6B' },
  { id: 4, name: '服装鞋帽', icon: 'shopping-bag', color: '#FFD93D' },
  { id: 5, name: '图书音像', icon: 'bookmark', color: '#9B59B6' },
  { id: 6, name: '运动户外', icon: 'heart', color: '#FF8C00' },
  { id: 7, name: '美妆护肤', icon: 'star', color: '#FF69B4' },
  { id: 8, name: '母婴用品', icon: 'gift', color: '#87CEEB' },
  { id: 9, name: '汽车用品', icon: 'map-pin', color: '#32CD32' },
  { id: 10, name: '家居建材', icon: 'settings', color: '#DDA0DD' },
  { id: 11, name: '食品饮料', icon: 'coffee', color: '#FF4500' },
  { id: 12, name: '其他物品', icon: 'folder', color: '#708090' }
]

const CategoryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  useEffect(() => {
    Taro.setNavigationBarTitle({
      title: '回收分类'
    })
  }, [])

  // 处理分类点击
  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    setSelectedCategory(category.id)
    
    // 跳转到回收表单页面
    Taro.navigateTo({
      url: `/pages/recycle/index?categoryId=${category.id}&category=${encodeURIComponent(category.name)}`
    })
  }

  return (
    <View className='category-page'>
      <View className='header'>
        <Text className='title'>选择回收分类</Text>
        <Text className='subtitle'>请选择您要回收的物品类型</Text>
      </View>

      <View className='category-grid'>
        {CATEGORIES.map((category) => (
          <View
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'selected' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            <View 
              className='category-icon'
              style={{ backgroundColor: category.color }}
            >
              <Icon name={category.icon} size='24' color='#fff' />
            </View>
            <Text className='category-name'>{category.name}</Text>
          </View>
        ))}
      </View>

      <View className='tips'>
        <Text className='tips-text'>💡 选择分类后将为您创建回收订单</Text>
      </View>
    </View>
  )
}

export default CategoryPage