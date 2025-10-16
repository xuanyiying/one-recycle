export enum CourierStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
  ON_BREAK = 'ON_BREAK',
  SUSPENDED = 'SUSPENDED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  READ = 'READ',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum TaskStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export class LocationEntity {
  latitude: number;
  longitude: number;
  address: string;
  updatedAt: Date;
}

export class WorkingHoursEntity {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  workingDays: number[]; // 0-6 (Sunday-Saturday)
}

export class ContactEntity {
  name: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export class GoodsEntity {
  name: string;
  category: string;
  weight?: number;
  volume?: number;
  value?: number;
  fragile: boolean;
  description?: string;
}

export class NotificationResponseEntity {
  action: 'ACCEPT' | 'REJECT';
  reason?: string;
  estimatedArrivalTime?: Date;
  notes?: string;
}

export class CourierEntity {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: CourierStatus;
  location?: LocationEntity;
  workingHours: WorkingHoursEntity;
  serviceAreas: string[]; // 服务区域
  rating: number;
  totalOrders: number;
  completedOrders: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PickupNotificationEntity {
  id: string;
  taskId: string;
  orderId: string;
  orderNo: string;
  courierId: string;
  waybillNo?: string;
  pickupCode?: string;
  scheduledPickupTime?: Date;
  senderInfo: ContactEntity;
  receiverInfo: ContactEntity;
  goodsInfo: GoodsEntity[];
  specialInstructions?: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: Date;
  readAt?: Date;
  respondedAt?: Date;
  response?: NotificationResponseEntity;
}

export class TaskAssignmentEntity {
  id: string;
  taskId: string;
  orderId: string;
  orderNo: string;
  courierId: string;
  waybillNo?: string;
  pickupCode?: string;
  assignedAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  status: TaskStatus;
  pickupLocation: LocationEntity;
  deliveryLocation: LocationEntity;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  notes?: string;
}

export class CourierPerformanceEntity {
  courierId: string;
  period: string; // YYYY-MM format
  totalTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  averageRating: number;
  averagePickupTime: number; // minutes
  averageDeliveryTime: number; // minutes
  onTimeRate: number; // percentage
  customerSatisfactionRate: number; // percentage
}