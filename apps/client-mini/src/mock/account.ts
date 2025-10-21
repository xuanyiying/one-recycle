// 账户相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'

// 地址接口定义
export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  address: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// 用户资料接口定义
export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  phone: string
  email?: string
  realName?: string
  idCard?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// 钱包接口定义
export interface Wallet {
  id: string
  userId: string
  balance: number
  frozenAmount: number
  totalEarnings: number
  totalWithdrawals: number
  updatedAt: string
}

// 交易记录接口定义
export interface Transaction {
  id: string
  userId: string
  type: 'income' | 'withdrawal' | 'refund'
  amount: number
  description: string
  orderId?: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

// Mock地址数据
const mockAddresses: Address[] = [
  {
    id: 'addr_001',
    userId: 'user_001',
    name: '张三',
    phone: '138****8888',
    address: '北京市朝阳区某某小区1号楼101室',
    isDefault: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'addr_002',
    userId: 'user_001',
    name: '李四',
    phone: '137****7777',
    address: '上海市浦东新区某某路123号',
    isDefault: false,
    createdAt: '2024-01-05T15:30:00Z',
    updatedAt: '2024-01-05T15:30:00Z'
  }
]

// Mock用户资料数据
const mockUserProfile: UserProfile = {
  id: 'user_001',
  nickname: '环保小达人',
  avatar: 'https://example.com/avatar.jpg',
  phone: '138****8888',
  email: 'user@example.com',
  realName: '张三',
  idCard: '110101199001011234',
  isVerified: true,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-15T14:20:00Z'
}

// Mock钱包数据
const mockWallet: Wallet = {
  id: 'wallet_001',
  userId: 'user_001',
  balance: 156.78,
  frozenAmount: 0,
  totalEarnings: 1234.56,
  totalWithdrawals: 1077.78,
  updatedAt: '2024-01-22T16:45:00Z'
}

// Mock交易记录数据
const mockTransactions: Transaction[] = [
  {
    id: 'trans_001',
    userId: 'user_001',
    type: 'income',
    amount: 11.49,
    description: '订单收益 - 废纸类回收',
    orderId: 'order_001',
    status: 'completed',
    createdAt: '2024-01-15T16:30:00Z'
  },
  {
    id: 'trans_002',
    userId: 'user_001',
    type: 'withdrawal',
    amount: 100.00,
    description: '提现到微信钱包',
    status: 'completed',
    createdAt: '2024-01-10T09:15:00Z'
  },
  {
    id: 'trans_003',
    userId: 'user_001',
    type: 'income',
    amount: 22.5,
    description: '订单收益 - 金属类回收',
    orderId: 'order_002',
    status: 'pending',
    createdAt: '2024-01-18T14:20:00Z'
  }
]

// Mock获取用户地址列表
export const mockGetUserAddresses = async (userId: string): Promise<MockResponse<Address[]>> => {
  const userAddresses = mockAddresses.filter(addr => addr.userId === userId)
  return createMockResponse(userAddresses, true, '获取地址列表成功')
}

// Mock添加地址
export const mockAddAddress = async (addressData: Partial<Address>): Promise<MockResponse<Address>> => {
  const newAddress: Address = {
    id: `addr_${MockDataGenerator.generateId()}`,
    userId: addressData.userId || 'user_001',
    name: addressData.name || '',
    phone: addressData.phone || '',
    address: addressData.address || '',
    isDefault: addressData.isDefault || false,
    createdAt: MockDataGenerator.generateTimestamp(),
    updatedAt: MockDataGenerator.generateTimestamp()
  }

  // 如果设置为默认地址，取消其他地址的默认状态
  if (newAddress.isDefault) {
    mockAddresses.forEach(addr => {
      if (addr.userId === newAddress.userId) {
        addr.isDefault = false
      }
    })
  }

  mockAddresses.push(newAddress)
  return createMockResponse(newAddress, true, '地址添加成功')
}

// Mock更新地址
export const mockUpdateAddress = async (addressId: string, addressData: Partial<Address>): Promise<MockResponse<Address | null>> => {
  const addressIndex = mockAddresses.findIndex(addr => addr.id === addressId)
  
  if (addressIndex === -1) {
    return createMockResponse(null, false, '地址不存在')
  }

  const updatedAddress = {
    ...mockAddresses[addressIndex],
    ...addressData,
    updatedAt: MockDataGenerator.generateTimestamp()
  }

  // 如果设置为默认地址，取消其他地址的默认状态
  if (updatedAddress.isDefault) {
    mockAddresses.forEach(addr => {
      if (addr.userId === updatedAddress.userId && addr.id !== addressId) {
        addr.isDefault = false
      }
    })
  }

  mockAddresses[addressIndex] = updatedAddress
  return createMockResponse(updatedAddress, true, '地址更新成功')
}

// Mock删除地址
export const mockDeleteAddress = async (addressId: string): Promise<MockResponse<boolean>> => {
  const addressIndex = mockAddresses.findIndex(addr => addr.id === addressId)
  
  if (addressIndex === -1) {
    return createMockResponse(false, false, '地址不存在')
  }

  mockAddresses.splice(addressIndex, 1)
  return createMockResponse(true, true, '地址删除成功')
}

// Mock获取用户资料
export const mockGetUserProfile = async (userId: string): Promise<MockResponse<UserProfile>> => {
  void userId
  return createMockResponse(mockUserProfile, true, '获取用户资料成功')
}

// Mock更新用户资料
export const mockUpdateUserProfile = async (userId: string, profileData: Partial<UserProfile>): Promise<MockResponse<UserProfile>> => {
  void userId
  const updatedProfile = {
    ...mockUserProfile,
    ...profileData,
    updatedAt: MockDataGenerator.generateTimestamp()
  }
  
  Object.assign(mockUserProfile, updatedProfile)
  return createMockResponse(updatedProfile, true, '用户资料更新成功')
}

// Mock获取钱包信息
export const mockGetWallet = async (userId: string): Promise<MockResponse<Wallet>> => {
  void userId
  return createMockResponse(mockWallet, true, '获取钱包信息成功')
}

// Mock获取交易记录
export const mockGetTransactions = async (userId: string, page: number = 1, limit: number = 20): Promise<MockResponse<Transaction[]>> => {
  const userTransactions = mockTransactions.filter(trans => trans.userId === userId)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedTransactions = userTransactions.slice(startIndex, endIndex)
  
  return createMockResponse(paginatedTransactions, true, '获取交易记录成功')
}

// Mock申请提现
export const mockRequestWithdrawal = async (userId: string, amount: number): Promise<MockResponse<Transaction>> => {
  if (amount > mockWallet.balance) {
    return createMockResponse(null as any, false, '余额不足')
  }

  const withdrawal: Transaction = {
    id: `trans_${MockDataGenerator.generateId()}`,
    userId,
    type: 'withdrawal',
    amount,
    description: '提现申请',
    status: 'pending',
    createdAt: MockDataGenerator.generateTimestamp()
  }

  mockTransactions.push(withdrawal)
  mockWallet.balance -= amount
  mockWallet.frozenAmount += amount
  mockWallet.updatedAt = MockDataGenerator.generateTimestamp()

  return createMockResponse(withdrawal, true, '提现申请提交成功')
}

// Mock实名认证
export const mockVerifyIdentity = async (userId: string, realName: string, idCard: string): Promise<MockResponse<boolean>> => {
  void userId
  mockUserProfile.realName = realName
  mockUserProfile.idCard = idCard
  mockUserProfile.isVerified = true
  mockUserProfile.updatedAt = MockDataGenerator.generateTimestamp()
  
  return createMockResponse(true, true, '实名认证成功')
}

// 导出所有账户相关mock函数
export const accountMockData = {
  getUserAddresses: mockGetUserAddresses,
  addAddress: mockAddAddress,
  updateAddress: mockUpdateAddress,
  deleteAddress: mockDeleteAddress,
  getUserProfile: mockGetUserProfile,
  updateUserProfile: mockUpdateUserProfile,
  getWallet: mockGetWallet,
  getTransactions: mockGetTransactions,
  requestWithdrawal: mockRequestWithdrawal,
  verifyIdentity: mockVerifyIdentity
}