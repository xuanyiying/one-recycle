import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AddressEdit } from '@nutui/nutui-biz'
import { 
  getUserAddressById, 
  addUserAddress, 
  updateUserAddress,
  provinceData,
  cityData,
  countryData,
  townData,
  UserAddress,
  RegionData
} from '../../../utils/addressData'
import { AddressService } from '../../../services/addressService'

// 根据AddressEdit组件的实际类型定义
interface AddressInfo {
  name?: string
  tel?: string
  region?: string
  regionIds?: number[]
  address?: string
  default?: boolean
  [key: string]: any
}

interface AddressData {
  nameText: string
  namePlaceholder: string
  nameErrorMsg: string
  telText: string
  telPlaceholder: string
  telErrorMsg: string
  regionText: string
  regionPlaceholder: string
  regionErrorMsg: string
  addressText: string
  addressPlaceholder: string
  addressErrorMsg: string
  isDefualtAddress?: boolean
  isRequired?: string[]
  bottomText: string
  errorShowType?: string
  errorToastText?: string
  [key: string]: any
}

interface AddressResult {
  addressSelect?: number[]
  addressStr?: string
  province?: RegionData[]
  city?: RegionData[]
  country?: RegionData[]
  town?: RegionData[]
  addressTitle?: string
  type?: 'exist' | 'custom' | 'elevator'
  height?: string
}

