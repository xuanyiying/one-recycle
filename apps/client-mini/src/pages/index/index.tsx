import { useState, useEffect, useCallback } from 'react'
import { usePullDownRefresh } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { getQAList, getNewsBriefs } from '@/services/system'
import './index.scss'
import { useMenu } from './useMenu'
import { useRecycleNavigation } from './useRecycleNavigation'
import { QAItem, NewsBrief } from '@/types'
// 更加生动的图标
import BookIcon from '@/assets/images/book-recycle.png'
import ClothesIcon from '@/assets/images/clothes-recycle.png'
import {
  Location
} from '@nutui/icons-react-taro'

export default function Index() {
  const { user } = useAuth()
  const { features, handleFeatureClick } = useMenu()
  const { handleRecycleClick } = useRecycleNavigation()
  const [currentCity, setCurrentCity] = useState('北京')
  const [qaList, setQAList] = useState<QAItem[]>([])
  const [newsBriefs, setNewsBriefs] = useState<NewsBrief[]>([])
  const [expandedQAId, setExpandedQAId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  loading
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
      const [qaResult, newsResult] = await Promise.all([
        getQAList(),
        getNewsBriefs()
      ])

      if (qaResult.success) {
        setQAList(qaResult.data || [])
      }
      if (newsResult.success) {
        setNewsBriefs(newsResult.data || [])
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCitySelect = useCallback(() => {
    Taro.showToast({ title: '城市选择功能开发中', icon: 'none' })
  }, [])

  return (
    <View className='index-page'>
      {/* 自定义导航栏背景 */}
      <View className='nav-bg' />

      {/* 顶部区域 */}
      {/* 顶部沉浸式区域 */}
      <View className='header'>
        <View className='header-content'>
          <View className='location-pill' onClick={handleCitySelect}>
            <Location size={14} color='#263238' />
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

      {/* 核心操作区 (双卡片) */}
      {/* 核心操作区 (大卡片) */}
      <View className='core-action-area'>
        <View
          className='action-card book-card'
          onClick={() => handleRecycleClick('book')}
          hoverClass='card-hover'
          hoverStayTime={100}
        >
          <View className='card-content'>
            <Text className='card-title'>旧书回收</Text>
            <Text className='card-desc'>无需分拣 · 免费上门</Text>
            <View className='price-pill'>
              <Text className='unit'>最高</Text>
              <Text className='price'>1.2</Text>
              <Text className='unit'>元/kg</Text>
            </View>
            <View className='action-btn'>立即预约</View>
          </View>
          <Image
            className='card-bg-img'
            src={BookIcon}
            mode='aspectFit'
            lazyLoad
          />
        </View>

        <View
          className='action-card clothes-card'
          onClick={() => handleRecycleClick('clothes')}
          hoverClass='card-hover'
          hoverStayTime={100}
        >
          <View className='card-content'>
            <Text className='card-title'>旧衣回收</Text>
            <Text className='card-desc'>统统回收 · 公益环保</Text>
            <View className='price-pill'>
              <Text className='unit'>最高</Text>
              <Text className='price'>0.8</Text>
              <Text className='unit'>元/kg</Text>
            </View>
            <View className='action-btn'>立即预约</View>
          </View>
          <Image
            className='card-bg-img'
            src={ClothesIcon}
            mode='aspectFit'
            lazyLoad
          />
        </View>
      </View>

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

      {/* 问答区域 (原轮播图) */}
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

      {/* 简讯 (原环保资讯) */}
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
                      <Text className='earning-value'>¥{news.earnings.toFixed(2)}</Text>
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
