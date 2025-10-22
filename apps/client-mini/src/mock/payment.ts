// 支付相关Mock数据
import { createMockResponse, MockResponse } from './index'

export interface PaymentMethod {
  id: string
  type: 'wechat' | 'alipay' | 'bankcard'
  name: string
  icon: string
  isDefault?: boolean
}

export interface PaymentStatus {
  orderId: string
  status: 'pending' | 'success' | 'failed'
  amount: number
  method: 'wechat' | 'alipay' | 'bankcard'
  timestamp: string
  errorCode?: string
  errorMessage?: string
}

export interface PaymentRecord {
  id: string
  orderId: string
  amount: number
  method: 'wechat' | 'alipay' | 'bankcard'
  status: 'success' | 'failed'
  timestamp: string
}

export interface RefundRecord {
  id: string
  orderId: string
  amount: number
  status: 'pending' | 'success' | 'failed'
  timestamp: string
}

export interface BankCard {
  id: string
  bankName: string
  cardNumber: string
  holderName: string
  expiryDate: string
  isDefault?: boolean
}

// Mock支付方式
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'wechat-pay',
    type: 'wechat',
    name: '微信支付',
    icon: 'https://via.placeholder.com/48x48?text=微信',
    isDefault: true
  },
  {
    id: 'alipay',
    type: 'alipay',
    name: '支付宝',
    icon: 'https://via.placeholder.com/48x48?text=支付宝'
  },
  {
    id: 'bankcard',
    type: 'bankcard',
    name: '银行卡',
    icon: 'https://via.placeholder.com/48x48?text=银行卡'
  }
]

// Mock支付状态
export const mockPaymentStatus: PaymentStatus[] = [
  {
    orderId: 'ORDER_001',
    status: 'success',
    amount: 128.00,
    method: 'wechat',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    orderId: 'ORDER_002',
    status: 'failed',
    amount: 256.50,
    method: 'alipay',
    timestamp: '2024-01-15T11:00:00Z',
    errorCode: 'PAYMENT_TIMEOUT',
    errorMessage: '支付超时，请重试'
  },
  {
    orderId: 'ORDER_003',
    status: 'pending',
    amount: 88.00,
    method: 'bankcard',
    timestamp: '2024-01-15T11:45:00Z'
  }
]

// Mock支付记录
export const mockPaymentRecords: PaymentRecord[] = [
  {
    id: 'PAY_001',
    orderId: 'ORDER_001',
    amount: 128.00,
    method: 'wechat',
    status: 'success',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: 'PAY_002',
    orderId: 'ORDER_002',
    amount: 256.50,
    method: 'alipay',
    status: 'failed',
    timestamp: '2024-01-15T11:00:00Z'
  },
  {
    id: 'PAY_003',
    orderId: 'ORDER_003',
    amount: 88.00,
    method: 'bankcard',
    status: 'success',
    timestamp: '2024-01-15T11:45:00Z'
  }
]

// Mock退款记录
export const mockRefundRecords: RefundRecord[] = [
  {
    id: 'REFUND_001',
    orderId: 'ORDER_002',
    amount: 256.50,
    status: 'success',
    timestamp: '2024-01-15T12:00:00Z'
  },
  {
    id: 'REFUND_002',
    orderId: 'ORDER_004',
    amount: 100.00,
    status: 'pending',
    timestamp: '2024-01-16T09:20:00Z'
  }
]

// 创建支付订单
export const mockCreatePaymentOrder = async (
  orderId: string,
  amount: number,
  method: 'wechat' | 'alipay' | 'bankcard'
): Promise<MockResponse<PaymentStatus>> => {
  const status: PaymentStatus = {
    orderId,
    status: 'pending',
    amount,
    method,
    timestamp: new Date().toISOString()
  }

  return createMockResponse(status, true, '创建支付订单成功')
}

// 查询支付状态
export const mockGetPaymentStatus = async (orderId: string): Promise<MockResponse<PaymentStatus | null>> => {
  const status = mockPaymentStatus.find(s => s.orderId === orderId) || null
  return createMockResponse(status, true, status ? '获取支付状态成功' : '订单不存在')
}

