import { useState, useEffect, useCallback } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getCities } from '../../../services/system'
import { getUserAddresses } from '../../../services/user'
import { useAuth } from '../../../hooks/useAuth'
import AuthGuard from '../../../components/AuthGuard'
import { Address } from '../../../types'
import './index.scss'

interface City {
  id: string
  name: string
  districts: District[]
}

interface District {
  id: string
  name: string
}

export default function AddressSelect() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [detailAddress, setDetailAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // 生成完整地址的辅助函数
  const getFullAddress = (address: Address): string => {
    return `${address.province}${address.city}${address.district}${address.detail}`
  }

  useEffect(() => {
    initData()
  }, [])

  const initData = async () => {
    try {
      // 获取城市数据
      const citiesResult = await getCities()
      if (citiesResult.success && citiesResult.data) {
        setCities(citiesResult.data)
      }

      // 获取用户地址
      if (user?.id) {
        const addressResult = await getUserAddresses(user.id.toString())
        if (addressResult.success && addressResult.data) {
          setAddresses(addressResult.data)
        }
      }
    } catch (error) {
      console.error('初始化数据失败:', error)
      Taro.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    }
  }

  // 选择地址
  const handleSelectAddress = useCallback((address: Address) => {
    Taro.eventCenter.trigger('addressSelected', address)
    Taro.navigateBack()
  }, [])

  // 选择城市
  const handleSelectCity = useCallback((city: City) => {
    setSelectedCity(city)
    setSelectedDistrict(null)
  }, [])

  // 选择区域
  const handleSelectDistrict = useCallback((district: District) => {
    setSelectedDistrict(district)
  }, [])

  // 添加新地址
  const handleAddAddress = useCallback(() => {
    if (!selectedCity || !selectedDistrict) {
      Taro.showToast({
        title: '请选择城市和区域',
        icon: 'none'
      })
      return
    }

    if (!detailAddress.trim()) {
      Taro.showToast({
        title: '请填写详细地址',
        icon: 'none'
      })
      return
    }

    if (!contactName.trim()) {
      Taro.showToast({
        title: '请填写联系人姓名',
        icon: 'none'
      })
      return
    }

    if (!contactPhone.trim()) {
      Taro.showToast({
        title: '请填写联系电话',
        icon: 'none'
      })
      return
    }

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(contactPhone)) {
      Taro.showToast({
        title: '请填写正确的手机号',
        icon: 'none'
      })
      return
    }

    setLoading(true)

    // 模拟保存地址
    setTimeout(() => {
      const newAddress: Address = {
        id: Date.now(),
        name: contactName,
        phone: contactPhone,
        province: selectedCity?.name || '',
        city: selectedCity?.name || '',
        district: selectedDistrict?.name || '',
        detail: detailAddress,
        isDefault: addresses.length === 0,
        tag: '家'
      }

      setAddresses(prev => [newAddress, ...prev])
      setLoading(false)
      setShowAddForm(false)
      
      // 重置表单
      setSelectedCity(null)
      setSelectedDistrict(null)
      setDetailAddress('')
      setContactName('')
      setContactPhone('')

      Taro.showToast({
        title: '地址添加成功',
        icon: 'success'
      })

      // 自动选择新添加的地址
      setTimeout(() => {
        handleSelectAddress(newAddress)
      }, 1500)
    }, 1000)
  }, [selectedCity, selectedDistrict, detailAddress, contactName, contactPhone, addresses.length, handleSelectAddress])

  // 删除地址
  const handleDeleteAddress = useCallback((addressId: number, e: any) => {
    e.stopPropagation()
    
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (res.confirm) {
          setAddresses(prev => prev.filter(addr => addr.id !== addressId))
          Taro.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  }, [])

  return (
    <AuthGuard>
      <View className='address-select-page'>
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>选择地址</Text>
      </View>

      <ScrollView className='content-container' scrollY>
        {/* 已保存的地址列表 */}
        {addresses.length > 0 && (
          <View className='address-section'>
            <Text className='section-title'>已保存的地址</Text>
            {addresses.map(address => (
              <View 
                key={address.id} 
                className='address-item'
                onClick={() => handleSelectAddress(address)}
              >
                <View className='address-info'>
                  <View className='address-header'>
                    <Text className='contact-name'>{address.name}</Text>
                    {address.isDefault && (
                      <Text className='default-tag'>默认</Text>
                    )}
                  </View>
                  <Text className='address-text'>{getFullAddress(address)}</Text>
                </View>
                <View 
                  className='delete-btn'
                  onClick={(e) => handleDeleteAddress(address.id, e)}
                >
                  <Text className='delete-icon'>×</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 添加新地址 */}
        <View className='add-address-section'>
          <View className='section-header'>
            <Text className='section-title'>添加新地址</Text>
            <Button 
              className='toggle-btn'
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '收起' : '展开'}
            </Button>
          </View>

          {showAddForm && (
            <View className='add-form'>
              {/* 城市选择 */}
              <View className='form-item'>
                <Text className='form-label'>选择城市</Text>
                <ScrollView className='city-list' scrollX>
                  {cities.map(city => (
                    <View 
                      key={city.id}
                      className={`city-item ${selectedCity?.id === city.id ? 'selected' : ''}`}
                      onClick={() => handleSelectCity(city)}
                    >
                      <Text className='city-name'>{city.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* 区域选择 */}
              {selectedCity && (
                <View className='form-item'>
                  <Text className='form-label'>选择区域</Text>
                  <View className='district-grid'>
                    {selectedCity.districts.map(district => (
                      <View 
                        key={district.id}
                        className={`district-item ${selectedDistrict?.id === district.id ? 'selected' : ''}`}
                        onClick={() => handleSelectDistrict(district)}
                      >
                        <Text className='district-name'>{district.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 详细地址 */}
              <View className='form-item'>
                <Text className='form-label'>详细地址</Text>
                <Input
                  className='address-input'
                  placeholder='请输入详细地址（街道、门牌号等）'
                  value={detailAddress}
                  onInput={(e) => setDetailAddress(e.detail.value)}
                />
              </View>

              {/* 联系人信息 */}
              <View className='form-item'>
                <Text className='form-label'>联系人姓名</Text>
                <Input
                  className='contact-input'
                  placeholder='请输入联系人姓名'
                  value={contactName}
                  onInput={(e) => setContactName(e.detail.value)}
                />
              </View>

              <View className='form-item'>
                <Text className='form-label'>联系电话</Text>
                <Input
                  className='contact-input'
                  type='number'
                  placeholder='请输入联系电话'
                  value={contactPhone}
                  onInput={(e) => setContactPhone(e.detail.value)}
                  maxlength={11}
                />
              </View>

              {/* 保存按钮 */}
              <Button 
                className='save-btn'
                onClick={handleAddAddress}
                loading={loading}
                disabled={loading}
              >
                {loading ? '保存中...' : '保存地址'}
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
      </View>
    </AuthGuard>
  )
}