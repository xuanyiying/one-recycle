export const ORDER_CONSTANTS = {
  // 订单号前缀
  ORDER_NO_PREFIX: {
    RECYCLE: 'RC',
    SALE: 'SL',
  },
  
  // 默认值
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // 订单状态流转
  STATUS_FLOW: {
    RECYCLE: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
    SALE: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
  },
  
  // 时间限制（分钟）
  TIME_LIMITS: {
    ACCEPT_TIMEOUT: 30, // 接单超时
    PICKUP_TIMEOUT: 120, // 上门超时
    PROCESSING_TIMEOUT: 240, // 处理超时
  },
  
  // 金额限制
  AMOUNT_LIMITS: {
    MIN_ORDER_AMOUNT: 0.01,
    MAX_ORDER_AMOUNT: 99999.99,
  },
  
  // 支付渠道
  PAYMENT_CHANNELS: {
    WECHAT_MP: 'WECHAT_MP',
    ALIPAY_MP: 'ALIPAY_MP',
    BANK_CARD: 'BANK_CARD',
  },
} as const;