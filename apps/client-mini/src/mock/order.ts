// 订单相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'

// 订单状态枚举
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 订单接口定义
export interface Order {
  id: string
  userId: string
  status: OrderStatus
  items: OrderItem[]
  totalWeight: number
  totalAmount: number
  address: {
    id: string
    name: string
    phone: string
    address: string
    isDefault: boolean
  }
  pickupTime: string
  courierInfo?: {
    id: string
    name: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  categoryId: number
  categoryName: string
  weight: number
  unitPrice: number
  amount: number
}

export interface UserStatistics {
  totalOrders: number
  completedOrders: number
  totalWeight: number
  totalEarnings: number
  carbonReduction: number
}

// Mock订单数据
const mockOrders: Order[] = [
  {
    id: 'order_001',
    userId: 'user_001',
    status: OrderStatus.COMPLETED,
    items: [
      {
        categoryId: 1,
        categoryName: '废纸类',
        weight: 5.2,
        unitPrice: 1.2,
        amount: 6.24
      },
      {
        categoryId: 2,
        categoryName: '塑料类',
        weight: 2.1,
        unitPrice: 2.5,
        amount: 5.25
      }
    ],
    totalWeight: 7.3,
    totalAmount: 11.49,
    address: {
      id: 'addr_001',
      name: '张三',
      phone: '138****8888',
      address: '北京市朝阳区某某小区1号楼101室',
      isDefault: true
    },
    pickupTime: '2024-01-15T14:00:00Z',
    courierInfo: {
      id: 'courier_001',
      name: '李师傅',
      phone: '139****9999'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T16:30:00Z'
  },
  {
    id: 'order_002',
    userId: 'user_001',
    status: OrderStatus.CONFIRMED,
    items: [
      {
        categoryId: 3,
        categoryName: '金属类',
        weight: 1.5,
        unitPrice: 15.0,
        amount: 22.5
      }
    ],
    totalWeight: 1.5,
    totalAmount: 22.5,
    address: {
      id: 'addr_001',
      name: '张三',
      phone: '138****8888',
      address: '北京市朝阳区某某小区1号楼101室',
      isDefault: true
    },
    pickupTime: '2024-01-20T10:00:00Z',
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  },
  {
    id: 'order_003',
    userId: 'user_001',
    status: OrderStatus.PENDING,
    items: [
      {
        categoryId: 4,
        categoryName: '电子产品',
        weight: 1,
        unitPrice: 50.0,
        amount: 50.0
      }
    ],
    totalWeight: 1,
    totalAmount: 50.0,
    address: {
      id: 'addr_002',
      name: '李四',
      phone: '137****7777',
      address: '上海市浦东新区某某路123号',
      isDefault: false
    },
    pickupTime: '2024-01-25T15:30:00Z',
    createdAt: '2024-01-22T11:20:00Z',
    updatedAt: '2024-01-22T11:20:00Z'
  }
]

// Mock创建订单
export const mockCreateOrder = async (orderData: any): Promise<MockResponse<Order>> => {
  const newOrder: Order = {
    id: `order_${MockDataGenerator.generateId()}`,
    userId: orderData.userId || 'user_001',
    status: OrderStatus.PENDING,
    items: orderData.items || [],
    totalWeight: orderData.totalWeight || 0,
    totalAmount: orderData.totalAmount || 0,
    address: orderData.address,
    pickupTime: orderData.pickupTime,
    createdAt: MockDataGenerator.generateTimestamp(),
    updatedAt: MockDataGenerator.generateTimestamp()
  }

  mockOrders.push(newOrder)
  return createMockResponse(newOrder, true, '订单创建成功')
}

// Mock获取用户订单列表
export const mockGetUserOrders = async (userId: string): Promise<MockResponse<Order[]>> => {
  const userOrders = mockOrders.filter(order => order.userId === userId)
  return createMockResponse(userOrders, true, '获取订单列表成功')
}

// Mock获取订单详情
export const mockGetOrderDetail = async (orderId: string): Promise<MockResponse<Order | null>> => {
  const order = mockOrders.find(order => order.id === orderId)
  
  if (!order) {
    return createMockResponse(null, false, '订单不存在')
  }
  
  return createMockResponse(order, true, '获取订单详情成功')
}

// Mock取消订单
export const mockCancelOrder = async (orderId: string): Promise<MockResponse<boolean>> => {
  const orderIndex = mockOrders.findIndex(order => order.id === orderId)
  
  if (orderIndex === -1) {
    return createMockResponse(false, false, '订单不存在')
  }
  
  if (mockOrders[orderIndex].status !== OrderStatus.PENDING) {
    return createMockResponse(false, false, '订单状态不允许取消')
  }
  
  mockOrders[orderIndex].status = OrderStatus.CANCELLED
  mockOrders[orderIndex].updatedAt = MockDataGenerator.generateTimestamp()
  
  return createMockResponse(true, true, '订单取消成功')
}

// Mock更新订单状态
export const mockUpdateOrderStatus = async (orderId: string, status: string): Promise<MockResponse<boolean>> => {
  const orderIndex = mockOrders.findIndex(order => order.id === orderId)
  
  if (orderIndex === -1) {
    return createMockResponse(false, false, '订单不存在')
  }
  
  mockOrders[orderIndex].status = status as OrderStatus
  mockOrders[orderIndex].updatedAt = MockDataGenerator.generateTimestamp()
  
  return createMockResponse(true, true, '订单状态更新成功')
}

// Mock创建快递订单
export const mockCreateExpressOrder = async (orderData: any): Promise<MockResponse<any>> => {
  const expressOrder = {
    id: `express_order_${MockDataGenerator.generateId()}`,
    expressNumber: `EXP${Date.now()}`,
    ...orderData,
    status: 'created',
    createdAt: MockDataGenerator.generateTimestamp()
  }
  
  return createMockResponse(expressOrder, true, '快递订单创建成功')
}

// Mock获取用户统计信息
export const mockGetUserStatistics = async (userId: string): Promise<MockResponse<UserStatistics>> => {
  const userOrders = mockOrders.filter(order => order.userId === userId)
  const completedOrders = userOrders.filter(order => order.status === OrderStatus.COMPLETED)
  
  const statistics: UserStatistics = {
    totalOrders: userOrders.length,
    completedOrders: completedOrders.length,
    totalWeight: completedOrders.reduce((sum, order) => sum + order.totalWeight, 0),
    totalEarnings: completedOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    carbonReduction: completedOrders.reduce((sum, order) => sum + order.totalWeight * 2.1, 0) // 假设每公斤减少2.1kg碳排放
  }
  
  return createMockResponse(statistics, true, '获取用户统计信息成功')
}

// Mock确认订单
export const mockConfirmOrder = async (orderId: string): Promise<MockResponse<boolean>> => {
  const orderIndex = mockOrders.findIndex(order => order.id === orderId)
  
  if (orderIndex === -1) {
    return createMockResponse(false, false, '订单不存在')
  }
  
  if (mockOrders[orderIndex].status !== OrderStatus.PENDING) {
    return createMockResponse(false, false, '订单状态不允许确认')
  }
  
  mockOrders[orderIndex].status = OrderStatus.CONFIRMED
  mockOrders[orderIndex].updatedAt = MockDataGenerator.generateTimestamp()
  
  return createMockResponse(true, true, '订单确认成功')
}

// 导出所有订单相关mock函数
export const orderMockData = {
  createOrder: mockCreateOrder,
  getUserOrders: mockGetUserOrders,
  getOrderDetail: mockGetOrderDetail,
  cancelOrder: mockCancelOrder,
  updateOrderStatus: mockUpdateOrderStatus,
  createExpressOrder: mockCreateExpressOrder,
  getUserStatistics: mockGetUserStatistics,
  confirmOrder: mockConfirmOrder
}