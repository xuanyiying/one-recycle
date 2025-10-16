/**
 * 通用类型定义
 */

// 基础响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  timestamp?: string;
  path?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 基础实体接口
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 软删除实体接口
export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date | null;
}

// 用户上下文
export interface UserContext {
  userId: string;
  email?: string;
  roles: string[];
  permissions: string[];
}

// 服务间通信上下文
export interface ServiceContext {
  requestId: string;
  userId?: string;
  serviceId: string;
  timestamp: Date;
}

// 错误类型
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// 自定义错误接口
export interface CustomError {
  code: ErrorCode;
  message: string;
  details?: any;
}

// 事件类型
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: any;
  version: number;
  occurredAt: Date;
}

// 命令接口
export interface Command {
  id: string;
  type: string;
  data: any;
  userId?: string;
  timestamp: Date;
}

// 查询接口
export interface Query {
  id: string;
  type: string;
  params: any;
  userId?: string;
  timestamp: Date;
}