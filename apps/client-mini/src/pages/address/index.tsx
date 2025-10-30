import { useState, useEffect, useCallback } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AddressList } from '@nutui/nutui-biz'
import { useAuth } from '@/hooks/useAuth'
import { 
  getUserAddressList, 
  deleteUserAddress, 
  setDefaultAddress,
  UserAddress 
} from '@/utils/addressData'
import { AddressService } from '@/services/addressService'
import AuthGuard from '@/components/AuthGuard'
import './index.scss'

// AddressList组件需要的数据格式
interface IDataInfo {
  id: string | number
  addressName: string
  phone: string
  defaultAddress: boolean
  fullAddress: string
}

const AddressPage = () => {
  const { user } = useAuth()
  const [addressList, setAddressList] = useState<IDataInfo[]>([])
  const [loading, setLoading] = useState(true)

  // 转换UserAddress到IDataInfo格式
  const convertToIDataInfo = (userAddress: UserAddress): IDataInfo => ({
    id: userAddress.id,
    addressName: userAddress.name || '收货人',
    phone: userAddress.phone || '',
    defaultAddress: userAddress.selectedAddress,
    fullAddress: `${userAddress.provinceName}${userAddress.cityName}${userAddress.countyName}${userAddress.townName}${userAddress.addressDetail}`
  })

  const loadUserAddresses = useCallback(async () => {
    try {
      setLoading(true)
      // 先尝试从API获取地址列表
      const apiResult = await AddressService.getUserAddresses()
      
      if (apiResult.success && apiResult.data) {
        // 转换API数据格式
        const convertedAddresses = apiResult.data.map((addr: any) => ({
          id: addr.id,
          addressName: addr.name || '收货人',
          phone: addr.phone || '',
          defaultAddress: addr.isDefault || false,
          fullAddress: `${addr.province}${addr.city}${addr.district}${addr.detail}`
        }))
        setAddressList(convertedAddresses)
      } else {
        // API失败时使用本地数据作为备用
        console.warn('API获取地址失败，使用本地数据:', apiResult.error)
        const addresses = getUserAddressList()
        const convertedAddresses = addresses.map(convertToIDataInfo)
        setAddressList(convertedAddresses)
      }
    } catch (error) {
      console.error('获取地址失败:', error)
      // 发生异常时使用本地数据作为备用
      try {
        const addresses = getUserAddressList()
        const convertedAddresses = addresses.map(convertToIDataInfo)
        setAddressList(convertedAddresses)
      } catch (localError) {
        console.error('本地地址数据也获取失败:', localError)
        Taro.showToast({
          title: '获取地址失败',
          icon: 'error'
        })
      }
    } finally {
      setLoading(false)
    }
  }, [convertToIDataInfo])

  useEffect(() => {
    loadUserAddresses()
  }, [loadUserAddresses])

  // 处理添加地址
  const handleAddAddress = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/address/form/index'
    })
  }, [])

  // 根据ID查找原始UserAddress
  const findUserAddressById = (id: string | number): UserAddress | undefined => {
    const addresses = getUserAddressList()
    return addresses.find(addr => addr.id === id)
  }

  // 处理编辑地址
  const handleEditAddress = useCallback((event: Event, item: any) => {
    const userAddress = findUserAddressById(item.id)
    if (userAddress) {
      Taro.navigateTo({
        url: `/pages/address/form/index?id=${userAddress.id}&edit=true`
      })
    }
  }, [])

  // 处理删除地址
  const handleDeleteAddress = useCallback((event: Event, item: any) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 先尝试API删除
            const apiResult = await AddressService.deleteAddress(item.id)
            
            if (apiResult.success) {
              // API删除成功，重新加载地址列表
              await loadUserAddresses()
            } else {
              // API删除失败，使用本地删除作为备用
              console.warn('API删除失败，使用本地删除:', apiResult.error)
              deleteUserAddress(item.id)
              // 重新加载地址列表
              const updatedAddresses = getUserAddressList()
              const convertedAddresses = updatedAddresses.map(convertToIDataInfo)
              setAddressList(convertedAddresses)
              
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              })
            }
          } catch (error) {
            console.error('删除地址失败:', error)
            // 发生异常时使用本地删除作为备用
            try {
              deleteUserAddress(item.id)
              const updatedAddresses = getUserAddressList()
              const convertedAddresses = updatedAddresses.map(convertToIDataInfo)
              setAddressList(convertedAddresses)
              
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (localError) {
              console.error('本地删除也失败:', localError)
              Taro.showToast({
                title: '删除失败',
                icon: 'error'
              })
            }
          }
        }
      }
    })
  }, [convertToIDataInfo, loadUserAddresses])

  // 处理设置默认地址
  const handleSetDefaultAddress = useCallback(async (event: Event, item: any) => {
    try {
      // 先尝试API设置默认地址
      const apiResult = await AddressService.setDefaultAddress(item.id)
      
      if (apiResult.success) {
        // API设置成功，重新加载地址列表
        await loadUserAddresses()
        Taro.showToast({
          title: '设置成功',
          icon: 'success'
        })
      } else {
        // API设置失败，使用本地设置作为备用
        console.warn('API设置默认地址失败，使用本地设置:', apiResult.error)
        setDefaultAddress(item.id)
        // 重新加载地址列表
        const updatedAddresses = getUserAddressList()
        const convertedAddresses = updatedAddresses.map(convertToIDataInfo)
        setAddressList(convertedAddresses)
        
        Taro.showToast({
          title: '设置成功',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('设置默认地址失败:', error)
      // 发生异常时使用本地设置作为备用
      try {
        setDefaultAddress(item.id)
        const updatedAddresses = getUserAddressList()
        const convertedAddresses = updatedAddresses.map(convertToIDataInfo)
        setAddressList(convertedAddresses)
        
        Taro.showToast({
          title: '设置成功',
          icon: 'success'
        })
      } catch (localError) {
        console.error('本地设置也失败:', localError)
        Taro.showToast({
          title: '设置失败',
          icon: 'error'
        })
      }
    }
  }, [convertToIDataInfo, loadUserAddresses])

  // 处理地址项点击
  const handleAddressClick = useCallback((event: Event, item: any) => {
    // 可以在这里处理地址选择逻辑
    console.log('点击地址:', item)
  }, [])

  // 处理长按地址项
  const handleLongPress = useCallback((event: Event, item: any) => {
    const userAddress = findUserAddressById(item.id)
    if (userAddress) {
      Taro.showActionSheet({
        itemList: ['编辑', '删除', '设为默认'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              handleEditAddress(event, item)
              break
            case 1:
              handleDeleteAddress(event, item)
              break
            case 2:
              if (!userAddress.selectedAddress) {
                handleSetDefaultAddress(event, item)
              }
              break
          }
        }
      })
    }
  }, [handleEditAddress, handleDeleteAddress])

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
        <AddressList
          data={addressList}
          showBottomButton={true}
          onAdd={handleAddAddress}
          onEditIcon={handleEditAddress}
          onDelIcon={handleDeleteAddress}
          onItemClick={handleAddressClick}
          onLongSet={handleSetDefaultAddress}
        />
      </View>
    </AuthGuard>
  )
}

export default AddressPage