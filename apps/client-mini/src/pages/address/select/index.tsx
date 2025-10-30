import { useState, useEffect } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import { Address } from '@nutui/nutui-biz'
import { 
  provinceData, 
  cityData, 
  countryData, 
  townData,
  getUserAddressList,
  setDefaultAddress,
  UserAddress,
  RegionData,
  initDefaultAddresses
} from '@/utils/addressData'
import './index.scss'

export default function AddressSelect() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(true)
  const [existAddresses, setExistAddresses] = useState<UserAddress[]>([])
  const [selectedRegion, setSelectedRegion] = useState<(string | number)[]>([])
  const [loading, setLoading] = useState(false)

  // 获取当前选中城市的区县数据
  const getCurrentCityData = (): RegionData[] => {
    if (selectedRegion.length >= 2) {
      const cityId = selectedRegion[1]
      return countryData[cityId as string] || []
    }
    return []
  }

  // 获取当前选中区县的街道数据
  const getCurrentCountryData = (): RegionData[] => {
    if (selectedRegion.length >= 3) {
      const countryId = selectedRegion[2]
      return townData[countryId as string] || []
    }
    return []
  }

  // 获取当前选中省份的城市数据
  const getCurrentProvinceData = (): RegionData[] => {
    if (selectedRegion.length >= 1) {
      const provinceId = selectedRegion[0]
      return cityData[provinceId as string] || []
    }
    return []
  }

  useEffect(() => {
    initData()
  }, [])

  const initData = async () => {
    try {
      setLoading(true)
      // 初始化默认地址数据
      initDefaultAddresses()
      // 获取用户地址列表
      const addresses = getUserAddressList()
      setExistAddresses(addresses)
    } catch (error) {
      console.error('初始化地址数据失败:', error)
      Taro.showToast({
        title: '加载地址失败',
        icon: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // 处理地址选择
  const handleAddressSelected = (prevExistAdd: UserAddress, item: UserAddress, copyExistAdd: UserAddress[]) => {
    console.log('选择地址:', item)
    // 设置为默认地址
    setDefaultAddress(item.id)
    // 更新本地状态
    setExistAddresses(copyExistAdd)
    
    // 返回上一页并传递选中的地址
    const pages = Taro.getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage) {
      // 通过事件总线或者页面参数传递地址信息
      Taro.eventCenter.trigger('addressSelected', item)
    }
    
    Taro.navigateBack()
  }

  // 处理地址弹窗关闭
  const handleAddressClose = (cal: any) => {
    console.log('地址选择关闭:', cal)
    if (cal.type === 'exist') {
      // 选择了已有地址
      const selectedAddress = cal.data as UserAddress
      handleAddressSelected(selectedAddress, selectedAddress, existAddresses)
    } else if (cal.type === 'custom') {
      // 选择了自定义地址，跳转到地址编辑页面
      const addressData = cal.data
      Taro.navigateTo({
        url: `/pages/address/edit/index?addressData=${encodeURIComponent(JSON.stringify(addressData))}`
      })
    }
    setVisible(false)
  }

  // 处理遮罩关闭
  const handleMaskClose = () => {
    setVisible(false)
    Taro.navigateBack()
  }

  // 处理模块切换
  const handleSwitchModule = (cal: { type: string }) => {
    console.log('切换模块:', cal.type)
  }

  // 处理地址变化
  const handleAddressChange = (cal: any) => {
    console.log('地址变化:', cal)
    const { next, value } = cal
    
    // 更新选中的区域
    if (next === 'city') {
      setSelectedRegion([value.id])
    } else if (next === 'country') {
      setSelectedRegion(prev => [prev[0], value.id])
    } else if (next === 'town') {
      setSelectedRegion(prev => [prev[0], prev[1], value.id])
    }
  }

  // 处理地址项点击
  const handleClickItem = async (cal: any, resolve: (value: boolean | PromiseLike<boolean>) => void) => {
    console.log('点击地址项:', cal)
    // 这里可以添加异步验证逻辑
    resolve(true)
  }

  // 处理标签页切换
  const handleTabChecked = (type: string) => {
    console.log('标签页切换:', type)
  }

  return (
    <AuthGuard>
      <View className='address-select-page'>
        <Address
          modelValue={visible}
          modelSelect={selectedRegion}
          type='exist'
          isShowCustomAddress={true}
          existAddress={existAddresses}
          loading={loading}
          customAddressTitle='选择收货地址'
          existAddressTitle='配送至'
          customAndExistTitle='选择地址'
          height='100vh'
          province={provinceData}
          city={getCurrentProvinceData()}
          country={getCurrentCityData()}
          town={getCurrentCountryData()}
          onSelected={handleAddressSelected}
          onClose={handleAddressClose}
          onCloseMask={handleMaskClose}
          onSwitchModule={handleSwitchModule}
          onChange={handleAddressChange}
          onClickItem={handleClickItem}
          onTabChecked={handleTabChecked}
        />
      </View>
    </AuthGuard>
  )
}