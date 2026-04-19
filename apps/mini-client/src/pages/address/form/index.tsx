import logger from '@/utils/logger'
import React, { useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import AddressForm from '@/components/AddressForm'
import { AddressService, ApiResponse} from '@/services/address'
import {Address, AddressFormData} from '@/types/address'
import './index.scss'

const AddressFormPage: React.FC = () => {
  const router = useRouter()
  const {id} = router.params
  const isEdit = !!id

  const [initialData, setInitialData] = useState<Address | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [errors] = useState<Record<string, string>>({})

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
        setInitialData(response.data)
      } else {
        Taro.showToast({title: response.error || '加载地址失败', icon: 'none'})
      }
    } catch (error) {
      logger.error('加载地址失败:', error)
      Taro.showToast({title: '加载地址失败', icon: 'none'})
    }
  }

  const handleSave = async (data: AddressFormData & { isDefault: boolean, coordinates?: any }) => {
    setIsLoading(true)
    try {
      let response: ApiResponse<Address>
      if (isEdit && id) {
        response = await AddressService.updateAddress(id, data)
      } else {
        response = await AddressService.createAddress(data)
      }

      if (response.success) {
        Taro.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 1500)
      } else {
        Taro.showToast({ title: response.error || '保存失败', icon: 'none' })
      }
    } catch (error) {
      logger.error('保存地址失败:', error)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className='address-form-page'>
      <AddressForm
        initialData={initialData}
        onSave={handleSave}
        onCancel={() => Taro.navigateBack()}
        isLoading={isLoading}
        errors={errors}
      />
    </View>
  )
}

export default AddressFormPage
