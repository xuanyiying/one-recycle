import { OrderEntity, OrderItemEntity, OrderType, OrderStatus, OrderPriority } from '../entities';

export interface IOrderService {
  create(createOrderData: CreateOrderData): Promise<OrderEntity>;
  findAll(filters: OrderFilters, page?: number, limit?: number): Promise<{ orders: OrderEntity[]; total: number }>;
  findOne(id: number): Promise<OrderEntity>;
  update(id: number, updateData: UpdateOrderData): Promise<OrderEntity>;
  cancel(id: number): Promise<OrderEntity>;
  remove(id: number): Promise<void>;
}

export interface CreateOrderData {
  orderNo: string;
  userId: number;
  addressId: number;
  orderType: OrderType;
  expectPickupTime?: Date;
  expectDeliveryTime?: Date;
  estimatedAmount: number;
  settlementAmount?: number;
  payAmount?: number;
  priority?: OrderPriority;
  channel?: string;
  remark?: string;
  source?: string;
}

export interface CreateOrderItemData {
  categoryId: number;
  estimatedQuantity: number;
  estimatedPrice: number;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  priority?: OrderPriority;
  remark?: string;
  expectPickupTime?: Date;
  actualPickupTime?: Date;
  expectDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  settlementAmount?: number;
  payAmount?: number;
}

export interface OrderFilters {
  userId?: number;
  status?: OrderStatus;
  orderType?: OrderType;
  priority?: OrderPriority;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalAmount: number;
}