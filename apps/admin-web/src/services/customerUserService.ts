import { apiClient } from './apiClient';

export interface CustomerUser {
  id: string;
  mobile: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  status: string;
  points: number;
  createdAt: string;
  orderCount: number;
  totalOrderAmount: number;
}

export interface CustomerUserDetail {
  id: string;
  mobile: string | null;
  nickname: string | null;
  realName: string | null;
  avatarUrl: string | null;
  gender: string | null;
  birthday: string | null;
  status: string;
  points: number;
  balance: number;
  createdAt: string;
  lastLogin: string | null;
  orderStats: {
    totalOrders: number;
    completedOrders: number;
    totalAmount: number;
  };
  inviteStats: {
    invitedCount: number;
    totalRewardPoints: number;
    totalOrderRewards: number;
  } | null;
  inviterInfo: {
    id: string;
    nickname: string | null;
    mobile: string | null;
  } | null;
}

export interface CustomerUserQuery {
  page?: number;
  limit?: number;
  mobile?: string;
  nickname?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CustomerUserListResponse {
  items: CustomerUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PointsRecord {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  sourceType: string | null;
  sourceId: string | null;
  description: string;
  createdAt: string;
}

export interface PointsRecordResponse {
  items: PointsRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerOrder {
  id: string;
  orderNo: string;
  status: string;
  settlementAmount: number;
  itemCount: number;
  createdAt: string;
  completedAt: string | null;
}

export interface CustomerOrderResponse {
  items: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class CustomerUserService {
  private readonly baseUrl = '/admin/customers';

  async getCustomers(params?: CustomerUserQuery): Promise<CustomerUserListResponse> {
    const response = await apiClient.get(this.baseUrl, params);
    return response;
  }

  async getCustomerById(id: string): Promise<CustomerUserDetail> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async getPointsRecords(
    id: string,
    params?: { page?: number; limit?: number; startDate?: string; endDate?: string }
  ): Promise<PointsRecordResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/points-records`, params);
    return response;
  }

  async getOrders(
    id: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<CustomerOrderResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/orders`, params);
    return response;
  }
}

export const customerUserService = new CustomerUserService();
