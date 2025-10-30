// 地址管理服务
import Taro from '@tarojs/taro'
import { get, post, put, del } from '../utils/request'
import { AuthService } from './authService'

// 地址数据接口
export interface AddressData {
  id?: string | number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault?: boolean
  userId?: number
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 地址列表响应
export interface AddressListResponse {
  addresses: AddressData[]
  total: number
}

/**
 * 地址管理服务类
 */
export class AddressService {
  /**
   * 检查用户认证状态
   */
  private static checkAuth(): boolean {
    const isLoggedIn = AuthService.isLoggedIn()
    if (!isLoggedIn) {
      Taro.showToast({
        title: '请先登录',
        icon: 'error'
      })
      // 跳转到登录页
      setTimeout(() => {
        Taro.navigateTo({
          url: '/pages/login/index'
        })
      }, 1500)
      return false
    }
    return true
  }

  /**
   * 获取用户地址列表
   */
  static async getUserAddresses(): Promise<ApiResponse<AddressData[]>> {
    try {
      // 检查认证状态
      if (!this.checkAuth()) {
        return {
          success: false,
          error: '用户未登录'
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

      const response = await get(`/account/addresses/user/${user.id}`)
      
      Taro.hideLoading()

      if (response.success) {
        return {
          success: true,
          data: response.data || []
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
  static async createAddress(addressData: Omit<AddressData, 'id'>): Promise<ApiResponse<AddressData>> {
    try {
      // 检查认证状态
      if (!this.checkAuth()) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      const user = AuthService.getUser()
      if (!user?.id) {
        return {
          success: false,
          error: '用户信息不完整'
        }
      }

      // 验证必填字段
      const requiredFields = ['name', 'phone', 'province', 'city', 'district', 'detail']
      for (const field of requiredFields) {
        if (!addressData[field as keyof typeof addressData]) {
          const fieldNames: Record<string, string> = {
            name: '收货人姓名',
            phone: '手机号码',
            province: '省份',
            city: '城市',
            district: '区县',
            detail: '详细地址'
          }
          const errorMessage = `请填写${fieldNames[field]}`
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

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(addressData.phone)) {
        const errorMessage = '请输入正确的手机号码'
        Taro.showToast({
          title: errorMessage,
          icon: 'error'
        })
        return {
          success: false,
          error: errorMessage
        }
      }

      // 显示加载状态
      Taro.showLoading({
        title: '保存中...',
        mask: true
      })

      const requestData = {
        ...addressData,
        userId: user.id
      }

      const response = await post('/account/addresses', requestData)
      
      Taro.hideLoading()

      if (response.success) {
        Taro.showToast({
          title: '地址保存成功',
          icon: 'success'
        })
        return {
          success: true,
          data: response.data
        }
      } else {
        throw new Error(response.message || '保存地址失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      console.error('创建地址失败:', error)
      
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
   * 更新地址
   */
  static async updateAddress(id: string | number, addressData: Partial<AddressData>): Promise<ApiResponse<AddressData>> {
    try {
      // 检查认证状态
      if (!this.checkAuth()) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      if (!id) {
        return {
          success: false,
          error: '地址ID不能为空'
        }
      }

      // 如果包含手机号，验证格式
      if (addressData.phone) {
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(addressData.phone)) {
          const errorMessage = '请输入正确的手机号码'
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

      // 显示加载状态
      Taro.showLoading({
        title: '更新中...',
        mask: true
      })

      const response = await put(`/account/addresses/${id}`, addressData)
      
      Taro.hideLoading()

      if (response.success) {
        Taro.showToast({
          title: '地址更新成功',
          icon: 'success'
        })
        return {
          success: true,
          data: response.data
        }
      } else {
        throw new Error(response.message || '更新地址失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      console.error('更新地址失败:', error)
      
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
   * 删除地址
   */
  static async deleteAddress(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      // 检查认证状态
      if (!this.checkAuth()) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      if (!id) {
        return {
          success: false,
          error: '地址ID不能为空'
        }
      }

      // 显示加载状态
      Taro.showLoading({
        title: '删除中...',
        mask: true
      })

      const response = await put(`/account/addresses/${id}/delete`)
      
      Taro.hideLoading()

      if (response.success) {
        Taro.showToast({
          title: '地址删除成功',
          icon: 'success'
        })
        return {
          success: true,
          data: true
        }
      } else {
        throw new Error(response.message || '删除地址失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      console.error('删除地址失败:', error)
      
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
   * 设置默认地址
   */
  static async setDefaultAddress(id: string | number): Promise<ApiResponse<boolean>> {
    try {
      // 检查认证状态
      if (!this.checkAuth()) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      if (!id) {
        return {
          success: false,
          error: '地址ID不能为空'
        }
      }

      // 显示加载状态
      Taro.showLoading({
        title: '设置中...',
        mask: true
      })

      const response = await put(`/account/addresses/${id}`, { isDefault: true })
      
      Taro.hideLoading()

      if (response.success) {
        Taro.showToast({
          title: '设置成功',
          icon: 'success'
        })
        return {
          success: true,
          data: true
        }
      } else {
        throw new Error(response.message || '设置默认地址失败')
      }
    } catch (error: any) {
      Taro.hideLoading()
      console.error('设置默认地址失败:', error)
      
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
   * 获取默认地址
   */
  static async getDefaultAddress(): Promise<ApiResponse<AddressData | null>> {
    try {
      const addressesResult = await this.getUserAddresses()
      
      if (addressesResult.success && addressesResult.data) {
        const defaultAddress = addressesResult.data.find(addr => addr.isDefault)
        return {
          success: true,
          data: defaultAddress || null
        }
      }

      return {
        success: false,
        error: addressesResult.error || '获取默认地址失败'
      }
    } catch (error: any) {
      console.error('获取默认地址失败:', error)
      return {
        success: false,
        error: error.message || '获取默认地址失败'
      }
    }
  }

  /**
   * 根据ID获取地址详情
   */
  static async getAddressById(id: string | number): Promise<ApiResponse<AddressData | null>> {
    try {
      // 检查认证状态
      if (!this.checkAuth()) {
        return {
          success: false,
          error: '用户未登录'
        }
      }

      if (!id) {
        return {
          success: false,
          error: '地址ID不能为空'
        }
      }

      const response = await get(`/account/addresses/${id}`)

      if (response.success) {
        return {
          success: true,
          data: response.data
        }
      } else {
        throw new Error(response.message || '获取地址详情失败')
      }
    } catch (error: any) {
      console.error('获取地址详情失败:', error)
      
      const errorMessage = error.message || '网络错误，请稍后重试'
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
}