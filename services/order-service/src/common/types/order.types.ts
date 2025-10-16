import { OrderType, OrderStatus, OrderPriority } from '../../order/entities';

export type OrderId = bigint;
export type UserId = bigint;
export type AddressId = bigint;
export type CategoryId = bigint;
export type CourierId = bigint;

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface OrderSearchFilters {
  userId?: UserId;
  status?: OrderStatus;
  orderType?: OrderType;
  priority?: OrderPriority;
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
}

export interface OrderListQuery extends PaginationOptions {
  filters?: OrderSearchFilters;
  sort?: SortOptions;
}

export interface OrderSummary {
  id: OrderId;
  orderNo: string;
  status: OrderStatus;
  orderType: OrderType;
  estimatedAmount: number;
  createdAt: Date;
}

export interface OrderStatisticsData {
  totalCount: number;
  statusCounts: Record<OrderStatus, number>;
  typeCounts: Record<OrderType, number>;
  totalAmount: number;
  averageAmount: number;
}