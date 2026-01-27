// 账户相关Mock数据
import { createMockResponse, MockDataGenerator, MockResponse } from './index'
import { Account, AccountStats } from '../types/account'

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

// Mock钱包数据
const mockWallet: Wallet = {
  id: '1',
  userId: '1',
  balance: 156.78,
  frozenAmount: 0,
  totalEarnings: 1234.56,
  totalWithdrawals: 1077.78,
  updatedAt: '2024-01-22T16:45:00Z'
}

// Mock交易记录数据
const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    type: 'income',
    amount: 11.49,
    description: '订单收益 - 废纸类回收',
    orderId: '1',
    status: 'completed',
    createdAt: '2024-01-15T16:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'withdrawal',
    amount: 100.00,
    description: '提现到微信钱包',
    status: 'completed',
    createdAt: '2024-01-10T09:15:00Z'
  },
  {
    id: '3',
    userId: '1',
    type: 'income',
    amount: 22.5,
    description: '订单收益 - 金属类回收',
    orderId: '2',
    status: 'pending',
    createdAt: '2024-01-18T14:20:00Z'
  }
]

// Mock获取钱包信息
export const mockGetWallet = async (userId: string): Promise<MockResponse<Wallet>> => {
  void userId
  return createMockResponse(mockWallet, true, '获取钱包信息成功')
}

// Mock获取我的账户信息 (适配 Account Service)
export const mockGetMyAccount = async (userId: string = '1'): Promise<MockResponse<Account>> => {
  const account: Account = {
    id: mockWallet.id,
    userId: userId,
    availableBalance: mockWallet.balance,
    frozenBalance: mockWallet.frozenAmount,
    totalIncome: mockWallet.totalEarnings,
    totalWithdrawal: mockWallet.totalWithdrawals,
    version: 1,
    createdAt: mockWallet.updatedAt, // 暂用 updatedAt
    updatedAt: mockWallet.updatedAt
  }
  return createMockResponse(account, true, '获取账户信息成功')
}

// Mock获取我的账户统计 (适配 Account Service)
export const mockGetMyStats = async (userId: string = '1'): Promise<MockResponse<AccountStats>> => {
  void userId
  const stats: AccountStats = {
    totalIncome: mockWallet.totalEarnings,
    totalWithdrawal: mockWallet.totalWithdrawals,
    totalOrders: 15, // Mock data
    successfulWithdrawals: 5, // Mock data
    availableBalance: mockWallet.balance,
    frozenBalance: mockWallet.frozenAmount
  }
  return createMockResponse(stats, true, '获取账户统计成功')
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

// 导出所有账户相关mock函数
export const accountMockData = {
  getWallet: mockGetWallet,
  getMyAccount: mockGetMyAccount,
  getMyStats: mockGetMyStats,
  getTransactions: mockGetTransactions,
  requestWithdrawal: mockRequestWithdrawal
}
