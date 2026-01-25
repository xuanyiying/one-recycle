import { userApiClient } from './apiClient';
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
  // 获取用户列表
  async getUsers(params?: UserQueryParams): Promise<UserListResponse> {
    const response = await userApiClient.get('/users', { params });
    return response;
  }

  // 获取用户详情
  async getUserById(id: string): Promise<User> {
    const response = await userApiClient.get(`/users/${id}`);
    return response;
  }

  // 创建用户
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await userApiClient.post('/users', data);
    return response;
  }

  // 更新用户
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await userApiClient.put(`/users/${id}`, data);
    return response;
  }

  // 删除用户
  async deleteUser(id: string): Promise<void> {
    await userApiClient.delete(`/users/${id}`);
  }

  // 批量删除用户
  async batchDeleteUsers(ids: string[]): Promise<void> {
    await userApiClient.post('/users/batch-delete', { ids });
  }

  // 更新用户状态
  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    const response = await userApiClient.patch(`/users/${id}/status`, { status });
    return response;
  }

  // 重置用户密码
  async resetPassword(data: PasswordResetRequest): Promise<void> {
    await userApiClient.post('/users/reset-password', data);
  }

  // 更新用户密码
  async updatePassword(id: string, data: PasswordUpdateRequest): Promise<void> {
    await userApiClient.patch(`/users/${id}/password`, data);
  }

  // 获取用户统计信息
  async getUserStats(): Promise<UserStats> {
    const response = await userApiClient.get('/users/stats');
    return response;
  }

  // 获取用户活动日志
  async getUserActivities(params?: UserActivityQueryParams): Promise<UserActivityListResponse> {
    const response = await userApiClient.get('/users/activities', { params });
    return response;
  }

  // 导出用户数据
  async exportUsers(params?: UserQueryParams): Promise<Blob> {
    const response = await userApiClient.get('/users/export', {
      params,
      responseType: 'blob',
    });
    return response;
  }

  // 发送邮件验证
  async sendEmailVerification(id: string): Promise<void> {
    await userApiClient.post(`/users/${id}/send-email-verification`);
  }

  // 发送短信验证
  async sendSmsVerification(id: string): Promise<void> {
    await userApiClient.post(`/users/${id}/send-sms-verification`);
  }

  // 验证邮箱
  async verifyEmail(token: string): Promise<void> {
    await userApiClient.post('/users/verify-email', { token });
  }

  // 验证手机号
  async verifyPhone(token: string, code: string): Promise<void> {
    await userApiClient.post('/users/verify-phone', { token, code });
  }

  // 获取最近注册的用户
  async getRecentUsers(limit: number = 10): Promise<User[]> {
    const response = await userApiClient.get('/users/recent', { params: { limit } });
    return response;
  }
}

// 导出用户服务实例
export const userService = new UserService();
