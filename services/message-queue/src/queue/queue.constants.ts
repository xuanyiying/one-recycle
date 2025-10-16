// 队列名称常量
export const QUEUE_NAMES = {
  ORDER: 'order-queue',
  NOTIFICATION: 'notification-queue',
  PAYMENT: 'payment-queue',
  DISPATCH: 'dispatch-queue',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];