// 获取支付记录列表
export const mockGetPaymentRecords = async (): Promise<MockResponse<PaymentRecord[]>> => {
  return createMockResponse(mockPaymentRecords, true, '获取支付记录列表成功')
}

// 申请退款
export const mockRequestRefund = async (
  orderId: string,
  amount: number
): Promise<MockResponse<RefundRecord>> => {
  const refund: RefundRecord = {
    id: `REFUND_${Math.floor(Math.random() * 1000)}`,
    orderId,
    amount,
    status: 'pending',
    timestamp: new Date().toISOString()
  }

  mockRefundRecords.push(refund)
  return createMockResponse(refund, true, '申请退款成功')
}

// 查询退款状态
export const mockGetRefundStatus = async (refundId: string): Promise<MockResponse<RefundRecord | null>> => {
  const refund = mockRefundRecords.find(r => r.id === refundId) || null
  return createMockResponse(refund, true, refund ? '获取退款状态成功' : '退款记录不存在')
}

// 获取用户银行卡列表
export const mockGetUserBankCards = async (userId: string): Promise<MockResponse<BankCard[]>> => {
  console.log('获取用户银行卡列表', userId)
  const cards: BankCard[] = [
    {
      id: 'CARD_001',
      bankName: '中国银行',
      cardNumber: '6222 **** **** 1234',
      holderName: '张三',
      expiryDate: '12/26',
      isDefault: true
    },
    {
      id: 'CARD_002',
      bankName: '工商银行',
      cardNumber: '6214 **** **** 5678',
      holderName: '李四',
      expiryDate: '08/25'
    }
  ]

  return createMockResponse(cards, true, '获取银行卡列表成功')
}

// 添加银行卡
export const mockAddBankCard = async (card: Omit<BankCard, 'id'>): Promise<MockResponse<BankCard>> => {
  const newCard: BankCard = {
    ...card,
    id: `CARD_${Math.floor(Math.random() * 1000)}`
  }

  return createMockResponse(newCard, true, '添加银行卡成功')
}

// 删除银行卡
export const mockDeleteBankCard = async (cardId: string): Promise<MockResponse<boolean>> => {
  const exists = ['CARD_001', 'CARD_002'].includes(cardId)
  return createMockResponse(exists, exists, exists ? '删除银行卡成功' : '银行卡不存在')
}

// 微信支付
export const mockWechatPay = async (paymentData: any): Promise<MockResponse<PaymentStatus>> => {
  void paymentData
  const status: PaymentStatus = {
    orderId: `ORDER_${Math.floor(Math.random() * 1000)}`,
    status: 'success',
    amount: 99.99,
    method: 'wechat',
    timestamp: new Date().toISOString()
  }

  return createMockResponse(status, true, '微信支付成功')
}

// 支付宝支付
export const mockAlipayPay = async (paymentData: any): Promise<MockResponse<PaymentStatus>> => {
  void paymentData
  const status: PaymentStatus = {
    orderId: paymentData?.orderId || `ORDER_${Math.floor(Math.random() * 1000)}`,
    status: 'success',
    amount: typeof paymentData?.amount === 'number' ? paymentData.amount : 99.99,
    method: 'alipay',
    timestamp: new Date().toISOString()
  }
  return createMockResponse(status, true, '支付宝支付成功')
}

// 导出所有支付相关mock函数
export const paymentMockData = {
  methods: mockPaymentMethods,
  status: mockPaymentStatus,
  records: mockPaymentRecords,
  refunds: mockRefundRecords,
  createOrder: mockCreatePaymentOrder,
  getStatus: mockGetPaymentStatus,
  getRecords: mockGetPaymentRecords,
  requestRefund: mockRequestRefund,
  getRefundStatus: mockGetRefundStatus,
  getBankCards: mockGetUserBankCards,
  addBankCard: mockAddBankCard,
  deleteBankCard: mockDeleteBankCard,
  wechatPay: mockWechatPay,
  alipayPay: mockAlipayPay
}