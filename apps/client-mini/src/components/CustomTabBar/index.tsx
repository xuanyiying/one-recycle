import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '@taroify/icons'
import './index.scss'

interface TabItem {
  pagePath: string
  text: string
  iconName: string
  selectedIconName?: string
}

const tabList: TabItem[] = [
  {
    pagePath: 'pages/index/index',
    text: '首页',
    iconName: 'home',
    selectedIconName: 'home'
  },
  {
    pagePath: 'pages/recycle/index',
    text: '回收',
    iconName: 'recycle',
    selectedIconName: 'recycle'
  },
  {
    pagePath: 'pages/order/list/index',
    text: '订单',
    iconName: 'orders',
    selectedIconName: 'orders'
  },
  {
    pagePath: 'pages/profile/index',
    text: '我的',
    iconName: 'user',
    selectedIconName: 'user'
  }
]

export default function CustomTabBar() {
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    // 获取当前页面路径
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage.route

    // 找到当前页面对应的 tab 索引
    const currentIndex = tabList.findIndex(item => item.pagePath === currentRoute)
    if (currentIndex !== -1) {
      setSelected(currentIndex)
    }
  }, [])

  const switchTab = (item: TabItem, index: number) => {
    const url = `/${item.pagePath}`
    Taro.switchTab({ url })
    setSelected(index)
  }

  return (
    <View className='custom-tab-bar'>
      {tabList.map((item, index) => (
        <View
          key={index}
          className={`tab-item ${selected === index ? 'selected' : ''}`}
          onClick={() => switchTab(item, index)}
        >
          <View className='tab-icon'>
            <Icon 
              name={selected === index ? (item.selectedIconName || item.iconName) : item.iconName}
              size='22'
              color={selected === index ? '#00c896' : '#666666'}
            />
          </View>
          <Text className={`tab-text ${selected === index ? 'selected' : ''}`}>
            {item.text}
          </Text>
        </View>
      ))}
    </View>
  )
}