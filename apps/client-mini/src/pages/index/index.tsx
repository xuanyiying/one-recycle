import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, Input, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button } from '@taroify/core'
import { getBanners, getArticles } from '../../services/system'
import { getAllCategories } from '../../services/category'
import './index.scss'
import { Banner, Article } from '@/types'
import { Category } from '../../types/category'
import { Icon } from '@taroify/icons'

export default function Index() {
  const [currentCity, setCurrentCity] = useState('深圳')
  const [searchValue, setSearchValue] = useState('')
  const [banners, setBanners] = useState<Banner[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // 初始化数据
  useEffect(() => {
    initPageData()
    getCurrentLocation()
  }, [])

  // 获取用户当前位置和城市信息
  const getCurrentLocation = async () => {
    try {
      // 获取用户位置授权
      const authResult = await Taro.getSetting()
      
      if (!authResult.authSetting['scope.userLocation']) {
        // 请求位置权限
        const authorizeResult = await Taro.authorize({
          scope: 'scope.userLocation'
        }).catch(() => {
          // 用户拒绝授权，使用默认城市
          console.log('用户拒绝位置授权，使用默认城市')
          return null
        })
        
        if (!authorizeResult) {
          return
        }
      }

      // 获取当前位置
      const locationResult = await Taro.getLocation({
        type: 'gcj02'
      })

      // 逆地理编码获取城市信息
      const cityResult = await getCityFromLocation(locationResult.latitude, locationResult.longitude)
      
      if (cityResult) {
        setCurrentCity(cityResult)
      }
    } catch (error) {
      console.error('获取位置信息失败:', error)
      // 保持默认城市
    }
  }

  // 根据经纬度获取城市信息
  const getCityFromLocation = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      // 这里可以调用第三方地理编码服务，比如腾讯地图、高德地图等
      // 为了演示，这里使用一个简化的实现
      
      // 可以根据实际需求接入真实的地理编码API
      // 例如：腾讯地图逆地理编码API
      const response = await fetch(
        `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=YOUR_API_KEY&get_poi=0`
      ).catch(() => null)
      
      if (response && response.ok) {
        const data = await response.json()
        if (data.status === 0 && data.result?.address_component?.city) {
          return data.result.address_component.city.replace('市', '')
        }
      }
      
      // 如果API调用失败，可以根据经纬度范围简单判断主要城市
      return getCityByCoordinates(latitude, longitude)
    } catch (error) {
      console.error('逆地理编码失败:', error)
      return null
    }
  }

  // 根据坐标简单判断城市（备用方案）
  const getCityByCoordinates = (latitude: number, longitude: number): string | null => {
    // 主要城市的大致坐标范围（简化版本）
    const cityRanges = [
      { name: '北京', lat: [39.4, 41.0], lng: [115.7, 117.4] },
      { name: '上海', lat: [30.7, 31.9], lng: [120.9, 122.0] },
      { name: '广州', lat: [22.8, 23.9], lng: [112.9, 114.0] },
      { name: '深圳', lat: [22.4, 22.8], lng: [113.7, 114.6] },
      { name: '杭州', lat: [29.9, 30.6], lng: [119.7, 120.9] },
      { name: '南京', lat: [31.8, 32.4], lng: [118.4, 119.2] },
      { name: '武汉', lat: [30.1, 31.0], lng: [113.7, 115.0] },
      { name: '成都', lat: [30.1, 31.0], lng: [103.7, 104.9] }
    ]

    for (const city of cityRanges) {
      if (
        latitude >= city.lat[0] && latitude <= city.lat[1] &&
        longitude >= city.lng[0] && longitude <= city.lng[1]
      ) {
        return city.name
      }
    }

    return null
  }

  const initPageData = async () => {
    try {
      setLoading(true)
      console.log('🚀 开始初始化页面数据...')
      
      const [bannersResult, categoriesResult, articlesResult] = await Promise.all([
        getBanners(),
        getAllCategories(),
        getArticles()
      ])
      
      console.log('📊 API调用结果:')
      console.log('- Banners:', bannersResult)
      console.log('- Categories:', categoriesResult)
      console.log('- Articles:', articlesResult)
      
      if (bannersResult.success) {
        setBanners(bannersResult.data || [])
        console.log('✅ Banners数据设置成功，数量:', bannersResult.data?.length || 0)
      } else {
        console.log('❌ Banners数据获取失败')
      }
      
      // getAllCategories直接返回数组
      setCategories(categoriesResult || [])
      console.log('✅ Categories数据设置成功，数量:', categoriesResult?.length || 0)
      
      if (articlesResult.success) {
        setArticles(articlesResult.data || [])
        console.log('✅ Articles数据设置成功，数量:', articlesResult.data?.length || 0)
      } else {
        console.log('❌ Articles数据获取失败')
      }
    } catch (error) {
      console.error('❌ 初始化页面数据失败:', error)
      Taro.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
      console.log('🏁 页面数据初始化完成')
    }
  }

  // 处理搜索
  const handleSearch = useCallback(() => {
    if (!searchValue.trim()) {
      Taro.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return
    }
    
    Taro.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(searchValue)}`
    })
  }, [searchValue])

  // 处理城市选择
  const handleCitySelect = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/city/index'
    })
  }, [])

  // 处理品类点击
  const handleCategoryClick = useCallback((categoryName: string) => {
    if (categoryName === '查看更多') {
      Taro.navigateTo({
        url: '/pages/category/index'
      })
    } else {
      Taro.navigateTo({
        url: `/pages/recycle/index?category=${encodeURIComponent(categoryName)}`
      })
    }
  }, [])

  // 处理文章点击
  const handleArticleClick = useCallback((article: any) => {
    Taro.navigateTo({
      url: `/pages/article/detail/index?id=${article.id}`
    })
  }, [])

  if (loading) {
    return (
      <View className='index-page loading'>
        <View className='loading-content'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='index-page'>
      {/* 顶部区域 */}
      <View className='header'>
        <View className='header-top'>
          <View className='logo-area'>
            <Text className='logo'>OneRecycle</Text>
          </View>
          <Button
            className='city-selector'
            variant="text"
            size="small"
            onClick={handleCitySelect}
          >
            <Text className='city-name'>{currentCity}</Text>
            <Text className='city-arrow'>▼</Text>
          </Button>
        </View>
        
        {/* 搜索框 */}
        <View className='search-container'>
          <View className='search-box'>
            <Text className='search-icon'>🔍</Text>
            <Input
              className='search-input'
              placeholder='搜索回收品类'
              value={searchValue}
              onInput={(e) => setSearchValue(e.detail.value)}
              onConfirm={handleSearch}
            />
          </View>
        </View>
      </View>

      {/* Banner 区域 */}
      <View className='banner-section'>
        <Swiper
          className='banner-swiper'
          indicatorDots
          autoplay
          interval={3000}
          duration={500}
          circular
        >
          {banners.map((banner, index) => (
            <SwiperItem key={index}>
              <View className='banner-item'>
                <Image
                  className='banner-image'
                  src={banner.image || ''}
                  mode='aspectFill'
                />
                <View className='banner-content'>
                  <Text className='banner-title'>{banner.title || ''}</Text>
                  <Text className='banner-subtitle'>{banner.subtitle || ''}</Text>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>
      {/* 品类导航 */}
      <View className='category-nav'>
        <View className='category-grid'>
          {categories.map((item, index) => (
            <Button
              key={index}
              className='category-item'
              variant="text"
              onClick={() => handleCategoryClick(item.name)}
            >
            <Icon name={item?.icon || 'book'} size='24' color='#636e72'></Icon>
            <Text className='category-name'>{item.name}</Text>
            </Button>
          ))}
        </View>
      </View>

      {/* 信息流/文章 */}
      <View className='article-section'>
        <View className='section-header'>
          <Text className='section-title'>环保资讯</Text>
          <Text className='section-more'>更多 &gt;</Text>
        </View>
        <View className='article-list'>
          {articles.map((article, index) => (
            <Button
              key={index}
              className='article-card'
              variant="text"
              onClick={() => handleArticleClick(article)}
            >
              <Image
                className='article-image'
                src={article.imageUrl}
                mode='aspectFill'
              />
              <View className='article-content'>
                <Text className='article-title'>{article.title}</Text>
                <Text className='article-summary'>{article.summary}</Text>
                <View className='article-meta'>
                  <Text className='article-date'>{article.publishDate}</Text>
                  <Text className='article-views'>{article.views}次阅读</Text>
                </View>
              </View>
            </Button>
          ))}
        </View>
      </View>
    </View>
  )
}