import { OrderStatus } from '@/services/orderService';

export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待接单',
  [OrderStatus.ASSIGNED]: '待取件',
  [OrderStatus.PICKUP_PENDING]: '待取件',
  [OrderStatus.PICKED_UP]: '已取件',
  [OrderStatus.IN_TRANSIT]: '运输中',
  [OrderStatus.RECEIVING_PENDING]: '待收货',
  [OrderStatus.INSPECTING]: '验货中',
  [OrderStatus.INSPECTED]: '已验货',
  [OrderStatus.INSPECTION_EXCEPTION]: '验货异常',
  [OrderStatus.MANUAL_REVIEW]: '人工处理',
  [OrderStatus.INBOUND_PENDING]: '待入库',
  [OrderStatus.INBOUND_COMPLETED]: '已入库',
  [OrderStatus.SETTLEMENT_PENDING]: '待结算',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.REFUNDED]: '已退款',
};

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED]: [OrderStatus.PICKUP_PENDING, OrderStatus.CANCELLED],
  [OrderStatus.PICKUP_PENDING]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.RECEIVING_PENDING, OrderStatus.CANCELLED],
  [OrderStatus.RECEIVING_PENDING]: [OrderStatus.INSPECTING],
  [OrderStatus.INSPECTING]: [OrderStatus.INSPECTED, OrderStatus.INSPECTION_EXCEPTION],
  [OrderStatus.INSPECTION_EXCEPTION]: [OrderStatus.MANUAL_REVIEW],
  [OrderStatus.MANUAL_REVIEW]: [OrderStatus.INSPECTED, OrderStatus.CANCELLED],
  [OrderStatus.INSPECTED]: [OrderStatus.INBOUND_PENDING],
  [OrderStatus.INBOUND_PENDING]: [OrderStatus.INBOUND_COMPLETED],
  [OrderStatus.INBOUND_COMPLETED]: [OrderStatus.SETTLEMENT_PENDING],
  [OrderStatus.SETTLEMENT_PENDING]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export const orderStatusSequence: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.ASSIGNED,
  OrderStatus.PICKUP_PENDING,
  OrderStatus.PICKED_UP,
  OrderStatus.IN_TRANSIT,
  OrderStatus.RECEIVING_PENDING,
  OrderStatus.INSPECTING,
  OrderStatus.INSPECTED,
  OrderStatus.INBOUND_PENDING,
  OrderStatus.INBOUND_COMPLETED,
  OrderStatus.SETTLEMENT_PENDING,
  OrderStatus.COMPLETED,
];

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return orderStatusTransitions[from]?.includes(to) ?? false;
}

export function getNextStatuses(from: OrderStatus): OrderStatus[] {
  return orderStatusTransitions[from] ?? [];
}
