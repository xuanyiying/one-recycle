/**
 * 业务相关类型定义
 */

// UserRole defined in auth.types.ts

// 用户状态
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

// 交易类型
export enum TransactionType {
  PAYMENT = 'PAYMENT', // 支付
  REFUND = 'REFUND', // 退款
  WITHDRAWAL = 'WITHDRAWAL', // 提现
  DEPOSIT = 'DEPOSIT', // 充值
}

// 提现状态
export enum WithdrawalStatus {
  PENDING = 'PENDING', // 待处理
  PROCESSING = 'PROCESSING', // 处理中
  COMPLETED = 'COMPLETED', // 已完成
  FAILED = 'FAILED', // 失败
  CANCELLED = 'CANCELLED', // 取消
}

// 支付提供商
export enum PaymentProvider {
  ALIPAY = 'ALIPAY', // 支付宝
  WECHAT = 'WECHAT', // 微信
  BANK_CARD = 'BANK_CARD', // 银行卡
  CASH = 'CASH', // 现金
}

// 物流状态
export enum DispatchStatus {
  PENDING = 'PENDING', // 待处理
  ASSIGNED = 'ASSIGNED', // 已分配
  IN_TRANSIT = 'IN_TRANSIT', // 运输中
  DELIVERED = 'DELIVERED', // 已送达
  FAILED = 'FAILED', // 失败
  CANCELLED = 'CANCELLED', // 取消
}

// 快递提供商
export enum CourierProvider {
  JD_EXPRESS = 'JD_EXPRESS',
  SF_EXPRESS = 'SF_EXPRESS',
  YTO_EXPRESS = 'YTO_EXPRESS',
  INTERNAL = 'INTERNAL',
}

// 分类状态
export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

// 通知类型
export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

// 通知状态
export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

// 订单状态
export enum OrderStatus {
  PENDING = 'PENDING', // 待接单
  PENDING_PICKUP = 'PENDING_PICKUP', // 待取件 (已接单/已派单)
  PICKED_UP = 'PICKED_UP', // 已取件
  IN_TRANSIT = 'IN_TRANSIT', // 运输中
  PENDING_RECEIPT = 'PENDING_RECEIPT', // 待收货 (已到达回收站)
  INSPECTING = 'INSPECTING', // 验货中
  INSPECTED = 'INSPECTED', // 已验货
  INSPECTION_EXCEPTION = 'INSPECTION_EXCEPTION', // 验货异常
  MANUAL_PROCESSING = 'MANUAL_PROCESSING', // 人工处理
  PENDING_INBOUND = 'PENDING_INBOUND', // 待入库
  INBOUNDED = 'INBOUNDED', // 已入库
  PENDING_SETTLEMENT = 'PENDING_SETTLEMENT', // 待结算
  COMPLETED = 'COMPLETED', // 已完成
  CANCELLED = 'CANCELLED', // 已取消
  REFUNDED = 'REFUNDED', // 已退款
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'PENDING', // 待支付
  PROCESSING = 'PROCESSING', // 处理中
  COMPLETED = 'COMPLETED', // 已完成
  FAILED = 'FAILED', // 失败
  CANCELLED = 'CANCELLED', // 已取消
  REFUNDED = 'REFUNDED', // 已退款
}

// 退款状态
export enum RefundStatus {
  PENDING = 'PENDING', // 待处理
  PROCESSING = 'PROCESSING', // 处理中
  COMPLETED = 'COMPLETED', // 已完成
  FAILED = 'FAILED', // 失败
  REJECTED = 'REJECTED', // 已拒绝
}

// 快递员状态
export enum CourierStatus {
  AVAILABLE = 'AVAILABLE', // 可用
  BUSY = 'BUSY', // 忙碌
  OFFLINE = 'OFFLINE', // 离线
  SUSPENDED = 'SUSPENDED', // 暂停
}
export enum OrderType {
  RECYCLE = 'RECYCLE',
  SALE = 'SALE',
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ARRIVED = 'ARRIVED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}
