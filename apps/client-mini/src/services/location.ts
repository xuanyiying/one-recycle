import Taro from '@tarojs/taro'
import { LocationInfo, Coordinates, Address } from '@/types/address'
import { get } from '../utils/request'

/**
 * Location Service
 * Handles GPS positioning, reverse geocoding, and address suggestions
 */
export class LocationService {
  private static readonly CACHE_KEY = 'last_known_location'
  private static readonly CACHE_EXPIRY = 1000 * 60 * 30 // 30 minutes

  /**
   * Get current GPS coordinates
   */
  static async getCurrentCoordinates(): Promise<Coordinates> {
    try {
      // Check if location permission is authorized
      const setting = await Taro.getSetting()
      
      if (setting.authSetting['scope.userLocation'] === false) {
        // If explicitly denied, we need to show a modal to guide user to settings
        const res = await Taro.showModal({
          title: '定位未授权',
          content: '请在设置中允许使用定位信息，以便为您自动填写地址',
          confirmText: '去设置'
        })
        
        if (res.confirm) {
          await Taro.openSetting()
        }
        throw new Error('定位权限未开启')
      }

      Taro.showLoading({ title: '定位中...', mask: true })
      
      const { latitude, longitude } = await Taro.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        highAccuracyExpireTime: 3000
      })
      
      Taro.hideLoading()
      
      const coords = { latitude, longitude }
      this.cacheLocation(coords)
      return coords
    } catch (error: any) {
      Taro.hideLoading()
      
      // If it's an error we already threw (like "定位权限未开启"), rethrow it
      if (error.message === '定位权限未开启') {
        throw error
      }
      
      // Fallback to cache if available
      const cached = this.getCachedLocation()
      if (cached) return cached.coordinates
      
      const msg = error.errMsg?.includes('deny') ? '定位权限未开启' : '无法获取当前位置，请重试'
      throw new Error(msg)
    }
  }

  /**
   * Reverse geocode coordinates to get address details
   */
  static async reverseGeocode(coords: Coordinates): Promise<LocationInfo> {
    try {
      // Integration with Tencent Map or similar reverse geocoding API
      // For now, returning mock data or using a placeholder API call
      const res = await get('/api/location/reverse-geocode', {
        lat: coords.latitude,
        lng: coords.longitude
      })
      return res as LocationInfo
    } catch (error) {
      throw new Error('无法解析当前位置的详细地址')
    }
  }

  /**
   * Get address suggestions based on keyword and current location
   */
  static async getSuggestions(keyword: string, coords?: Coordinates): Promise<LocationInfo[]> {
    if (!keyword) return []
    
    try {
      const res = await get('/api/location/suggestions', {
        keyword,
        lat: coords?.latitude,
        lng: coords?.longitude
      })
      return (res || []) as LocationInfo[]
    } catch (error) {
      return []
    }
  }

  /**
   * Choose location from map
   */
  static async chooseLocation(initialCoords?: Coordinates): Promise<Partial<Address> & { coordinates: Coordinates }> {
    try {
      const options: any = {}
      if (initialCoords) {
        options.latitude = initialCoords.latitude
        options.longitude = initialCoords.longitude
      }

      const res = await Taro.chooseLocation(options)
      
      // Basic parsing of the address string returned by chooseLocation
      return {
        detailedAddress: res.name || res.address,
        coordinates: {
          latitude: res.latitude,
          longitude: res.longitude
        }
      }
    } catch (error: any) {
      if (error.errMsg?.includes('cancel')) {
        throw new Error('CANCELED')
      }
      throw new Error('无法打开地图，请检查定位权限')
    }
  }

  /**
   * Cache the last known location
   */
  private static cacheLocation(coordinates: Coordinates): void {
    Taro.setStorage({
      key: this.CACHE_KEY,
      data: {
        coordinates,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Retrieve cached location if not expired
   */
  private static getCachedLocation(): { coordinates: Coordinates; timestamp: number } | null {
    try {
      const cached = Taro.getStorageSync(this.CACHE_KEY)
      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached
      }
    } catch (e) {}
    return null
  }
}