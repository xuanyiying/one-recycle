import { View, Text, Image } from '@tarojs/components'
import React from 'react'
import BookIcon from '@/assets/images/book-recycle.webp'
import ClothesIcon from '@/assets/images/clothes-recycle.webp'
import './index.scss'

interface RecycleCardProps {
  type: 'book' | 'clothes';
  onClick: () => void;
  className?: string;
}

export const RecycleCard: React.FC<RecycleCardProps> = ({ type, onClick, className = '' }) => {
  const config = {
    book: {
      title: '旧书回收',
      desc: '无需分拣 · 免费上门',
      icon: BookIcon,
      class: 'book-card'
    },
    clothes: {
      title: '旧衣回收',
      desc: '统统回收 · 公益环保',
      icon: ClothesIcon,
      class: 'clothes-card'
    }
  }

  const item = config[type]

  return (
    <View
      className={`action-card ${item.class} ${className}`}
      onClick={onClick}
      hoverClass='card-hover'
      hoverStayTime={100}
    >
      <View className='card-content'>
        <Text className='card-title'>{item.title}</Text>
        <Text className='card-desc'>{item.desc}</Text>
        <View className='price-pill'>
          <Text className='unit'>查看实时价格</Text>
        </View>
        <View className='action-btn'>立即预约</View>
      </View>
      <Image
        className='card-bg-img'
        src={item.icon}
        mode='aspectFit'
      />
    </View>
  )
}
