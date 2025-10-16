// 环境变量配置
// 符合前端规范的环境变量管理方案

interface EnvConfig {
  CATEGORY_SERVICE_URL: string
  ORDER_SERVICE_URL: string
  ACCOUNT_SERVICE_URL: string
  INVENTORY_SERVICE_URL: string
  DISPATCH_SERVICE_URL: string
  API_TIMEOUT: number
  USE_MOCK_DATA: boolean
  API_BASE_URL: string
}

// 开发环境配置
const developmentConfig: EnvConfig = {
  CATEGORY_SERVICE_URL: 'http://localhost:3008/api',
  ORDER_SERVICE_URL: 'http://localhost:3003/api',
  ACCOUNT_SERVICE_URL: 'http://localhost:3001/api',
  INVENTORY_SERVICE_URL: 'http://localhost:3009/api',
  DISPATCH_SERVICE_URL: 'http://localhost:3006/api',
  API_TIMEOUT: 10000,
  USE_MOCK_DATA: false,
  API_BASE_URL: 'http://localhost:3000/api'
}

// 生产环境配置
const productionConfig: EnvConfig = {
  CATEGORY_SERVICE_URL: 'https://api.onerecycle.com/category',
  ORDER_SERVICE_URL: 'https://api.onerecycle.com/order',
  ACCOUNT_SERVICE_URL: 'https://api.onerecycle.com/account',
  INVENTORY_SERVICE_URL: 'https://api.onerecycle.com/inventory',
  DISPATCH_SERVICE_URL: 'https://api.onerecycle.com/dispatch',
  API_TIMEOUT: 15000,
  USE_MOCK_DATA: false,
  API_BASE_URL: 'https://api.onerecycle.com'
}

// 测试环境配置
const testConfig: EnvConfig = {
  CATEGORY_SERVICE_URL: 'https://test-api.onerecycle.com/category',
  ORDER_SERVICE_URL: 'https://test-api.onerecycle.com/order',
  ACCOUNT_SERVICE_URL: 'https://test-api.onerecycle.com/account',
  INVENTORY_SERVICE_URL: 'https://test-api.onerecycle.com/inventory',
  DISPATCH_SERVICE_URL: 'https://test-api.onerecycle.com/dispatch',
  API_TIMEOUT: 12000,
  USE_MOCK_DATA: false,
  API_BASE_URL: 'https://test-api.onerecycle.com'
}

// 获取当前环境
function getCurrentEnv(): 'development' | 'production' | 'test' {
  // 在小程序环境中，默认使用开发环境
  // 生产环境通过构建配置设置
  return 'development'
}

// 根据环境获取配置
function getEnvConfig(): EnvConfig {
  const env = getCurrentEnv()
  
  switch (env) {
    case 'production':
      return productionConfig
    case 'test':
      return testConfig
    default:
      return developmentConfig
  }
}

// 导出配置
export const ENV_CONFIG = getEnvConfig()

// 导出环境判断函数
export const isDevelopment = () => getCurrentEnv() === 'development'
export const isProduction = () => getCurrentEnv() === 'production'
export const isTest = () => getCurrentEnv() === 'test'

// 导出当前环境
export const CURRENT_ENV = getCurrentEnv()