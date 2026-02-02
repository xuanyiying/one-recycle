// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  CUSTOMER = 'customer',
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
  items: User[];
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
