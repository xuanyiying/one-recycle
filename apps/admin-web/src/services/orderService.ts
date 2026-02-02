import { apiClient } from './apiClient';

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKUP_PENDING = 'PICKUP_PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVING_PENDING = 'RECEIVING_PENDING',
  INSPECTING = 'INSPECTING',
  INSPECTED = 'INSPECTED',
  INSPECTION_EXCEPTION = 'INSPECTION_EXCEPTION',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
  INBOUND_PENDING = 'INBOUND_PENDING',
  INBOUND_COMPLETED = 'INBOUND_COMPLETED',
  SETTLEMENT_PENDING = 'SETTLEMENT_PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// 订单类型接口
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  logistics?: OrderLogistics;
  statusTimeline?: OrderStatusTimelineItem[];
  operationLogs?: OrderOperationLog[];
  inspection?: OrderInspection;
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  completedAt?: string;
  notes?: string;
}

export interface OrderLogistics {
  carrierName: string;
  trackingNumber: string;
  currentStatus: string;
  lastUpdatedAt: string;
  events: OrderLogisticsEvent[];
}

export interface OrderLogisticsEvent {
  time: string;
  location: string;
  status: string;
  detail?: string;
}

export interface OrderStatusTimelineItem {
  status: OrderStatus;
  time: string;
  operator?: string;
  note?: string;
}

export interface OrderOperationLog {
  id: string;
  operator: string;
  action: string;
  time: string;
  detail?: string;
}

export interface OrderInspection {
  inspector: string;
  result: 'PASS' | 'EXCEPTION';
  reason?: string[];
  note?: string;
  images?: string[];
  completedAt?: string;
}

export interface OrderItem {
  id: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

// 订单统计接口
export interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

// 订单查询参数
export interface OrderQueryParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  customerName?: string;
  orderNumber?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// 订单列表响应
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 创建订单请求
export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Omit<OrderItem, 'id' | 'totalPrice'>[];
  scheduledDate?: string;
  notes?: string;
}

// 更新订单请求
export interface UpdateOrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items?: Omit<OrderItem, 'id' | 'totalPrice'>[];
  status?: OrderStatus;
  scheduledDate?: string;
  notes?: string;
}

class OrderService {
  private readonly baseUrl = '/orders';

  /**
   * 获取订单列表
   */
  async getOrders(params?: OrderQueryParams): Promise<OrderListResponse> {
    return apiClient.get<OrderListResponse>(this.baseUrl, params);
  }

  /**
   * 获取订单详情
   */
  async getOrderById(id: string): Promise<Order> {
    return apiClient.get<Order>(`${this.baseUrl}/${id}`);
  }

  /**
   * 创建新订单
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return apiClient.post<Order>(this.baseUrl, data, {
      showSuccess: true,
      successMessage: '订单创建成功',
    });
  }

  /**
   * 更新订单
   */
  async updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
    return apiClient.put<Order>(`${this.baseUrl}/${id}`, data, {
      showSuccess: true,
      successMessage: '订单更新成功',
    });
  }

  /**
   * 删除订单
   */
  async deleteOrder(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`, {
      showSuccess: true,
      successMessage: '订单删除成功',
    });
  }

  /**
   * 批量删除订单
   */
  async batchDeleteOrders(ids: string[]): Promise<void> {
    return apiClient.post<void>(
      `${this.baseUrl}/batch-delete`,
      { ids },
      {
        showSuccess: true,
        successMessage: '批量删除成功',
      },
    );
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    return apiClient.put<Order>(
      `${this.baseUrl}/${id}/status`,
      { status },
      {
        showSuccess: true,
        successMessage: '订单状态更新成功',
      },
    );
  }

  /**
   * 获取订单统计数据
   */
  async getOrderStats(): Promise<OrderStats> {
    return apiClient.get<OrderStats>(`${this.baseUrl}/stats`);
  }

  /**
   * 导出订单数据
   */
  async exportOrders(params?: OrderQueryParams): Promise<Blob> {
    const response = await apiClient.getInstance().get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * 获取最近订单（用于仪表板）
   */
  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return apiClient.get<Order[]>(`${this.baseUrl}/recent`, { limit });
  }
}

// 导出单例实例
export const orderService = new OrderService();
