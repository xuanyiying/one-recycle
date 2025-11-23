import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import './index.scss'
import {Button, Image} from '@nutui/nutui-react-taro'
import {getActiveCategories} from "@/services/category";
import { Category } from "@/types"
import { convertServiceToUICategories } from "@/utils/category"

const CategoryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
      const fetchCategories = async () => {
        // 获取分类数据，并设置到categories中
        const serviceCategories = await getActiveCategories();
        const uiCategories = convertServiceToUICategories(serviceCategories);
        setCategories(uiCategories)
        // 获取用户选择的分类，并设置到selectedCategory中
        const instance = Taro.getCurrentInstance()
        const categoryId = instance.router?.params?.categoryId
        if (categoryId) {
          setSelectedCategory(Number(categoryId))
        }
        Taro.setNavigationBarTitle({
          title: '回收分类'
        })
      }
      
      fetchCategories()
  }, [])

  // 处理分类点击
  const handleCategoryClick = (category: Category) => {
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
        {categories.map((category) => (
          <Button
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'selected' : ''}`}
            size={'small'}
            onClick={() => handleCategoryClick(category)}
          >
            <View
              className='category-icon'
            >
               <Image src={category.icon} className={'icon-image'} />
            </View>
            <Text className='category-name'>{category.name}</Text>
          </Button>
        ))}
      </View>

      <View className='tips'>
        <Text className='tips-text'>选择分类后将为您创建回收订单</Text>
      </View>
    </View>
  )
}

export default CategoryPage