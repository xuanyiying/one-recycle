import { apiClient } from './apiClient';

export enum OrderStatus {
  PENDING = 'PENDING',
  PENDING_PICKUP = 'PENDING_PICKUP',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  PENDING_RECEIPT = 'PENDING_RECEIPT',
  INSPECTING = 'INSPECTING',
  INSPECTED = 'INSPECTED',
  INSPECTION_EXCEPTION = 'INSPECTION_EXCEPTION',
  MANUAL_PROCESSING = 'MANUAL_PROCESSING',
  PENDING_INBOUND = 'PENDING_INBOUND',
  INBOUNDED = 'INBOUNDED',
  PENDING_SETTLEMENT = 'PENDING_SETTLEMENT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface OrderAddress {
  id: number;
  userId: number;
  name: string;
  mobile: string;
  province: string;
  city: string;
  district: string;
  town: string;
  street: string;
  zipCode: string;
  detail: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  categoryId: number;
  categoryName?: string;
  estimatedWeight: number;
  actualWeight?: number | null;
  unitPrice: number;
  amount: number;
  quantity: number;
  condition?: string | null;
  photos?: unknown;
  brandModel?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface OrderAssignment {
  id: number;
  orderId: number;
  courierId: string;
  taskId?: string | null;
  orderNo: string;
  waybillNo?: string | null;
  pickupCode?: string | null;
  status: string;
  assignedAt: string;
  acceptedAt?: string | null;
  startedAt?: string | null;
  arrivedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  failedAt?: string | null;
  notes?: string | null;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  pickupLocation?: unknown;
  deliveryLocation?: unknown;
  createdAt: string;
}

export interface LogisticsOrder {
  id: number;
  orderId: number;
  logisticsNo?: string | null;
  logisticsCompany?: string | null;
  status: string;
  senderName?: string | null;
  senderPhone?: string | null;
  senderAddress?: string | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  receiverAddress?: string | null;
  estimatedPickupTime?: string | null;
  actualPickupTime?: string | null;
  estimatedDeliveryTime?: string | null;
  actualDeliveryTime?: string | null;
  deliveryFee?: number | null;
  providerData?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineItem {
  id: number;
  orderId: number;
  status: string;
  message: string;
  operator?: string | null;
  createdAt: string;
}

// 订单类型接口
export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  addressId: number;
  orderType: string;
  status: OrderStatus;
  priority: number;
  expectPickupTime?: string | null;
  actualPickupTime?: string | null;
  expectDeliveryTime?: string | null;
  actualDeliveryTime?: string | null;
  estimatedAmount: number;
  settlementAmount: number;
  payAmount: number;
  discountAmount?: number;
  channel: string;
  remark?: string | null;
  source?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  address?: OrderAddress;
  items?: OrderItem[];
  assignments?: OrderAssignment[];
  logisticsOrders?: LogisticsOrder[];
  timeline?: OrderTimelineItem[];
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
  limit?: number;
  status?: OrderStatus;
  userId?: string;
  orderNo?: string;
  orderType?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'estimatedAmount' | 'settlementAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// 订单列表响应
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 创建订单请求
export interface CreateOrderRequest {
  orderNo?: string;
  userId?: number;
  addressId: number;
  timeSlotId?: string;
  expectPickupTime?: string;
  items: Array<{
    categoryId: number | string;
    categoryName?: string;
    estimatedWeight?: number;
    weight?: number;
    unitPrice?: number;
    quantity: number;
    brandModel?: string;
    condition?: string;
    photos?: string[];
    notes?: string;
    estimatedPrice?: any;
  }>;
  channel?: string;
  notes?: string;
  source?: string;
  remark?: string;
  totalAmount?: number;
  estimatedAmount?: number;
  status?: OrderStatus;
}

// 更新订单请求
export interface UpdateOrderRequest {
  status?: OrderStatus;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  remark?: string;
  expectPickupTime?: string;
  expectDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  settlementAmount?: number;
  payAmount?: number;
  items?: Array<{
    id: number;
    quantity: number;
  }>;
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
  async getOrderById(id: number | string): Promise<Order> {
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
  async updateOrder(id: number | string, data: UpdateOrderRequest): Promise<Order> {
    return apiClient.put<Order>(`${this.baseUrl}/${id}`, data, {
      showSuccess: true,
      successMessage: '订单更新成功',
    });
  }

  /**
   * 删除订单
   */
  async deleteOrder(id: number | string): Promise<void> {
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
  async updateOrderStatus(id: number | string, status: OrderStatus): Promise<Order> {
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
