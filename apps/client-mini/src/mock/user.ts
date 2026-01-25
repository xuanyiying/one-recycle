// 用户相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'

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

// Mock用户资料数据
const mockUserProfile: UserProfile = {
  id: 'user_001',
  nickname: '环保小达人',
  avatar: '', 
  phone: '138****8888',
  email: 'user@example.com',
  realName: '张三',
  idCard: '110101199001011234',
  isVerified: true,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-15T14:20:00Z'
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

// Mock实名认证
export const mockVerifyIdentity = async (userId: string, realName: string, idCard: string): Promise<MockResponse<boolean>> => {
  void userId
  mockUserProfile.realName = realName
  mockUserProfile.idCard = idCard
  mockUserProfile.isVerified = true
  mockUserProfile.updatedAt = MockDataGenerator.generateTimestamp()
  
  return createMockResponse(true, true, '实名认证成功')
}

export const userMockData = {
  getUserProfile: mockGetUserProfile,
  updateUserProfile: mockUpdateUserProfile,
  verifyIdentity: mockVerifyIdentity
}
