// 通知相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'

// 通知类型枚举
export enum NotificationType {
  ORDER = 'order',
  PAYMENT = 'payment',
  SYSTEM = 'system',
  PROMOTION = 'promotion'
}

// 通知状态枚举
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  DELETED = 'deleted'
}

// 通知接口定义
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  content: string
  status: NotificationStatus
  relatedId?: string // 关联的订单ID、支付ID等
  imageUrl?: string
  actionUrl?: string
  createdAt: string
  readAt?: string
}

// 通知设置接口定义
export interface NotificationSettings {
  userId: string
  orderNotifications: boolean
  paymentNotifications: boolean
  systemNotifications: boolean
  promotionNotifications: boolean
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  updatedAt: string
}

// Mock通知数据
const mockNotifications: Notification[] = [
  {
    id: 'notif_001',
    userId: 'user_001',
    type: NotificationType.ORDER,
    title: '订单状态更新',
    content: '您的订单 #order_001 已完成回收，收益已到账',
    status: NotificationStatus.UNREAD,
    relatedId: 'order_001',
    createdAt: '2024-01-15T16:30:00Z'
  },
  {
    id: 'notif_002',
    userId: 'user_001',
    type: NotificationType.PAYMENT,
    title: '支付成功',
    content: '您的提现申请已处理，100元已转入您的微信钱包',
    status: NotificationStatus.READ,
    relatedId: 'payment_002',
    readAt: '2024-01-10T10:15:00Z',
    createdAt: '2024-01-10T09:30:00Z'
  },
  {
    id: 'notif_003',
    userId: 'user_001',
    type: NotificationType.SYSTEM,
    title: '系统维护通知',
    content: '系统将于今晚23:00-01:00进行维护升级，期间可能影响部分功能使用',
    status: NotificationStatus.READ,
    imageUrl: 'https://example.com/system-maintenance.jpg',
    readAt: '2024-01-08T14:20:00Z',
    createdAt: '2024-01-08T12:00:00Z'
  },
  {
    id: 'notif_004',
    userId: 'user_001',
    type: NotificationType.PROMOTION,
    title: '新用户福利',
    content: '恭喜您成为我们的新用户！首次回收可享受价格上浮10%的优惠',
    status: NotificationStatus.UNREAD,
    actionUrl: '/pages/promotion/newuser',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'notif_005',
    userId: 'user_001',
    type: NotificationType.ORDER,
    title: '回收员已接单',
    content: '回收员李师傅已接受您的订单，预计明天下午2点上门回收',
    status: NotificationStatus.UNREAD,
    relatedId: 'order_002',
    createdAt: '2024-01-18T15:45:00Z'
  }
]

// Mock通知设置数据
const mockNotificationSettings: NotificationSettings = {
  userId: 'user_001',
  orderNotifications: true,
  paymentNotifications: true,
  systemNotifications: true,
  promotionNotifications: false,
  pushEnabled: true,
  emailEnabled: false,
  smsEnabled: true,
  updatedAt: '2024-01-01T10:00:00Z'
}

// Mock获取通知列表
export const mockGetNotifications = async (
  userId: string,
  type?: NotificationType,
  status?: NotificationStatus,
  page: number = 1,
  limit: number = 20
): Promise<MockResponse<Notification[]>> => {
  let userNotifications = mockNotifications.filter(notif => notif.userId === userId)
  
  // 按类型过滤
  if (type) {
    userNotifications = userNotifications.filter(notif => notif.type === type)
  }
  
  // 按状态过滤
  if (status) {
    userNotifications = userNotifications.filter(notif => notif.status === status)
  }
  
  // 按创建时间倒序排列
  userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  // 分页
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedNotifications = userNotifications.slice(startIndex, endIndex)
  
  return createMockResponse(paginatedNotifications, true, '获取通知列表成功')
}

// Mock获取未读通知数量
export const mockGetUnreadCount = async (userId: string): Promise<MockResponse<number>> => {
  const unreadCount = mockNotifications.filter(
    notif => notif.userId === userId && notif.status === NotificationStatus.UNREAD
  ).length
  
  return createMockResponse(unreadCount, true, '获取未读通知数量成功')
}

