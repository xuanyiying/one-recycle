import { userApiClient } from './apiClient';

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  CUSTOMER = 'customer'
}

// 用户接口
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

// 用户统计信息
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: {
    [key in UserRole]: number;
  };
  usersByStatus: {
    [key in UserStatus]: number;
  };
}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

// 用户列表响应
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建用户请求
export interface CreateUserRequest {
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// 更新用户请求
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

// 用户活动日志
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

// 用户活动查询参数
export interface UserActivityQueryParams {
  userId?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  action?: string;
}

// 用户活动列表响应
export interface UserActivityListResponse {
  activities: UserActivity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 密码重置请求
export interface PasswordResetRequest {
  email: string;
}

// 密码更新请求
export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

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
      responseType: 'blob'
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