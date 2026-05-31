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
  if (from === to) return true;
  return orderStatusTransitions[from]?.includes(to) ?? false;
}

export function getNextStatuses(from: OrderStatus): OrderStatus[] {
  return orderStatusTransitions[from] ?? [];
}

export const statusActionLabels: Partial<Record<OrderStatus, Partial<Record<OrderStatus, string>>>> = {
  [OrderStatus.PENDING]: {
    [OrderStatus.PENDING_PICKUP]: '接单',
    [OrderStatus.CANCELLED]: '取消订单',
  },
  [OrderStatus.PENDING_PICKUP]: {
    [OrderStatus.PICKED_UP]: '确认取件',
    [OrderStatus.CANCELLED]: '取消订单',
  },
  [OrderStatus.PICKED_UP]: {
    [OrderStatus.IN_TRANSIT]: '开始运输',
  },
  [OrderStatus.IN_TRANSIT]: {
    [OrderStatus.PENDING_RECEIPT]: '到达待收货',
    [OrderStatus.CANCELLED]: '取消订单',
  },
  [OrderStatus.PENDING_RECEIPT]: {
    [OrderStatus.INSPECTING]: '确认收货',
  },
  [OrderStatus.INSPECTING]: {
    [OrderStatus.INSPECTED]: '验货合格',
    [OrderStatus.INSPECTION_EXCEPTION]: '验货异常',
  },
  [OrderStatus.INSPECTION_EXCEPTION]: {
    [OrderStatus.MANUAL_PROCESSING]: '转人工处理',
    [OrderStatus.INSPECTING]: '重新验货',
  },
  [OrderStatus.MANUAL_PROCESSING]: {
    [OrderStatus.INSPECTED]: '处理完成',
    [OrderStatus.CANCELLED]: '取消订单',
  },
  [OrderStatus.INSPECTED]: {
    [OrderStatus.PENDING_INBOUND]: '待入库',
  },
  [OrderStatus.PENDING_INBOUND]: {
    [OrderStatus.INBOUNDED]: '确认入库',
  },
  [OrderStatus.INBOUNDED]: {
    [OrderStatus.PENDING_SETTLEMENT]: '待结算',
  },
  [OrderStatus.PENDING_SETTLEMENT]: {
    [OrderStatus.COMPLETED]: '确认结算',
  },
  [OrderStatus.COMPLETED]: {
    [OrderStatus.REFUNDED]: '退款',
  },
  [OrderStatus.CANCELLED]: {},
  [OrderStatus.REFUNDED]: {},
};

export function getStatusActionLabel(from: OrderStatus, to: OrderStatus): string | undefined {
  return statusActionLabels[from]?.[to];
}

// 后台人员可操作的状态流转（操作员/管理员共享相同权限，排除快递/物流端自动更新的状态）
export const backendTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
  [OrderStatus.PENDING_PICKUP]: [OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.CANCELLED],
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

// 兼容性别名：adminTransitions = backendTransitions（操作员/管理员权限一致）
export const adminTransitions = backendTransitions;

export function getBackendNextStatuses(from: OrderStatus): OrderStatus[] {
  return backendTransitions[from] ?? [];
}

// 兼容性别名
export const getAdminNextStatuses = getBackendNextStatuses;
