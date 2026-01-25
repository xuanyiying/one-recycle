// 环境变量配置
// 符合前端规范的环境变量管理方案

interface EnvConfig {
  API_TIMEOUT: number
  USE_MOCK_DATA: boolean
  API_BASE_URL: string
}

// 默认配置
const defaultConfig: EnvConfig = {
  API_TIMEOUT: 10000,
  USE_MOCK_DATA: process.env.TARO_APP_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development',
  API_BASE_URL: process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000/api',
}

// 开发环境配置
const developmentConfig: EnvConfig = {
  ...defaultConfig,
  USE_MOCK_DATA: process.env.TARO_APP_USE_MOCK_DATA !== 'false', // 除非显式设为 false，否则开发环境默认开启
}

// 生产环境配置
const productionConfig: EnvConfig = {
  API_TIMEOUT: 15000,
  USE_MOCK_DATA: process.env.TARO_APP_USE_MOCK_DATA === 'true',
  API_BASE_URL: process.env.TARO_APP_API_BASE_URL || 'https://api.onerecycle.com'
}

// 测试环境配置
const testConfig: EnvConfig = {
  API_TIMEOUT: 12000,
  USE_MOCK_DATA: process.env.TARO_APP_USE_MOCK_DATA !== 'false',
  API_BASE_URL: process.env.TARO_APP_API_BASE_URL || 'https://test-api.onerecycle.com'
}

// 获取当前环境
function getCurrentEnv(): 'development' | 'production' | 'test' {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase()
  if (nodeEnv.startsWith('prod')) return 'production'
  if (nodeEnv.startsWith('test')) return 'test'
  return 'development'
}

// 根据环境获取配置
function getEnvConfig(): EnvConfig {
  const env = getCurrentEnv()
  let config: EnvConfig
  
  switch (env) {
    case 'production':
      config = productionConfig
      break
    case 'test':
      config = testConfig
      break
    default:
      config = developmentConfig
      break
  }

  // 打印环境配置信息，方便调试
  if (process.env.NODE_ENV === 'development') {
    console.log('[Env Config] Current Environment:', env)
    console.log('[Env Config] USE_MOCK_DATA:', config.USE_MOCK_DATA)
    console.log('[Env Config] API_BASE_URL:', config.API_BASE_URL)
  }

  return config
}

// 导出配置
export const ENV_CONFIG = getEnvConfig()

// 导出环境判断函数
export const isDevelopment = () => getCurrentEnv() === 'development'
export const isProduction = () => getCurrentEnv() === 'production'
export const isTest = () => getCurrentEnv() === 'test'

// 导出当前环境
export const CURRENT_ENV = getCurrentEnv()
