import { 
  CourierEntity, 
  PickupNotificationEntity, 
  TaskAssignmentEntity, 
  CourierPerformanceEntity,
  LocationEntity,
  WorkingHoursEntity,
  ContactEntity,
  GoodsEntity,
  NotificationResponseEntity,
  CourierStatus,
  NotificationPriority,
  NotificationStatus,
  TaskStatus
} from '../entities/courier.entity';

export interface CreateCourierData {
  name: string;
  phone: string;
  email?: string;
  workingHours: WorkingHoursEntity;
  serviceAreas: string[];
}

export interface UpdateCourierData {
  name?: string;
  phone?: string;
  email?: string;
  status?: CourierStatus;
  workingHours?: WorkingHoursEntity;
  serviceAreas?: string[];
  rating?: number;
}

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface CreatePickupNotificationData {
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
}

export interface NotificationResponseData {
  action: 'ACCEPT' | 'REJECT';
  reason?: string;
  estimatedArrivalTime?: Date;
  notes?: string;
}

export interface UpdateTaskStatusData {
  status: TaskStatus;
  notes?: string;
  actualDuration?: number;
}

export interface CourierFilters {
  status?: CourierStatus;
  serviceArea?: string;
  rating?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // km
  };
}

export interface TaskFilters {
  status?: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  orderId?: string;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  priority?: NotificationPriority;
  startDate?: Date;
  endDate?: Date;
}

export interface ICourierService {
  // Courier management
  createCourier(data: CreateCourierData): Promise<CourierEntity>;
  findOne(id: string): Promise<CourierEntity>;
  findAll(filters?: CourierFilters): Promise<CourierEntity[]>;
  update(id: string, data: UpdateCourierData): Promise<CourierEntity>;
  remove(id: string): Promise<{ success: boolean }>;
  updateLocation(id: string, location: UpdateLocationData): Promise<CourierEntity>;
  
  // Notification management
  createPickupNotification(data: CreatePickupNotificationData): Promise<PickupNotificationEntity>;
  respondToNotification(notificationId: string, courierId: string, response: NotificationResponseData): Promise<PickupNotificationEntity>;
  findNotifications(filters?: NotificationFilters): Promise<PickupNotificationEntity[]>;
  
  // Task management
  findCourierAssignments(courierId: string, filters?: TaskFilters): Promise<TaskAssignmentEntity[]>;
  updateTaskStatus(taskId: string, courierId: string, data: UpdateTaskStatusData): Promise<TaskAssignmentEntity>;
  
  // Performance
  getCourierPerformance(courierId: string, period: string): Promise<CourierPerformanceEntity>;
  
  // Utility methods
  findAvailableCouriers(serviceArea?: string, location?: { latitude: number; longitude: number; radius: number }): Promise<CourierEntity[]>;
  calculateDistance(from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }): number;
}