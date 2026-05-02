import { apiClient } from './apiClient';
import {
  User,
  UserStatus,
  UserRole,
  UserStats,
  UserQueryParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserActivityListResponse,
  UserActivityQueryParams,
  PasswordResetRequest,
  PasswordUpdateRequest,
} from '@/types/user';

export { UserStatus, UserRole };
export type {
  User,
  UserStats,
  UserQueryParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserActivityListResponse,
  UserActivityQueryParams,
  PasswordResetRequest,
  PasswordUpdateRequest,
};

// 用户服务类
export class UserService {
  private readonly baseUrl = '/users';

  // 获取用户列表
  async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    return await apiClient.get(this.baseUrl, params);
  }

  // 获取用户详情
  async getUserById(id: string): Promise<User> {
    return await apiClient.get(`${this.baseUrl}/${id}`);
  }

  // 创建用户
  async createUser(data: CreateUserRequest): Promise<User> {
    return await apiClient.post(this.baseUrl, data);
  }

  // 更新用户
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return await apiClient.put(`${this.baseUrl}/${id}`, data);
  }

  // 删除用户
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  // 批量删除用户
  async batchDeleteUsers(ids: string[]): Promise<void> {
    await apiClient.post(`${this.baseUrl}/batch-delete`, { ids });
  }

  // 更新用户状态
  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const response = await apiClient.put(`${this.baseUrl}/${id}/status`, { status });
    return response;
  }

  // 重置用户密码
  async resetPassword(data: PasswordResetRequest): Promise<void> {
    await apiClient.post(`${this.baseUrl}/reset-password`, data);
  }

  // 更新用户密码
  async updatePassword(id: string, data: PasswordUpdateRequest): Promise<void> {
    await apiClient.put(`${this.baseUrl}/${id}/password`, data);
  }

  // 获取用户统计信息
  async getUserStats(): Promise<UserStats> {
    return await apiClient.get(`${this.baseUrl}/stats`);
  }

  // 获取用户活动日志
  async getUserActivities(params?: UserActivityQueryParams): Promise<UserActivityListResponse> {
    return await apiClient.get(`${this.baseUrl}/activities`, params);
  }

  // 导出用户数据
  async exportUsers(params?: UserQueryParams): Promise<Blob> {
    return await apiClient.get(`${this.baseUrl}/export`, params, {
      responseType: 'blob',
    });
  }

  // 发送邮件验证
  async sendEmailVerification(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/send-email-verification`);
  }

  // 发送短信验证
  async sendSmsVerification(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${id}/send-sms-verification`);
  }

  // 验证邮箱
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/verify-email`, { token });
  }

  // 验证手机号
  async verifyPhone(token: string, code: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/verify-phone`, { token, code });
  }

  // 获取最近注册的用户
  async getRecentUsers(limit: number = 10): Promise<User[]> {
    return await apiClient.get(`${this.baseUrl}/recent`, { limit });
  }
}

// 导出用户服务实例
export const userService = new UserService();
