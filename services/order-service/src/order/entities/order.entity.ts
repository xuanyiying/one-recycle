export enum OrderType {
  RECYCLE = 'RECYCLE',
  SALE = 'SALE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ARRIVED = 'ARRIVED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export interface OrderEntity {
  id: number;
  orderNo: string;
  userId: number;
  addressId: number;
  orderType: OrderType;
  status: OrderStatus;
  priority: OrderPriority;
  expectPickupTime?: Date;
  actualPickupTime?: Date;
  expectDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  estimatedAmount: number;
  settlementAmount: number;
  payAmount: number;
  channel: string;
  remark?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemEntity[];
  assignments?: AssignmentEntity[];
}

export interface OrderItemEntity {
  id: number;
  orderId?: number;
  categoryId: number;
  estimatedWeight?: number;
  actualWeight?: number;
  unitPrice: number;
  amount: number;
  createdAt: Date;
}

export interface AssignmentEntity {
  id: number;
  orderId: number;
  courierId: number;
  status: AssignmentStatus;
  acceptedAt?: Date;
  arrivedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
}