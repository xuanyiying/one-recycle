// 系统相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'

// 系统配置接口定义
export interface SystemConfig {
  id: string
  key: string
  value: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json'
  updatedAt: string
}

// 版本信息接口定义
export interface VersionInfo {
  version: string
  buildNumber: string
  releaseDate: string
  features: string[]
  bugFixes: string[]
  forceUpdate: boolean
  downloadUrl?: string
}

// 反馈信息接口定义
export interface Feedback {
  id: string
  userId: string
  type: 'bug' | 'suggestion' | 'complaint' | 'praise'
  title: string
  content: string
  images?: string[]
  contact?: string
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  reply?: string
  createdAt: string
  updatedAt: string
}

// 常见问题接口定义
export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 公告信息接口定义
export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  isImportant: boolean
  startTime: string
  endTime?: string
  targetUsers?: string[] // 目标用户ID列表，空表示所有用户
  createdAt: string
}

// Mock系统配置数据
const mockSystemConfigs: SystemConfig[] = [
  {
    id: 'config_001',
    key: 'min_order_amount',
    value: '10',
    description: '最小订单金额',
    type: 'number',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'config_002',
    key: 'service_hours',
    value: '{"start": "08:00", "end": "18:00"}',
    description: '服务时间',
    type: 'json',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'config_003',
    key: 'maintenance_mode',
    value: 'false',
    description: '维护模式',
    type: 'boolean',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'config_004',
    key: 'customer_service_phone',
    value: '400-123-4567',
    description: '客服电话',
    type: 'string',
    updatedAt: '2024-01-01T10:00:00Z'
  }
]

// Mock版本信息数据
const mockVersionInfo: VersionInfo = {
  version: '1.2.3',
  buildNumber: '20240122001',
  releaseDate: '2024-01-22',
  features: [
    '新增订单状态实时推送',
    '优化回收价格计算算法',
    '增加用户积分系统',
    '支持批量上传回收物品图片'
  ],
  bugFixes: [
    '修复登录状态异常问题',
    '解决地址选择器闪退问题',
    '优化网络请求超时处理',
    '修复iOS设备上的兼容性问题'
  ],
  forceUpdate: false,
  downloadUrl: 'https://example.com/download/app-v1.2.3.apk'
}

// Mock反馈数据
const mockFeedbacks: Feedback[] = [
  {
    id: 'feedback_001',
    userId: 'user_001',
    type: 'suggestion',
    title: '希望增加夜间回收服务',
    content: '建议增加夜间回收服务，方便上班族用户',
    contact: '138****8888',
    status: 'processing',
    reply: '感谢您的建议，我们正在评估夜间服务的可行性',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-21T09:15:00Z'
  },
  {
    id: 'feedback_002',
    userId: 'user_001',
    type: 'bug',
    title: '支付页面加载缓慢',
    content: '支付页面经常加载很慢，有时候会卡住',
    images: ['https://example.com/feedback/bug1.jpg'],
    status: 'resolved',
    reply: '该问题已在最新版本中修复，请更新到最新版本',
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-19T10:30:00Z'
  }
]

// Mock常见问题数据
const mockFAQs: FAQ[] = [
  {
    id: 'faq_001',
    category: '订单相关',
    question: '如何取消已提交的订单？',
    answer: '在订单详情页面，如果订单状态为"待确认"，您可以点击"取消订单"按钮进行取消。已确认的订单无法取消。',
    order: 1,
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'faq_002',
    category: '价格相关',
    question: '回收价格是如何计算的？',
    answer: '回收价格根据物品类型、重量、市场行情等因素综合计算。具体价格可在分类页面查看。',
    order: 2,
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'faq_003',
    category: '支付相关',
    question: '支持哪些提现方式？',
    answer: '目前支持微信钱包、支付宝和银行卡提现。提现金额会在1-3个工作日内到账。',
    order: 3,
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  }
]

// Mock公告数据
const mockAnnouncements: Announcement[] = [
  {
    id: 'announce_001',
    title: '春节期间服务调整通知',
    content: '春节期间（2月10日-2月17日）回收服务暂停，2月18日恢复正常服务。给您带来的不便敬请谅解！',
    type: 'warning',
    isImportant: true,
    startTime: '2024-02-01T00:00:00Z',
    endTime: '2024-02-18T00:00:00Z',
    createdAt: '2024-01-25T10:00:00Z'
  },
  {
    id: 'announce_002',
    title: '新增电子产品回收类别',
    content: '即日起新增电子产品回收服务，包括手机、平板、笔记本电脑等，价格优惠，欢迎体验！',
    type: 'success',
    isImportant: false,
    startTime: '2024-01-20T00:00:00Z',
    createdAt: '2024-01-20T09:00:00Z'
  }
]

// Mock获取系统配置
export const mockGetSystemConfig = async (key?: string): Promise<MockResponse<SystemConfig[]>> => {
  let configs = mockSystemConfigs
  
  if (key) {
    configs = mockSystemConfigs.filter(config => config.key === key)
  }
  
  return createMockResponse(configs, true, '获取系统配置成功')
}

