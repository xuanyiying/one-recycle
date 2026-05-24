import { logger } from '@/utils/logger'
import { useState, useEffect, useCallback } from 'react'
import Taro, { usePullDownRefresh } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useAuth } from '@/hooks/useAuth'
import { getQAList, getNewsBriefs } from '@/services/system'
import { getFeaturedCategories, getActiveCategories } from '@/services/category'
import { Category } from '@/types/category'
import { QAItem, NewsBrief } from '@/types'
import { CategoryCard } from '@/components/CategoryCard'
import locationIcon from '@/assets/icons/location.svg'
import { useMenu } from './useMenu'
import './index.scss'

export default function Index() {
  const { user } = useAuth()
  const { features, handleFeatureClick } = useMenu()
  const [currentCity, setCurrentCity] = useState('北京')
  const [qaList, setQAList] = useState<QAItem[]>([])
  const [newsBriefs, setNewsBriefs] = useState<NewsBrief[]>([])
  const [expandedQAId, setExpandedQAId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [featuredCategories, setFeaturedCategories] = useState<Category[]>([])
  const [activeCategories, setActiveCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  usePullDownRefresh(async () => {
    await initPageData()
    Taro.stopPullDownRefresh()
  })

  useEffect(() => {
    initPageData()
    // 模拟定位
    setTimeout(() => setCurrentCity('北京市'), 1000)
  }, [])

  const initPageData = async () => {
    try {
      setLoading(true)
      setCategoriesLoading(true)

      // 并行获取所有数据
      const [qaResult, newsResult, featuredResult, activeResult] = await Promise.all([
        getQAList(),
        getNewsBriefs(),
        getFeaturedCategories().catch((): Category[] => []),
        getActiveCategories().catch((): Category[] => [])
      ])

      if (qaResult.success) {
        setQAList(qaResult.data || [])
      }
      if (newsResult.success) {
        setNewsBriefs(newsResult.data || [])
      }

      // 按 sortOrder 排序主推分类
      const sortedFeatured = (featuredResult || []).sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)
      setFeaturedCategories(sortedFeatured)

      // 按 sortOrder 排序活跃分类（用于Tab栏）
      const sortedActive = (activeResult || []).sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)
      setActiveCategories(sortedActive)
    } catch (error) {
      logger.error('初始化数据失败:', error)
    } finally {
      setLoading(false)
      setCategoriesLoading(false)
    }
  }

  const handleCitySelect = useCallback(() => {
    Taro.showToast({ title: '城市选择功能开发中', icon: 'none' })
  }, [])

  // 处理分类点击跳转
  const handleCategoryClick = useCallback((categoryId: number) => {
    Taro.navigateTo({
      url: `/pages/recycle/index?categoryId=${categoryId}`
    })
  }, [])

  return (
    <View className='index-page'>
      {/* 自定义导航栏背景 */}
      <View className='nav-bg' />

      {/* 顶部沉浸式区域 */}
      <View className='header'>
        <View className='header-content'>
          <View className='location-pill' onClick={handleCitySelect}>
            <Image className='location-icon' src={locationIcon} mode='aspectFit' />
            <Text className='city-name'>{currentCity}</Text>
          </View>
          <View className='weather-pill'>
            <Text className='weather-text'>🌤️ 24°C</Text>
            <Text className='weather-desc'>适合整理</Text>
          </View>
        </View>
        <View className='hello-text'>
          <Text className='title'>Hi, {user?.nickname || '环保达人'}</Text>
          <Text className='subtitle'>今天想回收什么？</Text>
        </View>
      </View>

      {/* 核心操作区 - 主推分类 */}
      <View className='core-action-area'>
        {categoriesLoading ? (
          // 骨架屏
          <>
            <View className='category-skeleton' />
            <View className='category-skeleton' />
          </>
        ) : featuredCategories.length > 0 ? (
          // 展示主推分类
          featuredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category.id)}
              className='home-action-card'
            />
          ))
        ) : (
          // 空状态：无分类数据
          <View className='empty-categories'>
            <Text className='empty-icon'>📦</Text>
            <Text className='empty-text'>暂无回收分类</Text>
            <Text className='empty-subtext'>敬请期待更多回收服务</Text>
          </View>
        )}
      </View>

      {/* 分类Tab栏 */}
      {activeCategories.length > 0 && (
        <View className='category-tabs-section'>
          <View className='section-header'>
            <Text className='section-title'>回收分类</Text>
            <Text className='section-subtitle'>点击快速预约</Text>
          </View>
          <ScrollView
            className='category-tabs-scroll'
            scrollX
            scrollWithAnimation
            showScrollbar={false}
          >
            <View className='category-tabs-list'>
              {activeCategories.map((category) => (
                <View
                  key={category.id}
                  className='category-tab-item'
                  onClick={() => handleCategoryClick(category.id)}
                  hoverClass='category-tab-hover'
                  hoverStayTime={100}
                >
                  {category.iconUrl ? (
                    <Image
                      className='category-tab-icon'
                      src={category.iconUrl}
                      mode='aspectFit'
                    />
                  ) : (
                    <View className='category-tab-icon-placeholder'>
                      <Text className='category-tab-emoji'>♻️</Text>
                    </View>
                  )}
                  <Text className='category-tab-name'>{category.name}</Text>
                  {category.isFeatured && <View className='featured-badge'>热</View>}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 功能栏 */}
      <View className='feature-bar'>
        {features.map((item) => (
          <View
            key={item.key}
            className='feature-item'
            onClick={() => handleFeatureClick(item)}
            hoverClass='feature-item-hover'
            hoverStayTime={100}
          >
            <View className='icon-box' style={{ backgroundColor: item.bgColor }}>
              {item.icon}
            </View>
            <Text className='feature-name'>{item.name}</Text>
          </View>
        ))}
      </View>

      {/* 问答区域 */}
      <View className='qa-section'>
        <View className='section-header'>
          <Text className='section-title'>常见问答</Text>
          <Text className='section-more' onClick={() => Taro.showToast({ title: '更多问答即将上线', icon: 'none' })}>查看更多</Text>
        </View>
        <View className='qa-list'>
          {qaList.slice(0, 3).map((item) => (
            <View
              key={item.id}
              className={`qa-item ${expandedQAId === item.id ? 'expanded' : ''}`}
              onClick={() => setExpandedQAId(expandedQAId === item.id ? null : item.id)}
            >
              <View className='qa-question'>
                <Text className='q-icon'>Q</Text>
                <Text className='q-text'>{item.question}</Text>
                <View className={`arrow-icon ${expandedQAId === item.id ? 'up' : 'down'}`} />
              </View>
              {expandedQAId === item.id && (
                <View className='qa-answer'>
                  <Text className='a-icon'>A</Text>
                  <Text className='a-text'>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 简讯 */}
      <View className='news-brief-section'>
        <View className='section-header'>
          <View className='title-with-icon'>
            <Text className='section-title'>简讯</Text>
            <View className='live-dot' />
          </View>
          <Text className='section-more'>更多动态</Text>
        </View>
        <View className='news-list'>
          {loading ? (
            // Skeleton Loading
            Array.from({ length: 3 }).map((_, i) => (
              <View key={i} className='news-card skeleton-card'>
                <View className='skeleton-circle' />
                <View className='skeleton-content'>
                  <View className='skeleton-line w-40' />
                  <View className='skeleton-line w-60' />
                </View>
              </View>
            ))
          ) : newsBriefs.length > 0 ? (
            newsBriefs.map((news, index) => (
              <View key={index} className='news-card'>
                <View className='news-left'>
                  <View className='news-icon-circle'>
                    <Text>🎉</Text>
                  </View>
                  <View className='news-info'>
                    <View className='news-top'>
                      <Text className='nickname'>{news.nickname}</Text>
                      <Text className='action'>卖出了</Text>
                      <Text className='items'>{news.soldItems} {news.weight}kg</Text>
                    </View>
                    <View className='news-bottom'>
                      <Text className='earning-label'>获得收益</Text>
                      <Text className='earning-value'>¥{Number(news.earnings).toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
                <Text className='news-time'>{news.time}</Text>
              </View>
            ))
          ) : (
            // Empty State
            <View className='empty-state'>
              <Text>暂无最新简讯</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
