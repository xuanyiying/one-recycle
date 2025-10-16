// 配置文件 - 环境变量和开发配置
// 已移除所有mock数据，现在使用真实API

declare const NODE_ENV: string
declare const USE_MOCK_DATA: string

// 开发环境检测
export const isDevelopment = NODE_ENV === 'development'

// 已弃用：mock数据功能已移除，现在始终使用真实API
export const useMockData = false

// 导出空对象以保持向后兼容性
export const mockData = {}
export const mockUserData = {}
export const mockCategoryData = {}
export const mockOrderData = {}
export const mockCourierData = {}
export const mockSystemData = {}