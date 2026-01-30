// 地址管理服务
import Taro from '@tarojs/taro'
import { get, post, put, del } from '@/utils/request'
import { AuthService } from './auth'
import { Address } from '@/types/address'

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 地址管理服务类
 */
export class AddressService {

  /**
   * 检查地址是否在配送范围内
   */
  static async checkDeliveryRange(address: Partial<Address>): Promise<ApiResponse<{ inRange: boolean; message?: string }>> {
    try {
      // 优先使用经纬度进行精确校验
      if (address.coordinates && address.coordinates.latitude && address.coordinates.longitude) {
        try {
          const response = await post('/location/check-range', {
            coordinates: address.coordinates,
            city: address.city,
            district: address.district
          })
          if (response.success) return response
        } catch (e) {
          console.warn('Backend range check failed, falling back to city check')
        }
      }

      // 降级方案：基于城市的简单校验
      // 实际生产中应从配置接口获取支持的城市列表
      const supportedCities = ['上海市', '北京市', '杭州市', '成都市', '深圳市', '广州市', '南京市', '武汉市', '西安市']
      const city = address.city || ''
      const inRange = supportedCities.some(c => city.includes(c))

      return {
        success: true,
        data: {
          inRange,
          message: inRange ? undefined : '抱歉，当前地区暂未开通上门回收服务'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: '配送范围校验异常'
      }
    }
  }

  /**
   * 获取用户地址列表
   */
  static async getUserAddresses(): Promise<ApiResponse<Address[]>> {
    try {
      // 检查认证状态
      if (!AuthService.isLoggedIn()) {
        return {
          success: false,
          error: '请登录后重试'
        }
      }

      const user = AuthService.getUser()
      if (!user?.id) {
        return {
          success: false,
          error: '用户信息不完整'
        }
      }

      // 显示加载状态
      Taro.showLoading({
        title: '加载中...',
        mask: true
      })

      const response = await get(`/addresses/user/${user.id}`)
      
      Taro.hideLoading()

      if (response.success) {
        // Use backend data directly as it's now unified
        const addresses = (response.data || []).map((addr: any) => ({
          ...addr,
          region: `${addr.province} ${addr.city} ${addr.district}`
        }))
        return {
          success: true,
          data: addresses
        }
      } else {
        throw new Error(response.message || '获取地址列表失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      console.error('获取地址列表失败:', error)
      
      const errorMessage = error.message || '网络错误，请稍后重试'
      Taro.showToast({
        title: errorMessage,
        icon: 'error'
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  /**
   * 创建新地址
   */
  static async createAddress(address: Omit<Address, 'id'>): Promise<ApiResponse<Address>> {
    try {
      // 检查认证状态
      if (!AuthService.isLoggedIn()) {
        return {
          success: false,
          error: '请登录后重试'
        }
      }

      const user = AuthService.getUser()
      if (!user?.id) {
        return {
          success: false,
          error: '用户信息不完整'
        }
      }

      // Use address directly as it's now unified with backend
      const requestData = {
        ...address,
        userId: user.id
      }

      Taro.showLoading({ title: '保存中...', mask: true })
      const response = await post('/addresses', requestData)
      Taro.hideLoading()

      if (response.success && response.data) {
        // Return backend data directly
        const addr = response.data
        const transformed: Address = {
          ...addr,
          region: `${addr.province} ${addr.city} ${addr.district}`
        }
        return { success: true, data: transformed }
      } else {
        throw new Error(response.message || '保存失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      return { success: false, error: error.message }
    }
  }

  /**
   * 更新地址
   */
  static async updateAddress(id: string | number, address: Partial<Address>): Promise<ApiResponse<Address>> {
    try {
      // Use address directly as it's now unified
      const requestData = {
        ...address
      }

      Taro.showLoading({ title: '更新中...', mask: true })
      const response = await put(`/addresses/${id}`, requestData)
      Taro.hideLoading()

      if (response.success && response.data) {
        // Return backend data directly
        const addr = response.data
        const transformed: Address = {
          ...addr,
          region: `${addr.province} ${addr.city} ${addr.district}`
        }
        return { success: true, data: transformed }
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      return { success: false, error: error.message }
    }
  }

  /**
   * 删除地址
   */
  static async deleteAddress(id: string | number): Promise<ApiResponse<void>> {
    try {
      Taro.showLoading({ title: '删除中...', mask: true })
      const response = await del(`/addresses/${id}`)
      Taro.hideLoading()

      if (response.success) {
        Taro.showToast({ title: '已删除', icon: 'success' })
        return { success: true }
      } else {
        throw new Error(response.message || '删除失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      return { success: false, error: error.message }
    }
  }

  /**
   * 设置默认地址
   */
  static async setDefaultAddress(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      if (!AuthService.isLoggedIn()) return { success: false, error: '请登录后重试' }
      if (!id) return { success: false, error: '地址ID不能为空' }

      Taro.showLoading({ title: '设置中...', mask: true })
      const response = await put(`/addresses/${id}`, { isDefault: true })
      Taro.hideLoading()

      if (response.success) {
        Taro.showToast({ title: '设置成功', icon: 'success' })
        return { success: true, data: true }
      } else {
        throw new Error(response.message || '设置默认地址失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      return { success: false, error: error.message }
    }
  }

  /**
   * 获取默认地址
   */
  static async getDefaultAddress(): Promise<ApiResponse<Address | null>> {
    try {
      const addressesResult = await this.getUserAddresses()
      if (addressesResult.success && addressesResult.data) {
        const defaultAddress = addressesResult.data.find(addr => addr.isDefault)
        return { success: true, data: defaultAddress || null }
      }
      return { success: false, error: addressesResult.error || '获取默认地址失败' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 根据ID获取地址详情
   */
  static async getAddressById(id: string | number): Promise<ApiResponse<Address | null>> {
    try {
      if (!AuthService.isLoggedIn()) return { success: false, error: '请登录后重试' }
      if (!id) return { success: false, error: '地址ID不能为空' }

      const response = await get(`/addresses/${id}`)

      if (response.success && response.data) {
        const addr = response.data
        const address: Address = {
          id: addr.id,
          name: addr.name,
          mobile: addr.phone,
          province: addr.province,
          city: addr.city,
          district: addr.area || addr.district,
          detail: addr.detail,
          isDefault: addr.isDefault,
          label: addr.tag || addr.label,
          coordinates: addr.coordinates
        }
        return { success: true, data: address }
      } else {
        throw new Error(response.message || '获取地址详情失败')
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
