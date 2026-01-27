import { useState, useEffect, useCallback } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AuthGuard from '@/components/AuthGuard'
import { IconFont } from '@nutui/icons-react-taro'
import AddressCard from '@/components/AddressCard'
import { AddressService } from '@/services/address'
import { Address } from '@/types/address'
import './index.scss'

export default function AddressSelect() {
  const [addresses, setAddresses] = useState<Address[]>([])
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
  const handleSelectAddress = useCallback(async (address: Address) => {
    try {
      // 设置为默认地址
      if (address.id) {
        await AddressService.setDefaultAddress(address.id)
      }

      // 通过事件总线传递选中的地址
      Taro.eventCenter.trigger('addressSelected', address)

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
  const handleEditAddress = useCallback((address: Address) => {
    if (address.id) {
        Taro.navigateTo({
            url: `/pages/address/form/index?id=${address.id}`
        })
    }
  }, [])
  
  // 删除地址 (占位，AddressCard 需要此 prop)
  const handleDeleteAddress = useCallback(async (address: Address) => {
      // 这里可以实现删除逻辑，或者如果此页面不支持直接删除，留空
      // 考虑到用户体验，建议支持删除
      Taro.showModal({
          title: '删除地址',
          content: '确定要删除这个地址吗？',
          success: async (res) => {
              if (res.confirm && address.id) {
                  try {
                      await AddressService.deleteAddress(String(address.id))
                      loadAddresses() // 重新加载
                  } catch (e) {
                      Taro.showToast({ title: '删除失败', icon: 'none' })
                  }
              }
          }
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
                  <View key={address.id} className="address-wrapper">
                    <AddressCard
                        address={address}
                        isSelected={false} // 在选择列表中，通常不需要显示"已选中"状态，或者根据当前已选 ID 显示
                        onSelect={() => handleSelectAddress(address)}
                        onEdit={() => handleEditAddress(address)}
                        onDelete={() => handleDeleteAddress(address)}
                    />
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
