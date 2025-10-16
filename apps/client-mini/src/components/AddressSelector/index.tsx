import { useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface AddressSelectorProps {
  value: string
  onChange: (address: string, addressId?: number) => void
  placeholder?: string
  required?: boolean
  title?: string
}

export default function AddressSelector({
  value,
  onChange,
  placeholder = '请选择地址',
  required = false,
  title = '上门地址'
}: AddressSelectorProps) {
  
  const handleChooseAddress = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/address/select/index'
    }).then(() => {
      // 监听地址选择结果
      Taro.eventCenter.once('addressSelected', (address) => {
        onChange(address.fullAddress, address.id)
      })
    })
  }, [onChange])

  return (
    <View className='address-selector'>
      <Text className='section-title'>
        {title} {required && <Text className='required'>*</Text>}
      </Text>
      <View className='selector-item' onClick={handleChooseAddress}>
        <Text className={value ? 'selected' : 'placeholder'}>
          {value || placeholder}
        </Text>
        <Text className='arrow'>&gt;</Text>
      </View>
    </View>
  )
}