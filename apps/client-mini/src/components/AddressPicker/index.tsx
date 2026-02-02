import React, { useState, useCallback } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { Cascader, TextArea } from '@nutui/nutui-react-taro'
import { AddressData } from '@/services/address-data'
import { Address } from '@/types/address'
import './index.scss'

interface AddressPickerProps {
  value: Partial<Address>
  onChange: (value: Partial<Address>) => void
  errors?: Record<string, string>
}

const AddressPicker: React.FC<AddressPickerProps> = ({
  value,
  onChange,
  errors = {}
}) => {
  const [showCascader, setShowCascader] = useState(false)
  const [cascaderData, setCascaderData] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const provinces = await AddressData.getProvinces()
      const options = provinces.map(p => ({
        value: p.code,
        text: p.name,
        leaf: false, // 标记非叶子节点，触发动态加载
        children: []
      }))
      setCascaderData(options)
    } catch (error) {
      handleFallback()
    } finally {
      setIsLoadingData(false)
    }
  }, [])

  const handleLazyLoad = useCallback((node: any, resolve?: (children: any[]) => void) => {
    const { value, level } = node
    // level 0: Province -> City
    // level 1: City -> District
    // level 2: District -> Street
    const nextLevel = (parseInt(level) + 2).toString() 
    
    // Ensure value (parentCode) is present
    if (!value) {
      if (typeof resolve === 'function') resolve([])
      return Promise.resolve([])
    }

    const promise = AddressData.getAreas(value, nextLevel)
      .then(areas => {
        const children = areas.map(a => ({
          value: a.code,
          text: a.name,
          // level 2 (District) loads level 3 (Street). Level 3 nodes are leaves.
          // If level is 2, nextLevel is 4. So if parseInt(nextLevel) >= 4, it is leaf?
          // If we want 4 levels (0,1,2,3), then level 3 is leaf.
          // When loading children for level 2, the children are level 3.
          // So if `level` (parent) is 2, the children are leaves.
          leaf: parseInt(level) >= 2 
        }))
        if (typeof resolve === 'function') {
          resolve(children)
        }
        return children
      })
      .catch(() => {
        Taro.showToast({ title: '加载地址数据失败', icon: 'none' })
        if (typeof resolve === 'function') {
          resolve([])
        }
        return []
      })

    return promise
  }, [])

  const handleFallback = useCallback(() => {
    Taro.showToast({
      title: '无法加载地址数据',
      icon: 'none'
    })
  }, [])

  const handleOpenCascader = useCallback(() => {
    if (cascaderData.length === 0) {
      loadInitialData()
    }
    setShowCascader(true)
  }, [cascaderData, loadInitialData])

  const handleRegionChange = useCallback((_vals: any[], options: any[]) => {
    if (!options || options.length === 0) return

    const province = options[0]?.text || ''
    
    // 特殊处理直辖市
    const isDirectCity = ['北京市', '上海市', '天津市', '重庆市'].includes(province) || 
                         ['北京', '上海', '天津', '重庆'].includes(province)
    
    let city = ''
    let district = ''
    let street = ''

    if (isDirectCity) {
      city = province
      // 直辖市可能只有3级 (省->区->街道) 或 4级 (省->市辖区->区->街道)
      // 通过判断 options[1] 是否为 "市辖区" 或 "县" 来区分
      const secondLevelName = options[1]?.text || ''
      if (secondLevelName === '市辖区' || secondLevelName === '县' || secondLevelName === '市') {
         // 4级结构
         district = options[2]?.text || ''
         street = options[3]?.text || ''
      } else {
         // 3级结构 (直接跳到区)
         district = secondLevelName
         street = options[2]?.text || ''
      }
    } else {
      city = options[1]?.text || ''
      district = options[2]?.text || ''
      street = options[3]?.text || ''
    }
    
    let displayRegion = ''
    if (isDirectCity) {
        displayRegion = `${province} ${district} ${street}`.trim()
    } else {
        displayRegion = `${province} ${city} ${district} ${street}`.trim()
    }

    onChange({
      ...value,
      province,
      city,
      district,
      street,
      region: displayRegion
    })
    setShowCascader(false)
  }, [onChange, value])

  const handleDetailChange = useCallback((val: string) => {
    onChange({
      ...value,
      detail: val
    })
  }, [onChange, value])

  const regionDisplay = value.province 
    ? `${value.province} ${value.city} ${value.district || ''} ${value.street || ''}`.trim()
    : ''

  return (
    <View className='address-picker'>
      {/* Region Selector */}
      <View className={`picker-section ${errors.region ? 'error' : ''}`} onClick={handleOpenCascader}>
        <Text className='label'>所在地区</Text>
        <View className='value-container'>
          {regionDisplay ? (
            <Text className='value'>{regionDisplay}</Text>
          ) : (
            <Text className='placeholder'>点击选择省市区</Text>
          )}
        </View>
        <Text className='arrow'>&gt;</Text>
      </View>

      {/* Detailed Address Input */}
      <View className={`picker-section detail-section ${errors.detail ? 'error' : ''}`}>
        <Text className='label'>详细地址</Text>
        <View className='value-container'>
          <TextArea
              value={value.detail || ''}
              onChange={(val) => handleDetailChange(val)}
              placeholder='请输入详细地址（街道、门牌号等）'
              maxLength={100}
              autoSize
            />
        </View>
      </View>
      {errors.detail && <Text className='error-message detail-error'>{errors.detail}</Text>}

      {/* Region Cascader Popup */}
      <Cascader 
        title='请选择所在地区'
        visible={showCascader}
        options={cascaderData}
        lazy
        onLoad={handleLazyLoad}
        onChange={handleRegionChange}
        onClose={() => setShowCascader(false)}
        closeable
        popupProps={{ className: 'region-popup' }}
      />
      
      {/* Loading Overlay */}
      {showCascader && isLoadingData && (
          <View className='loading-overlay'>
             <View className='loading-spinner' />
             <Text>正在加载下一级数据...</Text>
          </View>
      )}
    </View>
  )
}

export default AddressPicker
