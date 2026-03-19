import { OrderStatus } from '@/services/orderService';

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

export const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PENDING_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_PICKUP]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.PENDING_RECEIPT, OrderStatus.CANCELLED],
  [OrderStatus.PENDING_RECEIPT]: [OrderStatus.INSPECTING],
  [OrderStatus.INSPECTING]: [OrderStatus.INSPECTED, OrderStatus.INSPECTION_EXCEPTION],
  [OrderStatus.INSPECTION_EXCEPTION]: [OrderStatus.MANUAL_PROCESSING, OrderStatus.INSPECTING],
  [OrderStatus.MANUAL_PROCESSING]: [OrderStatus.INSPECTED, OrderStatus.CANCELLED],
  [OrderStatus.INSPECTED]: [OrderStatus.PENDING_INBOUND],
  [OrderStatus.PENDING_INBOUND]: [OrderStatus.INBOUNDED],
  [OrderStatus.INBOUNDED]: [OrderStatus.PENDING_SETTLEMENT],
  [OrderStatus.PENDING_SETTLEMENT]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

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

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return orderStatusTransitions[from]?.includes(to) ?? false;
}

export function getNextStatuses(from: OrderStatus): OrderStatus[] {
  return orderStatusTransitions[from] ?? [];
}
