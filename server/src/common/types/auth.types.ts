import type { Request } from 'express';

/**
 * 认证相关类型定义
 */

// 用户角色枚举
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  COURIER = 'COURIER',
  MANAGER = 'MANAGER',
}

// 权限枚举
export enum Permission {
  // 用户管理
  USER_READ = 'USER_READ',
  USER_WRITE = 'USER_WRITE',
  USER_DELETE = 'USER_DELETE',

  // 订单管理
  ORDER_READ = 'ORDER_READ',
  ORDER_WRITE = 'ORDER_WRITE',
  ORDER_DELETE = 'ORDER_DELETE',
  ORDER_ASSIGN = 'ORDER_ASSIGN',

  // 支付管理
  PAYMENT_READ = 'PAYMENT_READ',
  PAYMENT_WRITE = 'PAYMENT_WRITE',
  PAYMENT_REFUND = 'PAYMENT_REFUND',

  // 快递员管理
  COURIER_READ = 'COURIER_READ',
  COURIER_WRITE = 'COURIER_WRITE',
  COURIER_DELETE = 'COURIER_DELETE',

  // 系统管理
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  SYSTEM_MONITOR = 'SYSTEM_MONITOR',
}

// JWT载荷
export interface JwtPayload {
  sub: string; // 用户ID
  email?: string;
  roles: UserRole[];
  permissions: Permission[];
  iat: number;
  exp: number;
}

// 登录请求
export interface LoginRequest {
  provider: 'wechat' | 'alipay' | 'email';
  code?: string; // 小程序登录码
  email?: string; // 邮箱登录
  password?: string; // 密码登录
  appId?: string; // 应用ID
}

// 登录响应
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
  expiresIn: number;
}

// 用户信息
export interface UserInfo {
  id: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  mobile?: string;
  roles: UserRole[];
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: Date;
}

// 用户身份信息
export interface UserIdentity {
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  openId?: string;
  unionId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 刷新令牌请求
export interface RefreshTokenRequest {
  refreshToken: string;
}

// 注销请求
export interface LogoutRequest {
  refreshToken?: string;
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean;
  missingPermissions: Permission[];
}

// 角色权限映射
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.ORDER_DELETE,
    Permission.ORDER_ASSIGN,
    Permission.PAYMENT_READ,
    Permission.PAYMENT_WRITE,
    Permission.PAYMENT_REFUND,
    Permission.COURIER_READ,
    Permission.COURIER_WRITE,
    Permission.COURIER_DELETE,
    Permission.SYSTEM_CONFIG,
    Permission.SYSTEM_MONITOR,
  ],
  [UserRole.MANAGER]: [
    Permission.USER_READ,
    Permission.ORDER_READ,
    Permission.ORDER_WRITE,
    Permission.ORDER_ASSIGN,
    Permission.PAYMENT_READ,
    Permission.COURIER_READ,
    Permission.COURIER_WRITE,
    Permission.SYSTEM_MONITOR,
  ],
  [UserRole.COURIER]: [Permission.ORDER_READ, Permission.ORDER_WRITE],
  [UserRole.USER]: [Permission.ORDER_READ, Permission.PAYMENT_READ],
};

// 认证后的请求对象
export interface RequestWithUser extends Request {
  user: {
    id: string;
    phone: string;
    role: string;
    sessionId: string;
  };
}