// Mock获取版本信息
export const mockGetVersionInfo = async (): Promise<MockResponse<VersionInfo>> => {
  return createMockResponse(mockVersionInfo, true, '获取版本信息成功')
}

// Mock检查更新
export const mockCheckUpdate = async (currentVersion: string): Promise<MockResponse<{
  hasUpdate: boolean
  versionInfo?: VersionInfo
}>> => {
  const hasUpdate = currentVersion !== mockVersionInfo.version
  
  const result = {
    hasUpdate,
    versionInfo: hasUpdate ? mockVersionInfo : undefined
  }
  
  return createMockResponse(result, true, hasUpdate ? '发现新版本' : '已是最新版本')
}

// Mock提交反馈
export const mockSubmitFeedback = async (feedbackData: {
  userId: string
  type: 'bug' | 'suggestion' | 'complaint' | 'praise'
  title: string
  content: string
  images?: string[]
  contact?: string
}): Promise<MockResponse<Feedback>> => {
  const newFeedback: Feedback = {
    id: `feedback_${MockDataGenerator.generateId()}`,
    userId: feedbackData.userId,
    type: feedbackData.type,
    title: feedbackData.title,
    content: feedbackData.content,
    images: feedbackData.images,
    contact: feedbackData.contact,
    status: 'pending',
    createdAt: MockDataGenerator.generateTimestamp(),
    updatedAt: MockDataGenerator.generateTimestamp()
  }
  
  mockFeedbacks.push(newFeedback)
  return createMockResponse(newFeedback, true, '反馈提交成功')
}

// Mock获取用户反馈列表
export const mockGetUserFeedbacks = async (userId: string): Promise<MockResponse<Feedback[]>> => {
  const userFeedbacks = mockFeedbacks.filter(feedback => feedback.userId === userId)
  return createMockResponse(userFeedbacks, true, '获取反馈列表成功')
}

// Mock获取常见问题
export const mockGetFAQs = async (category?: string): Promise<MockResponse<FAQ[]>> => {
  let faqs = mockFAQs.filter(faq => faq.isActive)
  
  if (category) {
    faqs = faqs.filter(faq => faq.category === category)
  }
  
  // 按order字段排序
  faqs.sort((a, b) => a.order - b.order)
  
  return createMockResponse(faqs, true, '获取常见问题成功')
}

// Mock获取FAQ分类
export const mockGetFAQCategories = async (): Promise<MockResponse<string[]>> => {
  const categories = [...new Set(mockFAQs.filter(faq => faq.isActive).map(faq => faq.category))]
  return createMockResponse(categories, true, '获取FAQ分类成功')
}

// Mock获取公告列表
export const mockGetAnnouncements = async (userId?: string): Promise<MockResponse<Announcement[]>> => {
  const currentTime = new Date().toISOString()
  
  let announcements = mockAnnouncements.filter(announce => {
    // 检查时间范围
    const isInTimeRange = announce.startTime <= currentTime && 
                         (!announce.endTime || announce.endTime >= currentTime)
    
    // 检查目标用户
    const isTargetUser = !announce.targetUsers || 
                        !userId || 
                        announce.targetUsers.includes(userId)
    
    return isInTimeRange && isTargetUser
  })
  
  // 按重要性和创建时间排序
  announcements.sort((a, b) => {
    if (a.isImportant !== b.isImportant) {
      return b.isImportant ? 1 : -1
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
  
  return createMockResponse(announcements, true, '获取公告列表成功')
}

// Mock获取客服信息
export const mockGetCustomerService = async (): Promise<MockResponse<{
  phone: string
  email: string
  workingHours: string
  onlineChat: boolean
}>> => {
  const customerService = {
    phone: '400-123-4567',
    email: 'service@onerecycle.com',
    workingHours: '周一至周日 08:00-18:00',
    onlineChat: true
  }
  
  return createMockResponse(customerService, true, '获取客服信息成功')
}

// Mock上传图片
export const mockUploadImage = async (imageData: any): Promise<MockResponse<string>> => {
  void imageData
  // 模拟图片上传，返回图片URL
  const imageUrl = `https://example.com/uploads/${MockDataGenerator.generateId()}.jpg`
  return createMockResponse(imageUrl, true, '图片上传成功')
}

// 导出所有系统相关mock函数
export const systemMockData = {
  getSystemConfig: mockGetSystemConfig,
  getVersionInfo: mockGetVersionInfo,
  checkUpdate: mockCheckUpdate,
  submitFeedback: mockSubmitFeedback,
  getUserFeedbacks: mockGetUserFeedbacks,
  getFAQs: mockGetFAQs,
  getFAQCategories: mockGetFAQCategories,
  getAnnouncements: mockGetAnnouncements,
  getCustomerService: mockGetCustomerService,
  uploadImage: mockUploadImage
}