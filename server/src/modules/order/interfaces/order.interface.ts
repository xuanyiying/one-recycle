import { OrderPriority, OrderStatus, OrderType } from '@/common';
import { Order } from '@prisma/client';

export interface IOrderService {
  create(createOrderData: CreateOrderData): Promise<Order>;
  findAll(
    filters: OrderFilters,
    page?: number,
    limit?: number,
  ): Promise<{ orders: Order[]; total: number }>;
  findOne(id: number): Promise<Order>;
  update(id: number, updateData: UpdateOrderData): Promise<Order>;
  cancel(id: number): Promise<Order>;
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
  userId?: string;
  status?: OrderStatus;
  orderType?: OrderType;
  priority?: OrderPriority;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  quota: number;
  remaining: number;
}

export interface DayTimeSlots {
  date: string;
  dayOfWeek: number;
  slots: TimeSlot[];
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalAmount: number;
}
