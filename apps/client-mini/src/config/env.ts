// 环境变量配置
// 符合前端规范的环境变量管理方案

interface EnvConfig {
  API_TIMEOUT: number
  USE_MOCK_DATA: boolean
  API_BASE_URL: string
}

// 开发环境配置
const developmentConfig: EnvConfig = {
  API_TIMEOUT: 10000,
  USE_MOCK_DATA: true,
  API_BASE_URL: 'http://localhost:3000/api',
}

// 生产环境配置
const productionConfig: EnvConfig = {
  API_TIMEOUT: 15000,
  USE_MOCK_DATA: false,
  API_BASE_URL: 'https://api.onerecycle.com'
}

// 测试环境配置
const testConfig: EnvConfig = {
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