const AddressForm: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  const isEdit = !!id

  // AddressEdit组件需要的addressInfo状态
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    name: '',
    tel: '',
    region: '',
    regionIds: [],
    address: '',
    default: false
  })

  // 当前选中的地址信息
  const [currentAddress, setCurrentAddress] = useState<UserAddress | null>(null)

  // AddressEdit组件需要的data配置
  const addressData: AddressData = {
    nameText: '收货人',
    namePlaceholder: '请输入收货人姓名',
    nameErrorMsg: '请输入收货人姓名',
    telText: '手机号码',
    telPlaceholder: '请输入手机号码',
    telErrorMsg: '请输入正确的手机号码',
    regionText: '所在地区',
    regionPlaceholder: '请选择所在地区',
    regionErrorMsg: '请选择所在地区',
    addressText: '详细地址',
    addressPlaceholder: '请输入详细地址',
    addressErrorMsg: '请输入详细地址',
    isDefualtAddress: true,
    isRequired: ['name', 'tel', 'region', 'address'],
    bottomText: '保存',
    errorShowType: 'toast',
    errorToastText: '请完善地址信息'
  }

  // 地址选择器数据
  const addressResult: AddressResult = {
    province: provinceData,
    city: [],
    country: [],
    town: [],
    addressTitle: '选择地区',
    type: 'custom',
    height: '200px'
  }

  // 加载地址数据
  useEffect(() => {
    if (isEdit && id) {
      const address = getUserAddressById(id)
      if (address) {
        setCurrentAddress(address)
        
        // 查找对应的regionIds
        const provinceIndex = provinceData.findIndex(p => p.name === address.provinceName)
        let cityIndex = 0
        let countryIndex = 0
        
        if (provinceIndex >= 0) {
          const provinceId = provinceData[provinceIndex].id
          if (provinceId && cityData[provinceId]) {
            cityIndex = cityData[provinceId].findIndex(c => c.name === address.cityName)
            
            if (cityIndex >= 0) {
              const cityId = cityData[provinceId][cityIndex].id
              if (cityId && countryData[cityId]) {
                countryIndex = countryData[cityId].findIndex(c => c.name === address.countyName)
              }
            }
          }
        }

        // 转换UserAddress到AddressInfo格式
        setAddressInfo({
          name: address.name || '',
          tel: address.phone || '',
          region: `${address.provinceName} ${address.cityName} ${address.countyName}`,
          regionIds: [provinceIndex, cityIndex, countryIndex],
          address: address.addressDetail,
          default: address.selectedAddress
        })
      }
    }
  }, [id, isEdit])

  // 处理地址信息变化
  const handleChange = (val: string, tag: string) => {
    setAddressInfo(prev => ({
      ...prev,
      [tag]: val
    }))
  }

  // 处理地址选择变化
  const handleChangeAddress = (data: any) => {
    const { addressStr, addressSelect } = data
    setAddressInfo(prev => ({
      ...prev,
      region: addressStr,
      regionIds: addressSelect
    }))
  }

  // 验证表单
  const validateForm = (): boolean => {
    if (!addressInfo.name?.trim()) {
      Taro.showToast({ title: '请输入收货人姓名', icon: 'none' })
      return false
    }
    
    if (!addressInfo.tel?.trim()) {
      Taro.showToast({ title: '请输入手机号码', icon: 'none' })
      return false
    }
    
    // 简单的手机号验证
    const mobileReg = /^1[3-9]\d{9}$/
    if (!mobileReg.test(addressInfo.tel)) {
      Taro.showToast({ title: '请输入正确的手机号码', icon: 'none' })
      return false
    }
    
    if (!addressInfo.region) {
      Taro.showToast({ title: '请选择所在地区', icon: 'none' })
      return false
    }
    
    if (!addressInfo.address?.trim()) {
      Taro.showToast({ title: '请输入详细地址', icon: 'none' })
      return false
    }
    
    return true
  }

  // 处理保存
  const handleSave = async (data: any) => {
    if (!validateForm()) {
      return
    }

    try {
      // 根据regionIds获取省市区名称
      const [provinceIndex, cityIndex, countryIndex] = addressInfo.regionIds || []
      const provinceName = provinceData[provinceIndex]?.name || ''
      let cityName = ''
      let countryName = ''
      
      if (provinceName && provinceData[provinceIndex]?.id) {
        const provinceId = provinceData[provinceIndex].id!
        const cities = cityData[provinceId] || []
        cityName = cities[cityIndex]?.name || ''
        
        if (cityName && cities[cityIndex]?.id) {
          const cityId = cities[cityIndex].id!
          const countries = countryData[cityId] || []
          countryName = countries[countryIndex]?.name || ''
        }
      }

      // 准备API请求数据
      const apiAddressData = {
        name: addressInfo.name?.trim() || '',
        phone: addressInfo.tel?.trim() || '',
        province: provinceName,
        city: cityName,
        district: countryName,
        detail: addressInfo.address?.trim() || '',
        isDefault: addressInfo.default || false
      }

      let apiResult
      if (isEdit && currentAddress) {
        // 更新地址
        apiResult = await AddressService.updateAddress(currentAddress.id, apiAddressData)
      } else {
        // 添加新地址
        apiResult = await AddressService.createAddress(apiAddressData)
      }

      if (apiResult.success) {
        // API操作成功
        Taro.showToast({ 
          title: isEdit ? '地址更新成功' : '地址添加成功', 
          icon: 'success' 
        })
      } else {
        // API操作失败，使用本地存储作为备用
        console.warn('API操作失败，使用本地存储:', apiResult.error)
        
        // 转换AddressInfo到UserAddress格式
        const localAddressData: Omit<UserAddress, 'id'> = {
          provinceName,
          cityName,
          countyName: countryName,
          townName: '', // 当前没有使用街道信息
          addressDetail: addressInfo.address?.trim() || '',
          selectedAddress: addressInfo.default || false,
          name: addressInfo.name?.trim() || '',
          phone: addressInfo.tel?.trim() || ''
        }

        if (isEdit && currentAddress) {
          // 更新地址
          updateUserAddress(currentAddress.id, localAddressData)
        } else {
          // 添加新地址
          addUserAddress(localAddressData)
        }
        
        Taro.showToast({ 
          title: isEdit ? '地址更新成功' : '地址添加成功', 
          icon: 'success' 
        })
      }

      // 返回地址列表页面
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('保存地址失败:', error)
      
      // 发生异常时使用本地存储作为备用
      try {
        // 根据regionIds获取省市区名称
        const [provinceIndex, cityIndex, countryIndex] = addressInfo.regionIds || []
        const provinceName = provinceData[provinceIndex]?.name || ''
        let cityName = ''
        let countryName = ''
        
        if (provinceName && provinceData[provinceIndex]?.id) {
          const provinceId = provinceData[provinceIndex].id!
          const cities = cityData[provinceId] || []
          cityName = cities[cityIndex]?.name || ''
          
          if (cityName && cities[cityIndex]?.id) {
            const cityId = cities[cityIndex].id!
            const countries = countryData[cityId] || []
            countryName = countries[countryIndex]?.name || ''
          }
        }

        // 转换AddressInfo到UserAddress格式
        const localAddressData: Omit<UserAddress, 'id'> = {
          provinceName,
          cityName,
          countyName: countryName,
          townName: '', // 当前没有使用街道信息
          addressDetail: addressInfo.address?.trim() || '',
          selectedAddress: addressInfo.default || false,
          name: addressInfo.name?.trim() || '',
          phone: addressInfo.tel?.trim() || ''
        }

        if (isEdit && currentAddress) {
          // 更新地址
          updateUserAddress(currentAddress.id, localAddressData)
        } else {
          // 添加新地址
          addUserAddress(localAddressData)
        }
        
        Taro.showToast({ 
          title: isEdit ? '地址更新成功' : '地址添加成功', 
          icon: 'success' 
        })
        
        // 返回地址列表页面
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } catch (localError) {
        console.error('本地保存也失败:', localError)
        Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
      }
    }
  }

  // 处理默认地址开关
  const handleSwitch = (state: boolean, data: any) => {
    setAddressInfo(prev => ({
      ...prev,
      default: state
    }))
  }

  return (
    <View className="address-form-page">
      <AddressEdit
        addressInfo={addressInfo}
        data={addressData}
        address={addressResult}
        showSave={true}
        showDefault={true}
        onChange={handleChange}
        onChangeAddress={handleChangeAddress}
        onSave={handleSave}
        onSwitch={handleSwitch}
      />
    </View>
  )
}

export default AddressForm
