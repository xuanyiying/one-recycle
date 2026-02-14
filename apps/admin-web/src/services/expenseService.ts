import { apiClient, PaginatedResponse } from './apiClient';

export enum ExpenseType {
  PAYOUT = 'PAYOUT',
  EXPRESS = 'EXPRESS',
  REFUND = 'REFUND',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface PlatformTransaction {
  id: string;
  walletId: number;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedOrderNo?: string;
  description?: string;
  createdAt: string;
}

export interface SettlementRecord {
  id: string;
  tenantId: string;
  orderId: string;
  totalAmount: number;
  goodsAmount: number;
  expressFee: number;
  platformFee: number;
  subsidyAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  type: 'recycle_payment' | 'express_fee';
  amount: number;
  orderId?: string;
  orderNo?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  categoryName?: string;
  quantity?: number;
  unitPrice?: number;
  expressCompany?: string;
  expressNo?: string;
  status: ExpenseStatus;
  paymentMethod?: string;
  paymentDate?: string;
  description?: string;
  createdAt: string;
}

export interface ExpenseStats {
  totalExpense: number;
  recyclePaymentTotal: number;
  expressFeeTotal: number;
  todayExpense: number;
  monthExpense: number;
  pendingCount: number;
  completedCount: number;
  trendData: Array<{
    date: string;
    recyclePayment: number;
    expressFee: number;
  }>;
  categoryBreakdown: Array<{
    categoryName: string;
    amount: number;
    count: number;
  }>;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  type?: 'recycle_payment' | 'express_fee';
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  orderNo?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

export interface ExpenseListResponse {
  items: ExpenseRecord[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

class ExpenseService {
  private readonly baseUrl = '/finance/expenses';

  async getExpenses(params?: ExpenseQueryParams): Promise<ExpenseListResponse> {
    const response = await apiClient.get<{ items: ExpenseRecord[]; total: number; page?: number; limit?: number; totalPages?: number }>(this.baseUrl, params);
    return {
      items: response.items || [],
      total: response.total || 0,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
    };
  }

  async getExpenseById(id: string): Promise<ExpenseRecord> {
    return apiClient.get<ExpenseRecord>(`${this.baseUrl}/${id}`);
  }

  async getExpenseStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseStats> {
    return apiClient.get<ExpenseStats>(`${this.baseUrl}/stats`, params);
  }

  async getPlatformTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<PlatformTransaction>> {
    return apiClient.get<PaginatedResponse<PlatformTransaction>>(
      '/finance/transactions',
      params
    );
  }

  async getSettlementRecords(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<SettlementRecord>> {
    return apiClient.get<PaginatedResponse<SettlementRecord>>(
      '/finance/settlements',
      params
    );
  }

  async exportExpenses(params?: ExpenseQueryParams): Promise<Blob> {
    const response = await apiClient.getInstance().get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async getExpenseTrend(days: number = 30): Promise<
    Array<{
      date: string;
      recyclePayment: number;
      expressFee: number;
      total: number;
    }>
  > {
    return apiClient.get(`${this.baseUrl}/trend`, { days });
  }

  async getCategoryExpenseBreakdown(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      totalAmount: number;
      totalCount: number;
    }>
  > {
    return apiClient.get(`${this.baseUrl}/category-breakdown`, params);
  }
}

export const expenseService = new ExpenseService();
