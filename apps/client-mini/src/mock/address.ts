// 地址相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'

// 地址接口定义
export interface Address {
  id: string | number
  userId: string
  name: string
  mobile: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// Mock地址数据
const mockAddresses: Address[] = [
  {
    id: '1',
    userId: '1',
    name: '张三',
    mobile: '138****8888',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '某某小区1号楼101室',
    isDefault: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    userId: '1',
    name: '李四',
    mobile: '137****7777',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '某某路123号',
    isDefault: false,
    createdAt: '2024-01-05T15:30:00Z',
    updatedAt: '2024-01-05T15:30:00Z'
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
    id: MockDataGenerator.generateId(),
    userId: addressData.userId || '1',
    name: addressData.name || '',
    mobile: addressData.mobile || '',
    province: addressData.province || '',
    city: addressData.city || '',
    district: addressData.district || '',
    detail: addressData.detail || '',
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
export const mockUpdateAddress = async (addressId: string | number, addressData: Partial<Address>): Promise<MockResponse<Address | null>> => {
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
export const mockDeleteAddress = async (addressId: string | number): Promise<MockResponse<boolean>> => {
  const addressIndex = mockAddresses.findIndex(addr => addr.id === addressId)
  
  if (addressIndex === -1) {
    return createMockResponse(false, false, '地址不存在')
  }

  mockAddresses.splice(addressIndex, 1)
  return createMockResponse(true, true, '地址删除成功')
}

// Mock获取地区列表
export const mockGetRegions = async (parentCode: string): Promise<MockResponse<any[]>> => {
  // 返回一些模拟的地区数据
  const regions = [
    { code: `${parentCode}01`, name: '模拟地区1', pinyin: 'monidiqu1', abbr: 'M1' },
    { code: `${parentCode}02`, name: '模拟地区2', pinyin: 'monidiqu2', abbr: 'M2' }
  ]
  return createMockResponse(regions, true, '获取地区列表成功')
}

export const addressMockData = {
  getUserAddresses: mockGetUserAddresses,
  addAddress: mockAddAddress,
  updateAddress: mockUpdateAddress,
  deleteAddress: mockDeleteAddress,
  getRegions: mockGetRegions
}
