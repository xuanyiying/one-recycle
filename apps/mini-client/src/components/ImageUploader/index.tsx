import { useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { logger } from '@/utils/logger'
import './index.scss'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxCount?: number
  title?: string
  description?: string
}

export default function ImageUploader({
  images,
  onChange,
  maxCount = 6,
  title = '物品照片',
  description = '上传物品照片有助于更准确的估价'
}: ImageUploaderProps) {
  
  const handleChooseImage = useCallback(async () => {
    const hintKey = 'image_permission_hint_shown'
    const hasShown = Taro.getStorageSync(hintKey)
    if (!hasShown) {
      const res = await Taro.showModal({
        title: '上传照片说明',
        content: '需要使用相册/相机权限用于上传物品照片以便估价与下单',
        confirmText: '继续',
        cancelText: '取消'
      })
      if (!res.confirm) {
        return
      }
      Taro.setStorageSync(hintKey, true)
    }
    Taro.chooseImage({
      count: maxCount - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        onChange([...images, ...res.tempFilePaths])
      },
      fail: (error) => {
        logger.error('选择图片失败:', error)
        Taro.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  }, [images, maxCount, onChange])

  const handleRemoveImage = useCallback((index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }, [images, onChange])

  return (
    <View className='image-uploader'>
      <Text className='section-title'>{title}</Text>
      {description && <Text className='section-desc'>{description}</Text>}
      <View className='image-upload-container'>
        {images.map((image, index) => (
          <View key={index} className='image-item'>
            <Image className='uploaded-image' src={image} mode='aspectFill' />
            <View className='remove-btn' onClick={() => handleRemoveImage(index)}>
              <Text className='remove-icon'>×</Text>
            </View>
          </View>
        ))}
        {images.length < maxCount && (
          <View className='add-image-btn' onClick={handleChooseImage}>
            <Text className='add-icon'>+</Text>
            <Text className='add-text'>添加照片</Text>
          </View>
        )}
      </View>
    </View>
  )
}