// Mock标记通知为已读
export const mockMarkAsRead = async (notificationId: string): Promise<MockResponse<boolean>> => {
  const notificationIndex = mockNotifications.findIndex(notif => notif.id === notificationId)
  
  if (notificationIndex === -1) {
    return createMockResponse(false, false, '通知不存在')
  }
  
  mockNotifications[notificationIndex].status = NotificationStatus.READ
  mockNotifications[notificationIndex].readAt = MockDataGenerator.generateTimestamp()
  
  return createMockResponse(true, true, '通知已标记为已读')
}

// Mock批量标记为已读
export const mockMarkAllAsRead = async (userId: string): Promise<MockResponse<boolean>> => {
  const currentTime = MockDataGenerator.generateTimestamp()
  
  mockNotifications.forEach(notif => {
    if (notif.userId === userId && notif.status === NotificationStatus.UNREAD) {
      notif.status = NotificationStatus.READ
      notif.readAt = currentTime
    }
  })
  
  return createMockResponse(true, true, '所有通知已标记为已读')
}

// Mock删除通知
export const mockDeleteNotification = async (notificationId: string): Promise<MockResponse<boolean>> => {
  const notificationIndex = mockNotifications.findIndex(notif => notif.id === notificationId)
  
  if (notificationIndex === -1) {
    return createMockResponse(false, false, '通知不存在')
  }
  
  mockNotifications[notificationIndex].status = NotificationStatus.DELETED
  
  return createMockResponse(true, true, '通知删除成功')
}

// Mock清空所有通知
export const mockClearAllNotifications = async (userId: string): Promise<MockResponse<boolean>> => {
  mockNotifications.forEach(notif => {
    if (notif.userId === userId) {
      notif.status = NotificationStatus.DELETED
    }
  })
  
  return createMockResponse(true, true, '所有通知已清空')
}

// Mock获取通知设置
export const mockGetNotificationSettings = async (userId: string): Promise<MockResponse<NotificationSettings>> => {
  void userId
  return createMockResponse(mockNotificationSettings, true, '获取通知设置成功')
}

// Mock更新通知设置
export const mockUpdateNotificationSettings = async (
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<MockResponse<NotificationSettings>> => {
  const updatedSettings = {
    ...mockNotificationSettings,
    ...settings,
    userId,
    updatedAt: MockDataGenerator.generateTimestamp()
  }
  
  Object.assign(mockNotificationSettings, updatedSettings)
  return createMockResponse(updatedSettings, true, '通知设置更新成功')
}

// Mock发送通知
export const mockSendNotification = async (notificationData: {
  userId: string
  type: NotificationType
  title: string
  content: string
  relatedId?: string
  imageUrl?: string
  actionUrl?: string
}): Promise<MockResponse<Notification>> => {
  const newNotification: Notification = {
    id: `notif_${MockDataGenerator.generateId()}`,
    userId: notificationData.userId,
    type: notificationData.type,
    title: notificationData.title,
    content: notificationData.content,
    status: NotificationStatus.UNREAD,
    relatedId: notificationData.relatedId,
    imageUrl: notificationData.imageUrl,
    actionUrl: notificationData.actionUrl,
    createdAt: MockDataGenerator.generateTimestamp()
  }
  
  mockNotifications.push(newNotification)
  return createMockResponse(newNotification, true, '通知发送成功')
}

// Mock获取通知详情
export const mockGetNotificationDetail = async (notificationId: string): Promise<MockResponse<Notification | null>> => {
  const notification = mockNotifications.find(notif => notif.id === notificationId)
  
  if (!notification) {
    return createMockResponse(null, false, '通知不存在')
  }
  
  // 自动标记为已读
  if (notification.status === NotificationStatus.UNREAD) {
    notification.status = NotificationStatus.READ
    notification.readAt = MockDataGenerator.generateTimestamp()
  }
  
  return createMockResponse(notification, true, '获取通知详情成功')
}

// 导出所有通知相关mock函数
export const notificationMockData = {
  getNotifications: mockGetNotifications,
  getUnreadCount: mockGetUnreadCount,
  markAsRead: mockMarkAsRead,
  markAllAsRead: mockMarkAllAsRead,
  deleteNotification: mockDeleteNotification,
  clearAllNotifications: mockClearAllNotifications,
  getNotificationSettings: mockGetNotificationSettings,
  updateNotificationSettings: mockUpdateNotificationSettings,
  sendNotification: mockSendNotification,
  getNotificationDetail: mockGetNotificationDetail
}