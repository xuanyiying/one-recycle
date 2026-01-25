/**
 * 共享常量定义
 */

// 服务名称
export const SERVICE_NAMES = {
  ACCOUNT: 'account-service',
  AUTH: 'auth-service',
  ORDER: 'order-service',
  PAYMENT: 'payment-service',
  COURIER: 'courier-service',
  NOTIFICATION: 'notification-service',
  CATEGORY: 'category-service',
  INVENTORY: 'inventory-service',
  DISPATCH: 'dispatch-service',
  API_GATEWAY: 'api-gateway',
  MESSAGE_QUEUE: 'message-queue',
} as const;
export const SERVICE_PORTS = {
  ACCOUNT: 50051,
  AUTH: 50052,
  ORDER: 50053,
  PAYMENT: 50054,
  COURIER: 50055,
  NOTIFICATION: 50056,
  CATEGORY: 50057,
  INVENTORY: 50058,
  DISPATCH: 50059,
  MESSAGE_QUEUE: 50060,
} as const;
// gRPC端口配置
export const GRPC_PORTS = {
  ACCOUNT: 50051,
  AUTH: 50052,
  ORDER: 50053,
  PAYMENT: 50054,
  COURIER: 50055,
  NOTIFICATION: 50056,
  CATEGORY: 50057,
  INVENTORY: 50058,
  DISPATCH: 50059,
  MESSAGE_QUEUE: 50060,
} as const;

// HTTP端口配置
export const HTTP_PORTS = {
  API_GATEWAY: 3000,
  ACCOUNT: 3001,
  AUTH: 3002,
  ORDER: 3003,
  PAYMENT: 3004,
  COURIER: 3005,
  NOTIFICATION: 3006,
  CATEGORY: 3003,
  INVENTORY: 3008,
  DISPATCH: 3006,
  MESSAGE_QUEUE: 3010,
} as const;

// 缓存键前缀
export const CACHE_KEYS = {
  USER: 'user:',
  ORDER: 'order:',
  PAYMENT: 'payment:',
  COURIER: 'courier:',
  CATEGORY: 'category:',
  INVENTORY: 'inventory:',
  SESSION: 'session:',
  RATE_LIMIT: 'rate_limit:',
  USER_SESSIONS: 'user:sessions:',
} as const;

// 缓存过期时间（秒）
export const CACHE_TTL = {
  SHORT: 300, // 5分钟
  MEDIUM: 1800, // 30分钟
  LONG: 3600, // 1小时
  VERY_LONG: 86400, // 24小时
} as const;

// 分页默认值
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// 文件上传限制
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
} as const;

// 正则表达式
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE: /^1[3-9]\d{9}$/,
  ID_CARD:
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: '数据验证失败',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '访问被禁止',
  NOT_FOUND: '资源不存在',
  INTERNAL_ERROR: '内部服务器错误',
  SERVICE_UNAVAILABLE: '服务暂不可用',
  RATE_LIMIT_EXCEEDED: '请求频率超限',
  INVALID_TOKEN: '无效的令牌',
  TOKEN_EXPIRED: '令牌已过期',
  INVALID_CREDENTIALS: '无效的凭据',
  USER_NOT_FOUND: '用户不存在',
  ORDER_NOT_FOUND: '订单不存在',
  PAYMENT_NOT_FOUND: '支付记录不存在',
  COURIER_NOT_FOUND: '快递员不存在',
  CATEGORY_NOT_FOUND: '分类不存在',
  INSUFFICIENT_BALANCE: '余额不足',
  ORDER_ALREADY_PAID: '订单已支付',
  ORDER_ALREADY_CANCELLED: '订单已取消',
  PAYMENT_ALREADY_PROCESSED: '支付已处理',
  REFUND_ALREADY_PROCESSED: '退款已处理',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  CREATED: '创建成功',
  UPDATED: '更新成功',
  DELETED: '删除成功',
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  PAYMENT_SUCCESS: '支付成功',
  REFUND_SUCCESS: '退款成功',
  ORDER_CREATED: '订单创建成功',
  ORDER_UPDATED: '订单更新成功',
  ORDER_CANCELLED: '订单取消成功',
  COURIER_ASSIGNED: '快递员分配成功',
} as const;

// 事件类型
export const EVENT_TYPES = {
  // 用户事件
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',

  // 订单事件
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_COMPLETED: 'order.completed',
  ORDER_ASSIGNED: 'order.assigned',

  // 支付事件
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_CANCELLED: 'payment.cancelled',

  // 退款事件
  REFUND_CREATED: 'refund.created',
  REFUND_COMPLETED: 'refund.completed',
  REFUND_FAILED: 'refund.failed',

  // 快递员事件
  COURIER_CREATED: 'courier.created',
  COURIER_UPDATED: 'courier.updated',
  COURIER_STATUS_CHANGED: 'courier.status_changed',

  // 通知事件
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',
} as const;

// 队列名称
export const QUEUE_NAMES = {
  EMAIL: 'email-queue',
  SMS: 'sms-queue',
  PUSH: 'push-queue',
  PAYMENT: 'payment-queue',
  ORDER: 'order-queue',
  NOTIFICATION: 'notification-queue',
  DISPATCH: 'dispatch-queue',
} as const;

// 环境变量键名
export const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  REDIS_URL: 'REDIS_URL',
  CORS_ORIGINS: 'CORS_ORIGINS',
  JWT_SECRET: 'JWT_SECRET',
  JWT_EXPIRES_IN: 'JWT_EXPIRES_IN',
  WECHAT_APP_ID: 'WECHAT_APP_ID',
  WECHAT_APP_SECRET: 'WECHAT_APP_SECRET',
  ALIPAY_APP_ID: 'ALIPAY_APP_ID',
  ALIPAY_PRIVATE_KEY: 'ALIPAY_PRIVATE_KEY',
  ALIPAY_PUBLIC_KEY: 'ALIPAY_PUBLIC_KEY',
} as const;

// 默认配置值
export const DEFAULT_CONFIG = {
  JWT_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: 10,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15分钟
  RATE_LIMIT_MAX: 100, // 每个窗口最大请求数
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30分钟
} as const;
