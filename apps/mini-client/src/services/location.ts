import { Address, Coordinates, LocationInfo } from '@/types/address'
import Taro from '@tarojs/taro'
import { get } from '../utils/request'

export class LocationService {
  private static readonly CACHE_KEY = 'last_known_location'
  private static readonly CACHE_EXPIRY = 1000 * 60 * 30
  private static readonly CITY_CACHE_KEY = 'ip_city'
  private static readonly CITY_CACHE_EXPIRY = 1000 * 60 * 60

  static async getCurrentCoordinates(): Promise<Coordinates> {
    try {
      const setting = await Taro.getSetting()

      if (setting.authSetting['scope.userLocation'] === false) {
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

      if (error.message === '定位权限未开启') {
        throw error
      }

      const cached = this.getCachedLocation()
      if (cached) return cached.coordinates

      const msg = error.errMsg?.includes('deny') ? '定位权限未开启' : '无法获取当前位置，请重试'
      throw new Error(msg)
    }
  }

  static async reverseGeocode(coords: Coordinates): Promise<LocationInfo> {
    try {
      const res = await get('/location/reverse-geocode', {
        lat: coords.latitude,
        lng: coords.longitude
      })
      return res as LocationInfo
    } catch (error) {
      throw new Error('无法解析当前位置的详细地址')
    }
  }

  static async getSuggestions(keyword: string, coords?: Coordinates): Promise<LocationInfo[]> {
    if (!keyword) return []

    try {
      const res = await get('/location/suggestions', {
        keyword,
        lat: coords?.latitude,
        lng: coords?.longitude
      })
      return (res || []) as LocationInfo[]
    } catch (error) {
      return []
    }
  }

  static async chooseLocation(initialCoords?: Coordinates): Promise<Partial<Address> & { coordinates: Coordinates }> {
    try {
      const options: any = {}
      if (initialCoords) {
        options.latitude = initialCoords.latitude
        options.longitude = initialCoords.longitude
      }

      const res = await Taro.chooseLocation(options)

      return {
        detail: res.name || res.address,
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

  static async getCityByIP(): Promise<string> {
    try {
      const cached = this.getCachedCity()
      if (cached) return cached

      const res = await get<{ success?: boolean; data?: { city?: string; province?: string }; city?: string; province?: string }>('/location/ip')
      const city = res?.data?.city || res?.city || ''
      const province = res?.data?.province || res?.province || ''

      const cityName = city || province.replace(/省$/, '') || '未知'

      this.cacheCity(cityName)
      return cityName
    } catch {
      return '未知'
    }
  }

  private static cacheCity(city: string): void {
    try {
      Taro.setStorageSync(this.CITY_CACHE_KEY, { city, timestamp: Date.now() })
    } catch { }
  }

  private static getCachedCity(): string | null {
    try {
      const cached = Taro.getStorageSync(this.CITY_CACHE_KEY)
      if (cached && Date.now() - cached.timestamp < this.CITY_CACHE_EXPIRY) {
        return cached.city
      }
    } catch { }
    return null
  }

  private static cacheLocation(coordinates: Coordinates): void {
    Taro.setStorage({
      key: this.CACHE_KEY,
      data: {
        coordinates,
        timestamp: Date.now()
      }
    })
  }

  private static getCachedLocation(): { coordinates: Coordinates; timestamp: number } | null {
    try {
      const cached = Taro.getStorageSync(this.CACHE_KEY)
      if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached
      }
    } catch (e) { }
    return null
  }
}
