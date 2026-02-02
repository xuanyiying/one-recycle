import { apiClient } from './apiClient';

export interface Staff {
  id: string;
  username: string;
  realName?: string;
  mobile?: string;
  email?: string;
  avatarUrl?: string;
  tenantId: string;
  role: {
    id: number;
    name: string;
    code: string;
    isAdmin: boolean;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResponse {
  items: Staff[];
  total: number;
}

export interface CreateStaffRequest {
  username: string;
  password?: string;
  tenantId: string;
  roleCode: string;
  realName?: string;
  mobile?: string;
  email?: string;
  status?: string;
}

export class StaffService {
  private readonly baseUrl = '/tenant/staffs';

  async getStaffs(params?: any): Promise<StaffListResponse> {
    return apiClient.get(this.baseUrl, params);
  }

  async createStaff(data: CreateStaffRequest): Promise<Staff> {
    return apiClient.post(this.baseUrl, data);
  }

  async updateStaff(id: string, data: any): Promise<Staff> {
    return apiClient.put(`${this.baseUrl}/${id}`, data);
  }

  async deleteStaff(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const staffService = new StaffService();
