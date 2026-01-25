// 队列名称常量

import { QUEUE_NAMES } from '@/common';

export { QUEUE_NAMES };
export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
