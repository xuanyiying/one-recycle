import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AuthGuard from '@/components/AuthGuard'
import { IconFont } from '@nutui/icons-react-taro'
import './index.scss'
import { AddressData, AddressService } from '@/services/addressService'

export default function AddressSelect() {
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const response = await AddressService.getUserAddresses()

      if (response.success && response.data) {
        setAddresses(response.data)
      } else {
        throw new Error(response.error || '加载地址失败')
      }
    } catch (error) {
      console.error('加载地址失败:', error)
      Taro.showToast({
        title: '加载地址失败',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 处理地址选择
  const handleSelectAddress = useCallback(async (address: AddressData) => {
    try {
      // 设置为默认地址
      if (address.id) {
        await AddressService.setDefaultAddress(address.id)
      }

      // 构建完整地址字符串
      const fullAddress = `${address.province}${address.city}${address.district}${address.detail}`

      // 通过事件总线传递选中的地址
      Taro.eventCenter.trigger('addressSelected', {
        ...address,
        fullAddress
      })

      // 返回上一页
      Taro.navigateBack()
    } catch (error) {
      console.error('选择地址失败:', error)
      Taro.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }, [])

  // 添加新地址
  const handleAddAddress = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/address/form/index'
    })
  }, [])

  // 编辑地址
  const handleEditAddress = useCallback((e: any, address: AddressData) => {
    e.stopPropagation()
    Taro.navigateTo({
      url: `/pages/address/form/index?id=${address.id}`
    })
  }, [])

  if (loading) {
    return (
      <AuthGuard>
        <View className='address-select-page'>
          <View className='loading-container'>
            <Text>加载中...</Text>
          </View>
        </View>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <View className='address-select-page'>
        {addresses.length === 0 ? (
          <View className='empty-state'>
            <IconFont name='location' size='48' color='#ccc' />
            <Text className='empty-text'>暂无地址</Text>
            <View className='add-btn' onClick={handleAddAddress}>
              <Text>添加新地址</Text>
            </View>
          </View>
        ) : (
          <>
            <View className='address-list'>
              {addresses.map((address) => (
                <View
                  key={address.id}
                  className={`address-item ${address.isDefault ? 'default' : ''}`}
                  onClick={() => handleSelectAddress(address)}
                >
                  <View className='address-info'>
                    <View className='address-header'>
                      <Text className='name'>{address.name}</Text>
                      <Text className='phone'>{address.phone}</Text>
                      {address.isDefault && (
                        <View className='default-tag'>
                          <Text>默认</Text>
                        </View>
                      )}
                    </View>
                    <Text className='address-detail'>
                      {address.province}{address.city}{address.district}{address.detail}
                    </Text>
                  </View>
                  <View className='address-actions'>
                    <View
                      className='edit-btn'
                      onClick={(e) => handleEditAddress(e, address)}
                    >
                      <IconFont name='edit' size='20' color='#666' />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <View className='bottom-actions'>
              <View className='add-address-btn' onClick={handleAddAddress}>
                <IconFont name='add' size='20' color='#00c896' />
                <Text>添加新地址</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </AuthGuard>
  )
}