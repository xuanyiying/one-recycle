import { logger } from './logger'
// 小程序平台检测工具
import Taro from '@tarojs/taro'
import { LoginProvider } from '../types'

export type PlatformType = 'wechat' | 'alipay' | 'douyin' | 'kuaishou' | 'baidu' | 'qq' | 'unknown'

export interface PlatformInfo {
  type: PlatformType
  name: string
  supportedLoginMethods: string[]
  features: string[]
}

/**
 * 平台检测器
 * 精确识别当前小程序运行环境
 */
export class PlatformDetector {
  private static platformInfo: PlatformInfo | null = null

  /**
   * 获取当前小程序平台类型
   */
  static getCurrentPlatform(): PlatformType {
    try {
      const systemInfo = (() => { try { return Taro.getSystemInfoSync() } catch { return null as any } })()
      
      // 通过 Taro 的环境检测
      if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
        return 'wechat'
      } else if (Taro.getEnv() === Taro.ENV_TYPE.ALIPAY) {
        return 'alipay'
      } else if (Taro.getEnv() === Taro.ENV_TYPE.TT) {
        return 'douyin'
      } else if (Taro.getEnv() === Taro.ENV_TYPE.QQ) {
        return 'qq'
      } else if (Taro.getEnv() === Taro.ENV_TYPE.SWAN) {
        return 'baidu'
      }

      // 备用检测方案：通过系统信息
      const platform = (systemInfo as any)?.platform?.toLowerCase() || ''
      const appName = (systemInfo as any)?.app?.toLowerCase() || ''
      
      if (platform.includes('wechat') || appName.includes('wechat')) {
        return 'wechat'
      } else if (platform.includes('alipay') || appName.includes('alipay')) {
        return 'alipay'
      } else if (platform.includes('douyin') || appName.includes('toutiao') || appName.includes('bytedance')) {
        return 'douyin'
      } else if (platform.includes('kuaishou')) {
        return 'kuaishou'
      } else if (platform.includes('baidu') || platform.includes('swan')) {
        return 'baidu'
      } else if (platform.includes('qq')) {
        return 'qq'
      }

      // 通过全局对象检测
      if (typeof window !== 'undefined') {
        if ((window as any).__wxjs_environment === 'miniprogram') {
          return 'wechat'
        } else if (typeof (window as any).my !== 'undefined') {
          return 'alipay'
        } else if (typeof (window as any).tt !== 'undefined') {
          return 'douyin'
        } else if (typeof (window as any).swan !== 'undefined') {
          return 'baidu'
        } else if (typeof (window as any).qq !== 'undefined') {
          return 'qq'
        }
      }

      return 'unknown'
    } catch (error) {
      logger.warn('平台检测失败:', error)
      return 'unknown'
    }
  }

  /**
   * 获取平台详细信息
   */
  static getPlatformInfo(): PlatformInfo {
    if (this.platformInfo) {
      return this.platformInfo
    }

    const platformType = this.getCurrentPlatform()
    
    const platformConfigs: Record<PlatformType, PlatformInfo> = {
      wechat: {
        type: 'wechat',
        name: '微信',
        supportedLoginMethods: ['wechat', 'phone'],
        features: ['getUserProfile', 'login', 'payment', 'share']
      },
      alipay: {
        type: 'alipay',
        name: '支付宝',
        supportedLoginMethods: ['alipay', 'phone'],
        features: ['getOpenUserInfo', 'payment', 'share']
      },
      douyin: {
        type: 'douyin',
        name: '抖音',
        supportedLoginMethods: ['douyin', 'phone'],
        features: ['login', 'share', 'video']
      },
      kuaishou: {
        type: 'kuaishou',
        name: '快手',
        supportedLoginMethods: ['kuaishou', 'phone'],
        features: ['login', 'share', 'video']
      },
      baidu: {
        type: 'baidu',
        name: '百度',
        supportedLoginMethods: ['baidu', 'phone'],
        features: ['login', 'share']
      },
      qq: {
        type: 'qq',
        name: 'QQ',
        supportedLoginMethods: ['qq', 'phone'],
        features: ['login', 'share']
      },
      unknown: {
        type: 'unknown',
        name: '小程序',
        supportedLoginMethods: ['phone'],
        features: []
      }
    }

    this.platformInfo = platformConfigs[platformType]
    return this.platformInfo
  }

  /**
   * 获取平台名称
   */
  static getPlatformName(): string {
    return this.getPlatformInfo().name
  }
  /**
   * 获取所有登录提供商
   */
  static getPlatformChineseName(): string {
    switch (this.getPlatformName()) {
      case 'wechat':
        return '微信'
      case 'alipay':
        return '支付宝'
      case 'douyin':
        return '抖音'
      case 'kuaishou':
        return '快手'
      case 'baidu':
        return '百度'
      case 'qq':
        return 'QQ'
      default:
        return '微信'
    }
  }

  /**
   * 获取支持的登录方式
   */
  static getSupportedLoginMethods(): LoginProvider[] {
    const platformInfo = this.getPlatformInfo()
    const allProviders = this.getAllLoginProviders()
    
    return allProviders.filter(provider => 
      platformInfo.supportedLoginMethods.includes(provider.id)
    )
  }

  /**
   * 检查是否支持特定登录方式
   */
  static isLoginMethodSupported(method: string): boolean {
    const platformInfo = this.getPlatformInfo()
    return platformInfo.supportedLoginMethods.includes(method)
  }

  /**
   * 检查是否支持特定功能
   */
  static isFeatureSupported(feature: string): boolean {
    const platformInfo = this.getPlatformInfo()
    return platformInfo.features.includes(feature)
  }

  /**
   * 获取所有可用的登录提供商
   */
  private static getAllLoginProviders(): LoginProvider[] {
    return [
      {
        id: 'wechat',
        name: '微信',
        icon: '🟢',
        color: '#07C160'
      },
      {
        id: 'alipay',
        name: '支付宝',
        icon: '🔵',
        color: '#1677FF'
      },
      {
        id: 'douyin',
        name: '抖音',
        icon: '⚫',
        color: '#000000'
      },
      {
        id: 'kuaishou',
        name: '快手',
        icon: '🟡',
        color: '#FF6600'
      },
      {
        id: 'baidu',
        name: '百度',
        icon: '🔴',
        color: '#2932E1'
      },
      {
        id: 'qq',
        name: 'QQ',
        icon: '🐧',
        color: '#12B7F5'
      },
      {
        id: 'phone',
        name: '手机号',
        icon: '📱',
        color: '#666666'
      }
    ]
  }

  /**
   * 重置缓存的平台信息（用于测试）
   */
  static resetCache(): void {
    this.platformInfo = null
  }

  /**
   * 获取平台特定的配置
   */
  static getPlatformConfig() {
    const platformType = this.getCurrentPlatform()
    
    const configs = {
      wechat: {
        appId: '', // 从配置文件获取
        scope: 'snsapi_userinfo',
        loginApi: '/auth/wechat'
      },
      alipay: {
        appId: '', // 从配置文件获取
        scope: 'auth_user',
        loginApi: '/auth/alipay'
      },
      douyin: {
        appId: '', // 从配置文件获取
        scope: 'user_info',
        loginApi: '/auth/douyin'
      },
      kuaishou: {
        appId: '', // 从配置文件获取
        scope: 'user_info',
        loginApi: '/auth/kuaishou'
      },
      baidu: {
        appId: '', // 从配置文件获取
        scope: 'snsapi_userinfo',
        loginApi: '/auth/baidu'
      },
      qq: {
        appId: '', // 从配置文件获取
        scope: 'snsapi_userinfo',
        loginApi: '/auth/qq'
      },
      unknown: {
        appId: '',
        scope: '',
        loginApi: '/auth/unknown'
      }
    }

    return configs[platformType] || configs.unknown
  }
}