import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import { getBanners, getArticles } from '@/services/system'
import './index.scss'
import { useMenu } from './useMenu'
import { Banner, Article } from '@/types'
// 更加生动的图标
import BookIcon from '@/assets/images/book-recycle.png'
import ClothesIcon from '@/assets/images/clothes-recycle.png'
import {
  Location
} from '@nutui/icons-react-taro'
import { getCdnUrl } from '@/utils/cdn'

export default function Index() {
  const { user } = useAuth()
  const { features, handleFeatureClick } = useMenu()
  const [currentCity, setCurrentCity] = useState('北京')
  const [banners, setBanners] = useState<Banner[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  loading
  useEffect(() => {
    initPageData()
    // 模拟定位
    setTimeout(() => setCurrentCity('北京市'), 1000)
  }, [])

  const initPageData = async () => {
    try {
      setLoading(true)
      const [bannersResult, articlesResult] = await Promise.all([
        getBanners(),
        getArticles()
      ])

      if (bannersResult.success) {
        setBanners(bannersResult.data || [])
      }
      if (articlesResult.success) {
        setArticles(articlesResult.data || [])
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecycleClick = useCallback((type: 'book' | 'clothes') => {
    Taro.navigateTo({
      url: `/pages/recycle/index?category=${type}`
    })
  }, [])

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
            <View className='action-btn'>立即回收</View>
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
            <View className='action-btn'>立即回收</View>
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

      {/* 活动 Banner */}
      <View className='banner-section'>
        <Swiper
          className='banner-swiper'
          indicatorDots
          autoplay
          interval={4000}
          duration={500}
          circular
          indicatorColor='rgba(255, 255, 255, 0.6)'
          indicatorActiveColor='#2E7D32'
        >
          {banners.map((banner, index) => (
            <SwiperItem key={index}>
              <View className='banner-item'>
                <Image
                  className='banner-image'
                  src={getCdnUrl(banner.image || '', { w: 750, h: 300, fmt: 'webp', q: 80 })}
                  mode='aspectFill'
                  lazyLoad
                />
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* 环保资讯 */}
      <View className='article-section'>
        <View className='section-header'>
          <Text className='section-title'>环保资讯</Text>
          <Text className='section-more'>更多</Text>
        </View>
        <View className='article-list'>
          {articles.map((article, index) => (
            <View
              key={index}
              className='article-card'
              onClick={() => Taro.showToast({ title: '文章详情即将上线', icon: 'none' })}
            >
              <Image
                className='article-image'
                src={getCdnUrl(article.imageUrl, { w: 690, h: 360, fmt: 'webp', q: 80 })}
                mode='aspectFill'
                lazyLoad
              />
              <View className='article-content'>
                <Text className='article-title'>{article.title}</Text>
                <View className='article-meta'>
                  <Text className='article-date'>{article.publishDate}</Text>
                  <Text className='article-views'>{article.views} 阅读</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
