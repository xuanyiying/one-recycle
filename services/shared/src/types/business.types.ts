/**
 * 业务相关类型定义
 */

import { BaseEntity } from './common.types';

// 用户状态
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}



// 交易类型
export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT'
}

// 提现状态
export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// 支付提供商
export enum PaymentProvider {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
  BANK_CARD = 'BANK_CARD',
  CASH = 'CASH'
}

// 物流状态
export enum DispatchStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// 快递提供商
export enum CourierProvider {
  JD_EXPRESS = 'JD_EXPRESS',
  SF_EXPRESS = 'SF_EXPRESS',
  YTO_EXPRESS = 'YTO_EXPRESS',
  INTERNAL = 'INTERNAL'
}

// 分类状态
export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// 通知类型
export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

// 通知状态
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

// 订单状态
export enum OrderStatus {
  PENDING = 'PENDING',           // 待确认
  CONFIRMED = 'CONFIRMED',       // 已确认
  ASSIGNED = 'ASSIGNED',         // 已分配
  IN_PROGRESS = 'IN_PROGRESS',   // 进行中
  COMPLETED = 'COMPLETED',       // 已完成
  CANCELLED = 'CANCELLED',       // 已取消
  REFUNDED = 'REFUNDED',         // 已退款
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'PENDING',           // 待支付
  PROCESSING = 'PROCESSING',     // 处理中
  COMPLETED = 'COMPLETED',       // 已完成
  FAILED = 'FAILED',             // 失败
  CANCELLED = 'CANCELLED',       // 已取消
  REFUNDED = 'REFUNDED',         // 已退款
}

// 退款状态
export enum RefundStatus {
  PENDING = 'PENDING',           // 待处理
  PROCESSING = 'PROCESSING',     // 处理中
  COMPLETED = 'COMPLETED',       // 已完成
  FAILED = 'FAILED',             // 失败
  REJECTED = 'REJECTED',         // 已拒绝
}

// 快递员状态
export enum CourierStatus {
  AVAILABLE = 'AVAILABLE',       // 可用
  BUSY = 'BUSY',                 // 忙碌
  OFFLINE = 'OFFLINE',           // 离线
  SUSPENDED = 'SUSPENDED',       // 暂停
}

// 地址信息
export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  street: string;
  detail: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

// 回收品类别
export interface Category {
  id: string;
  name: string;
  description?: string;
  unit: string;
  pricePerUnit: number;
  isActive: boolean;
  parentId?: string;
  children?: Category[];
}

// 订单项
export interface OrderItem {
  id: string;
  orderId: string;
  categoryId: string;
  category?: Category;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  description?: string;
}

// 订单信息
export interface Order extends BaseEntity {
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  description?: string;
  scheduledAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  
  // 地址信息
  pickupAddress: Address;
  
  // 订单项
  items: OrderItem[];
  
  // 快递员信息
  courierId?: string;
  courier?: Courier;
  
  // 支付信息
  paymentId?: string;
  payment?: Payment;
}

// 支付信息
export interface Payment extends BaseEntity {
  orderId: string;
  order?: Order;
  paymentNumber: string;
  amount: number;
  status: PaymentStatus;
  provider: string;
  providerTransactionId?: string;
  paidAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

// 退款信息
export interface Refund extends BaseEntity {
  paymentId: string;
  payment?: Payment;
  refundNumber: string;
  amount: number;
  status: RefundStatus;
  reason: string;
  processedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
}

// 快递员信息
export interface Courier extends BaseEntity {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  status: CourierStatus;
  vehicleType?: string;
  vehicleNumber?: string;
  workingAreas: string[];
  rating: number;
  totalOrders: number;
  completedOrders: number;
  lastActiveAt?: Date;
}

// 通知信息
export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  readAt?: Date;
  data?: any;
}

// 库存信息
export interface Inventory extends BaseEntity {
  categoryId: string;
  category?: Category;
  quantity: number;
  unit: string;
  location: string;
  lastUpdatedBy: string;
}

// 创建订单请求
export interface CreateOrderRequest {
  pickupAddressId: string;
  items: {
    categoryId: string;
    quantity: number;
    description?: string;
  }[];
  scheduledAt?: Date;
  description?: string;
}

// 创建支付请求
export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  provider: string;
  returnUrl?: string;
  notifyUrl?: string;
}

// 创建退款请求
export interface CreateRefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

// 分配快递员请求
export interface AssignCourierRequest {
  orderId: string;
  courierId: string;
}

// 更新订单状态请求
export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  note?: string;
}