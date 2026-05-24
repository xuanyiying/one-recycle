import { OrderStatus } from '@/common/types/business.types';

export interface IOrderService {
  getOrder(orderId: string): Promise<Order>;
  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    metadata?: Record<string, any>,
  ): Promise<Order>;
  updateOrderAmount(orderId: string, totalAmount: number): Promise<Order>;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus | string;
  orderType?: string;
  items: OrderItem[];
  address: Address;
  totalAmount: number;
  scheduledTime?: string;
  courierId?: string;
  waybillNo?: string;
}

export interface OrderItem {
  id: string;
  categoryId: string;
  quantity: number;
  estimatedPrice: number;
  actualPrice?: number;
  description?: string;
}

export interface Address {
  id: string;
  fullAddress: string;
  province?: string;
  city?: string;
  district?: string;
  detail?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactName?: string;
  contactPhone?: string;
}
