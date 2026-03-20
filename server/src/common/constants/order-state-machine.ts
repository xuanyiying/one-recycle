/**
 * 订单状态机定义
 * 统一的状态转换规则，前后端共享
 */

/**
 * 订单状态枚举
 */
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

/**
 * 状态转换规则定义
 * 记录每个状态可以转换到哪些目标状态
 */
export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PENDING_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_PICKUP]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [
    OrderStatus.PENDING_RECEIPT,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PENDING_RECEIPT]: [OrderStatus.INSPECTING],
  [OrderStatus.INSPECTING]: [
    OrderStatus.INSPECTED,
    OrderStatus.INSPECTION_EXCEPTION,
  ],
  [OrderStatus.INSPECTION_EXCEPTION]: [
    OrderStatus.MANUAL_PROCESSING,
    OrderStatus.INSPECTING,
  ],
  [OrderStatus.MANUAL_PROCESSING]: [
    OrderStatus.INSPECTED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.INSPECTED]: [OrderStatus.PENDING_INBOUND],
  [OrderStatus.PENDING_INBOUND]: [OrderStatus.INBOUNDED],
  [OrderStatus.INBOUNDED]: [OrderStatus.PENDING_SETTLEMENT],
  [OrderStatus.PENDING_SETTLEMENT]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

/**
 * 状态顺序（用于进度展示）
 */
export const orderStatusSequence: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PENDING_PICKUP,
  OrderStatus.PICKED_UP,
  OrderStatus.IN_TRANSIT,
  OrderStatus.PENDING_RECEIPT,
  OrderStatus.INSPECTING,
  OrderStatus.INSPECTED,
  OrderStatus.PENDING_INBOUND,
  OrderStatus.INBOUNDED,
  OrderStatus.PENDING_SETTLEMENT,
  OrderStatus.COMPLETED,
];

/**
 * 状态标签映射
 */
export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待接单',
  [OrderStatus.PENDING_PICKUP]: '待取件',
  [OrderStatus.PICKED_UP]: '已取件',
  [OrderStatus.IN_TRANSIT]: '运输中',
  [OrderStatus.PENDING_RECEIPT]: '待收货',
  [OrderStatus.INSPECTING]: '验货中',
  [OrderStatus.INSPECTED]: '已验货',
  [OrderStatus.INSPECTION_EXCEPTION]: '验货异常',
  [OrderStatus.MANUAL_PROCESSING]: '人工处理',
  [OrderStatus.PENDING_INBOUND]: '待入库',
  [OrderStatus.INBOUNDED]: '已入库',
  [OrderStatus.PENDING_SETTLEMENT]: '待结算',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.REFUNDED]: '已退款',
};

/**
 * 检查状态转换是否合法
 * @param from 当前状态
 * @param to 目标状态
 * @returns 是否允许转换
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  // 相同状态视为合法（幂等）
  if (from === to) {
    return true;
  }

  const allowedTransitions = orderStatusTransitions[from];
  if (!allowedTransitions) {
    return false;
  }

  return allowedTransitions.includes(to);
}

/**
 * 获取从当前状态可以转换到的所有状态
 * @param from 当前状态
 * @returns 可转换的目标状态列表
 */
export function getNextStatuses(from: OrderStatus): OrderStatus[] {
  return orderStatusTransitions[from] ?? [];
}

/**
 * 获取状态的显示标签
 * @param status 订单状态
 * @returns 状态标签
 */
export function getStatusLabel(status: OrderStatus): string {
  return orderStatusLabels[status] ?? status;
}

/**
 * 检查状态是否为终态
 * @param status 订单状态
 * @returns 是否为终态
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return (
    status === OrderStatus.COMPLETED ||
    status === OrderStatus.CANCELLED ||
    status === OrderStatus.REFUNDED
  );
}

/**
 * 检查状态是否允许取消
 * @param status 订单状态
 * @returns 是否允许取消
 */
export function canCancel(status: OrderStatus): boolean {
  return getNextStatuses(status).includes(OrderStatus.CANCELLED);
}

/**
 * 状态机验证错误类
 */
export class StateMachineError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
    message?: string,
  ) {
    super(message ?? `Invalid state transition from ${from} to ${to}`);
    this.name = 'StateMachineError';
  }
}

/**
 * @param from 当前状态
 * @param to 目标状态
 * @throws StateMachineError 如果转换不合法
 */
export function validateTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new StateMachineError(
      from,
      to,
      `Invalid state transition from "${getStatusLabel(from)}" to "${getStatusLabel(to)}"`,
    );
  }
}

/**
 * 类型守卫：检查字符串是否为有效的 OrderStatus
 */
export function isValidOrderStatus(status: string): status is OrderStatus {
  return (Object.values(OrderStatus) as string[]).includes(status);
}

/**
 * 触发类型枚举
 */
export enum TriggerType {
  MANUAL = 'MANUAL', // 手动操作
  SCHEDULED = 'SCHEDULED', // 定时任务
  CALLBACK = 'CALLBACK', // 回调通知
  SYSTEM = 'SYSTEM', // 系统触发
}

/**
 * 操作人类型枚举
 */
export enum OperatorType {
  USER = 'USER', // 普通用户
  COURIER = 'COURIER', // 快递员
  ADMIN = 'ADMIN', // 管理员
  SYSTEM = 'SYSTEM', // 系统
}

/**
 * 状态机上下文接口
 */
export interface StateMachineContext {
  orderId: string;
  action: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  operatorId?: string;
  operatorRole?: string;
  operatorType: OperatorType;
  reason?: string;
  trigger: TriggerType;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}
