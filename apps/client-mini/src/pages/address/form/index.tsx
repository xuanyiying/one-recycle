import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import AddressForm from '@/components/AddressForm'
import { AddressService, AddressData } from '@/services/addressService'
import { Address, AddressLabel } from '@/types/order'
import './index.scss'

// 转换 AddressData 到 Address 类型
const convertAddressDataToAddress = (data: AddressData): Address => {
  return {
    id: String(data.id || ''),
    recipientName: data.name,
    phoneNumber: data.phone,
    region: `${data.province} ${data.city} ${data.area || data.district}`,
    detailedAddress: data.detail,
    isDefault: data.isDefault || false,
    label: AddressLabel.HOME, // 默认标签
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// 转换 Address 到 AddressData 类型
const convertAddressToAddressData = (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Omit<AddressData, 'id'> => {
  // 解析 region 字符串为省市区
  const regionParts = address.region.split(' ').filter(Boolean)
  const [province = '', city = '', district = ''] = regionParts

  return {
    name: address.recipientName,
    phone: address.phoneNumber,
    province,
    city,
    area: district, // area 和 district 使用相同的值
    district,
    detail: address.detailedAddress,
    isDefault: address.isDefault,
  }
}

const AddressFormPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.params
  const isEdit = !!id

  const [initialData, setInitialData] = useState<Address | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load address data if editing
  useEffect(() => {
    if (isEdit && id) {
      loadAddress(id)
    }
  }, [id, isEdit])

  const loadAddress = async (addressId: string) => {
    try {
      const response = await AddressService.getAddressById(addressId)
      if (response.success && response.data) {
        const address = convertAddressDataToAddress(response.data)
        setInitialData(address)
      } else {
        Taro.showToast({ title: response.error || '加载地址失败', icon: 'none' })
      }
    } catch (error) {
      console.error('加载地址失败:', error)
      Taro.showToast({ title: '加载地址失败', icon: 'none' })
    }
  }

  const validateForm = (data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.recipientName?.trim()) {
      newErrors.recipientName = '请输入取件人姓名'
    }

    if (!data.phoneNumber?.trim()) {
      newErrors.phoneNumber = '请输入电话号码'
    } else {
      const mobileReg = /^1[3-9]\d{9}$/
      if (!mobileReg.test(data.phoneNumber)) {
        newErrors.phoneNumber = '请输入正确的手机号码'
      }
    }

    if (!data.region) {
      newErrors.region = '请选择所在地区'
    }

    if (!data.detailedAddress?.trim()) {
      newErrors.detailedAddress = '请输入详细地址'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!validateForm(data)) {
      return
    }

    setIsLoading(true)
    try {
      // 转换为 AddressData 格式
      const addressData = convertAddressToAddressData(data)

      let response
      if (isEdit && id) {
        response = await AddressService.updateAddress(id, addressData)
      } else {
        response = await AddressService.createAddress(addressData)
      }

      if (response.success) {
        // Toast 已在 service 中显示
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        // 错误已在 service 中处理
        setErrors({ general: response.error || '保存失败' })
      }
    } catch (error) {
      console.error('保存地址失败:', error)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  return (
    <View className='address-form-page'>
      <AddressForm
        initialData={initialData}
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isLoading}
        errors={errors}
      />
    </View>
  )
}

export default AddressFormPage
