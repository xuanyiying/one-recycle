import React, { useState, useCallback, useMemo } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import { Cascader, Popup, SearchBar } from '@nutui/nutui-react-taro'
import { LocationService } from '@/services/location'
import { AddressDataService } from '@/services/address-data-service'
import { Address, LocationInfo } from '@/types/address'
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
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationInfo[]>([])
  const [isLocating, setIsLocating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const loadInitialData = useCallback(async () => {
    setIsLoadingData(true)
    try {
      const provinces = await AddressDataService.getProvinces()
      const options = provinces.map(p => ({
        value: p.code,
        label: p.name,
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

  const handleLazyLoad = useCallback(async (node: any, resolve: (children: any[]) => void) => {
    const { value, level } = node
    try {
      // level 0: Province -> City
      // level 1: City -> District
      // level 2: District -> Street (optional)
      const nextLevel = (parseInt(level) + 2).toString() 
      const areas = await AddressDataService.getAreas(nextLevel, value)
      const children = areas.map(a => ({
        value: a.code,
        label: a.name,
        leaf: parseInt(nextLevel) >= 4 // Use 4 as leaf level to include streets
      }))
      resolve(children)
    } catch (error) {
      resolve([])
    }
  }, [])

  const handleFallback = useCallback(() => {
    Taro.showModal({
      title: '选择地区',
      content: '暂时无法自动加载地区数据，您可以尝试手动搜索小区或直接输入详细地址。',
      confirmText: '去搜索',
      cancelText: '知道了',
      success: (res) => {
        if (res.confirm) {
          setShowSearch(true)
        }
      }
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

    const province = options[0]?.label || ''
    const city = options[1]?.label || ''
    const district = options[2]?.label || ''
    const street = options[3]?.label || ''
    
    // 特殊处理直辖市：如果省份和城市名称相同，则在显示时进行合并或精简
    const isDirectCity = ['北京市', '上海市', '天津市', '重庆市'].includes(province) || 
                         ['北京', '上海', '天津', '重庆'].includes(province)
    
    let displayRegion = isDirectCity 
      ? `${province} ${district}`
      : `${province} ${city} ${district}`
    
    if (street) {
      displayRegion += ` ${street}`
    }

    onChange({
      ...value,
      province,
      city: isDirectCity ? province : city,
      district,
      street,
      region: displayRegion.trim()
    })
    setShowCascader(false)
  }, [onChange, value])

  const handleSearch = useCallback(async (keyword: string) => {
    setSearchQuery(keyword)
    if (keyword.length < 1) {
      setSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      // 1. 首先尝试从本地静态数据中搜索行政区划
      const regionResults = await AddressDataService.searchAreas(keyword)
      const regionSuggestions: LocationInfo[] = regionResults.map(r => ({
        name: r.name,
        address: r.pinyin || '',
        province: r.name, // 简化处理，实际可能需要更复杂的路径查找
        city: '',
        district: '',
        coordinates: { latitude: 0, longitude: 0 }
      }))

      // 2. 然后尝试从地图 API 搜索 POI
      const poiResults = await LocationService.getSuggestions(keyword)
      
      setSuggestions([...regionSuggestions, ...poiResults])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSelectSuggestion = useCallback((suggestion: LocationInfo) => {
    onChange({
      ...value,
      province: suggestion.province || value?.province,
      city: suggestion.city || value?.city,
      district: suggestion.district || value?.district,
      detailedAddress: suggestion.name || suggestion.address,
      coordinates: suggestion.coordinates,
      region: suggestion.province ? `${suggestion.province} ${suggestion.city} ${suggestion.district || ''}` : value.region
    })
    setShowSearch(false)
    setSearchQuery('')
    setSuggestions([])
  }, [onChange, value])

  const handleUseGPS = useCallback(async () => {
    setIsLocating(true)
    try {
      const coords = await LocationService.getCurrentCoordinates()
      const info = await LocationService.reverseGeocode(coords)
      onChange({
        ...value,
        province: info.province,
        city: info.city,
        district: info.district,
        detailedAddress: info.name || info.address,
        coordinates: info.coordinates,
        region: `${info.province} ${info.city} ${info.district || ''}`
      })
      Taro.showToast({ title: '定位成功', icon: 'success' })
    } catch (error: any) {
      Taro.showToast({ title: error.message || '定位失败', icon: 'none' })
    } finally {
      setIsLocating(false)
    }
  }, [onChange, value])

  const handleOpenMap = useCallback(async () => {
    try {
      const address = await LocationService.chooseLocation(value.coordinates)
      onChange({
        ...value,
        ...address,
        region: address.province ? `${address.province} ${address.city} ${address.district || ''}` : value.region
      })
      Taro.showToast({ title: '位置已选择', icon: 'success' })
    } catch (error: any) {
      if (error.message !== 'CANCELED') {
        Taro.showToast({ title: error.message, icon: 'none' })
      }
    }
  }, [onChange, value])

  const regionDisplay = value.province 
    ? `${value.province} ${value.city} ${value.district || ''}`
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
          {isLocating && <View className='loading-spinner' />}
        </View>
        <Text className='arrow'>&gt;</Text>
      </View>

      {/* Search Trigger */}
      <View className='picker-section search-trigger' onClick={() => setShowSearch(true)}>
        <Text className='label'>查找地址</Text>
        <View className='value-container'>
          <Text className='placeholder'>输入小区/大厦/学校等</Text>
        </View>
        <Text className='arrow'>&gt;</Text>
      </View>

      {/* Quick Actions */}
      <View className='position-actions'>
        <View className='action-btn' onClick={handleUseGPS}>
          <Text className='nut-icon'>📍</Text>
          <Text>当前位置</Text>
        </View>
        <View className='divider' />
        <View className='action-btn' onClick={handleOpenMap}>
          <Text className='nut-icon'>🗺️</Text>
          <Text>地图选择</Text>
        </View>
      </View>

      {/* Region Cascader Popup */}
      <Popup visible={showCascader} position='bottom' onClose={() => setShowCascader(false)}>
        {cascaderData.length > 0 ? (
          <Cascader
            title='选择地区'
            visible={showCascader}
            options={cascaderData}
            lazy
            onLoad={handleLazyLoad}
            onClose={() => setShowCascader(false)}
            onChange={handleRegionChange}
          />
        ) : (
          <View className='empty-cascader'>
            <Text>暂无地区数据</Text>
            <Button size='mini' type='primary' onClick={handleOpenCascader}>重试</Button>
          </View>
        )}
      </Popup>

      {/* Search Popup */}
      <Popup visible={showSearch} position='bottom' className='search-popup' onClose={() => setShowSearch(false)}>
        <View className='search-container'>
          <SearchBar
            placeholder='搜索地址'
            value={searchQuery}
            onChange={handleSearch}
            autoFocus
          />
          <ScrollView className='suggestions-list' scrollY enhanced showScrollbar={false}>
            {isSearching && <View className='loading-text'>搜索中...</View>}
            {suggestions.length > 0 ? (
              suggestions.slice(0, 50).map((item, index) => (
                <View 
                  key={index} 
                  className='suggestion-item'
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <Text className='item-name'>{item.name}</Text>
                  <Text className='item-address'>{item.address}</Text>
                </View>
              ))
            ) : (
              !isSearching && searchQuery.length >= 2 && (
                <View className='empty-text'>未找到相关地址</View>
              )
            )}
            {suggestions.length > 50 && (
              <View className='list-footer'>仅展示前 50 条相关地址</View>
            )}
          </ScrollView>
        </View>
      </Popup>
    </View>
  )
}

export default AddressPicker
