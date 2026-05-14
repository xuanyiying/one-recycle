import { logger } from '@/utils/logger'
import { useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { useAuth } from '@/hooks/useAuth'
import { AddressService } from '@/services/address'
import AuthGuard from '@/components/AuthGuard'
import { Address } from '@/types/address'
import './index.scss'

const AddressPage = () => {
  const { user } = useAuth()
  const [addressList, setAddressList] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  const loadUserAddresses = useCallback(async () => {
    try {
      setLoading(true)
      if (!user) {
        Taro.showToast({
          title: '请先登录',
          icon: 'error'
        })
        return
      }

      const apiResult = await AddressService.getUserAddresses()

      if (apiResult.success && apiResult.data) {
        setAddressList(apiResult.data)
      } else {
        logger.warn('获取地址失败:', apiResult.error)
        setAddressList([])
      }
    } catch (error) {
      logger.error('获取地址失败:', error)
      Taro.showToast({
        title: '获取地址失败',
        icon: 'error'
      })
      setAddressList([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadUserAddresses()
  }, [loadUserAddresses])

  // 处理添加地址
  const handleAddAddress = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/address/form/index'
    })
  }, [])

  // 处理编辑地址
  const handleEditAddress = useCallback((address: Address) => {
    Taro.navigateTo({
      url: `/pages/address/form/index?id=${address.id}`
    })
  }, [])

  // 处理删除地址
  const handleDeleteAddress = useCallback((address: Address) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: async (res) => {
        if (res.confirm && address.id) {
          const apiResult = await AddressService.deleteAddress(address.id)
          if (apiResult.success) {
            await loadUserAddresses()
          }
        }
      }
    })
  }, [loadUserAddresses])

  // 处理设置默认地址
  const handleSetDefaultAddress = useCallback(async (address: Address) => {
    if (address.id) {
      const apiResult = await AddressService.setDefaultAddress(address.id)
      if (apiResult.success) {
        await loadUserAddresses()
      }
    }
  }, [loadUserAddresses])

  // 处理地址项点击
  const handleAddressClick = useCallback((address: Address) => {
    // 可以在这里处理地址选择逻辑
    logger.log('点击地址:', address)
  }, [])

  if (loading) {
    return (
      <AuthGuard>
        <View className='address-page'>
          <View className='loading'>加载中...</View>
        </View>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <View className='address-page'>
        <View className='address-list'>
          {addressList.length === 0 ? (
            <View className='empty-state'>
              <Text className='empty-text'>暂无地址</Text>
              <Text className='empty-hint'>点击下方按钮添加新地址</Text>
            </View>
          ) : (
            addressList.map((address) => (
              <View
                key={address.id}
                className={`address-item ${address.isDefault ? 'default' : ''}`}
                onClick={() => handleAddressClick(address)}
              >
                <View className='address-info'>
                  <View className='address-header'>
                    <Text className='address-name'>{address.name}</Text>
                    <Text className='address-phone'>{address.mobile}</Text>
                    {address.isDefault && (
                      <View className='default-tag'>
                        <Text>默认</Text>
                      </View>
                    )}
                  </View>
                  <View className='address-detail'>
                    <Text>
                      {address.province}
                      {address.city}
                      {address.district}
                      {address.detail}
                    </Text>
                  </View>
                </View>
                <View className='address-actions'>
                  <View
                    className='action-btn edit-btn'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditAddress(address)
                    }}
                  >
                    <Text>编辑</Text>
                  </View>
                  <View
                    className='action-btn delete-btn'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAddress(address)
                    }}
                  >
                    <Text>删除</Text>
                  </View>
                  {!address.isDefault && (
                    <View
                      className='action-btn default-btn'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetDefaultAddress(address)
                      }}
                    >
                      <Text>设为默认</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
        <View className='add-address-btn' onClick={handleAddAddress}>
          <Text>+ 添加新地址</Text>
        </View>
      </View>
    </AuthGuard>
  )
}

export default AddressPage
