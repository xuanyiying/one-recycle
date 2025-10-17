import { useState, useEffect, useCallback } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import { Button } from '@taroify/core'
import Taro from '@tarojs/taro'

interface TimeSelectorProps {
  value: string
  onChange: (time: string) => void
  placeholder?: string
  required?: boolean
  title?: string
}

export default function TimeSelector({
  value,
  onChange,
  placeholder = '请选择时间',
  required = false,
  title = '上门时间'
}: TimeSelectorProps) {
  
  const handleChooseTime = useCallback(() => {
    Taro.showActionSheet({
      itemList: [
        '今天 14:00-18:00',
        '明天 09:00-12:00',
        '明天 14:00-18:00',
        '后天 09:00-12:00',
        '后天 14:00-18:00',
        '自定义时间'
      ],
      success: (res) => {
        const timeOptions = [
          '今天 14:00-18:00',
          '明天 09:00-12:00',
          '明天 14:00-18:00',
          '后天 09:00-12:00',
          '后天 14:00-18:00'
        ]
        
        if (res.tapIndex < timeOptions.length) {
          onChange(timeOptions[res.tapIndex])
        } else {
          // 自定义时间
          Taro.showModal({
            title: '提示',
            content: '自定义时间功能开发中',
            showCancel: false
          })
        }
      }
    })
  }, [onChange])

  return (
    <View className='time-selector'>
      <Text className='section-title'>
        {title} {required && <Text className='required'>*</Text>}
      </Text>
      <View className='selector-item' onClick={handleChooseTime}>
        <Text className={value ? 'selected' : 'placeholder'}>
          {value || placeholder}
        </Text>
        <Text className='arrow'>&gt;</Text>
      </View>
    </View>
  )
}