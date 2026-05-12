export * from './account'
export * from './address'
export * from './category'
export * from './order'
export * from './withdrawal'

import type { Address as FullAddress } from './address'
import type { Item } from './order'

export type OrderAddress = FullAddress | { name: string; phone: string; detail: string }
export type OrderItem = Item

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

export interface SubCategory {
  id: number
  name: string
  basePrice: number
}

export interface PriceFactor {
  name: string
  weight: number
}

export interface OrderTimeline {
  status: string
  text: string
  time: string
  completed: boolean
}

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

export interface Article {
  id: number
  title: string
  summary: string
  imageUrl: string
  publishDate: string
  views: number
}

export interface QAItem {
  id: number
  question: string
  answer: string
  categoryId?: number
}

export interface NewsBrief {
  id: number
  nickname: string
  soldItems: string
  weight: number
  earnings: number
  time: string
}

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

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

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

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

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
