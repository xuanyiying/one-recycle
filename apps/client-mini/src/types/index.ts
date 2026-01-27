// 通用类型定义

// 导出订单创建流相关类型
export * from './address'
export * from './order'

// 用户相关类型
export interface User {
  id: number | string
  nickname: string
  avatarUrl: string
  mobile: string
  realName?: string
  openid?: string
  totalOrders?: number
  totalEarnings?: number
  memberLevel?: string
  joinDate?: string
  carbonReduction?: number
}

export interface UserStatistics {
  totalOrders: number
  completedOrders: number
  totalWeight: number
  totalEarnings: number
  carbonReduction: number
  recycleCategories: string[]
}

export interface UserBalance {
  balance: number
  frozenBalance: number
  totalEarnings: number
  withdrawableBalance: number
}

// 分类相关类型
export interface Category {
  id: number
  name: string
  icon: string
  description: string
  basePrice: number
  unitPrice: number
  unit: string
  isHot: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  subCategories?: SubCategory[]
  priceFactors?: PriceFactor[]
}

export interface SubCategory {
  id: number
  name: string
  basePrice: number
}

export interface PriceFactor {
  name: string
  weight: number
}

// 订单相关类型
export interface Order {
  id: string
  status: OrderStatus
  statusText: string
  categoryName: string
  items: OrderItem[]
  estimatedWeight: number
  estimatedPrice: number
  actualPrice?: number | null
  address: string | OrderAddress
  appointmentTime: string
  courierName?: string
  courierPhone?: string
  createTime: string
  updateTime: string
}

export interface OrderDetail {
  id: string
  status: OrderStatus
  statusText: string
  timeline: OrderTimeline[]
  categoryName: string
  items: OrderItem[]
  address: OrderAddress
  appointmentTime: string
  estimatedPrice: number
  serviceFee: number
  totalPrice: number
  settlementAmount?: number
  settlementTime?: string
  courier?: Courier
  createTime: string
}

export interface OrderTimeline {
  status: string
  text: string
  time: string
  completed: boolean
}

export interface OrderItem {
  name?: string // 兼容旧字段
  description?: string // 兼容旧字段
  estimatedWeight?: number // 兼容旧字段
  photos?: string[] // 兼容旧字段
  
  // 新字段 (匹配 Mock/Backend)
  categoryId?: number
  categoryName?: string
  weight?: number
  unitPrice?: number
  amount?: number
}

export interface OrderAddress {
  name: string
  phone: string
  detail: string
}

export type OrderStatus = 
  | 'pending_assignment'  // 待派单
  | 'pending_pickup'      // 待上门
  | 'in_progress'         // 进行中
  | 'pending_settlement'  // 待结算
  | 'completed'           // 已完成
  | 'cancelled'           // 已取消

// 快递员相关类型
export interface Courier {
  id: number
  name: string
  phone: string
  avatar: string
  rating: number
  distance?: number
  estimatedArrival?: number
  isOnline?: boolean
}

// 系统配置相关类型
export interface SystemConfig {
  serviceFee: number
  freeServiceThreshold: number
  supportedCities: string[]
  workingHours: {
    start: string
    end: string
  }
  timeSlots: string[]
}

export interface Banner {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  link: string
}

// 文章相关类型
export interface Article {
  id: number
  title: string
  summary: string
  imageUrl: string
  publishDate: string
  views: number
}

// 登录相关类型
export interface LoginProvider {
  id: string
  name: string
  icon: string
  color: string
}

export interface LoginResult {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export interface SmsVerification {
  phone: string
  code: string
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

// 表单相关类型
export interface RecycleFormData {
  categoryId: number
  subCategoryId?: number
  items: RecycleItem[]
  addressId: number
  appointmentTime: string
  notes?: string
  doorToDoorService: boolean
}

export interface RecycleItem {
  name: string
  description: string
  estimatedWeight: number
  photos: string[]
  condition: string
}

// 地址选择器相关类型
export interface RegionData {
  provinces: Province[]
}

export interface Province {
  name: string
  cities: City[]
}

export interface City {
  name: string
  districts: District[]
}

export interface District {
  name: string
}

// 上传相关类型
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// 分页相关类型
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 创建订单请求类型
export interface CreateOrderRequest {
  categoryId: number
  subCategoryId?: number
  items: RecycleItem[]
  addressId: number
  appointmentTime: string
  notes?: string
  doorToDoorService: boolean
  estimatedWeight: number
  userId: string
}

// 价格估算类型
export interface PriceEstimation {
  categoryId: number
  estimatedPrice: number
  basePrice: number
  weightFactor: number
  conditionFactor: number
  totalWeight: number
  serviceFee: number
  breakdown: PriceBreakdown[]
}

export interface PriceBreakdown {
  item: string
  weight: number
  unitPrice: number
  subtotal: number
}

// 回收员类型
export interface Recycler {
  id: string
  name: string
  phone: string
  avatar: string
  rating: number
  completedOrders: number
  specialties: string[]
  workingAreas: string[]
  isOnline: boolean
  distance?: number
  estimatedArrival?: number
  certifications: string[]
}