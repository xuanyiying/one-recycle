import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SnowflakeIdGenerator } from '@one-recycle/shared';
import { 
  ICourierService,
  CreateCourierData,
  UpdateCourierData,
  UpdateLocationData,
  CreatePickupNotificationData,
  NotificationResponseData,
  UpdateTaskStatusData,
  CourierFilters,
  TaskFilters,
  NotificationFilters
} from '../interfaces/courier.interface';
import { 
  CourierEntity, 
  PickupNotificationEntity, 
  TaskAssignmentEntity, 
  CourierPerformanceEntity,
  CourierStatus,
  NotificationStatus,
  TaskStatus
} from '../entities/courier.entity';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class CourierService implements ICourierService {
  private readonly logger = new Logger(CourierService.name);
  private readonly httpClient: AxiosInstance;
  private readonly dispatchServiceUrl: string;
  private readonly notificationServiceUrl: string;
  private readonly idGenerator: SnowflakeIdGenerator;
  
  // 模拟数据存储 - 实际应用中应使用数据库
  private couriers: Map<string, CourierEntity> = new Map();
  private notifications: Map<string, PickupNotificationEntity> = new Map();
  private taskAssignments: Map<string, TaskAssignmentEntity> = new Map();

  constructor() {
    this.dispatchServiceUrl = process.env.DISPATCH_SERVICE_URL || 'http://localhost:3003';
    this.notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
    
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 初始化雪花算法ID生成器
    this.idGenerator = new SnowflakeIdGenerator({
      workerId: 8,
      datacenterId: 1
    });

    this.initializeTestData();
  }

  async createCourier(data: CreateCourierData): Promise<CourierEntity> {
    const id = this.generateCourierId();
    
    const courier: CourierEntity = {
      id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      status: CourierStatus.OFFLINE,
      workingHours: data.workingHours,
      serviceAreas: data.serviceAreas,
      rating: 5.0,
      totalOrders: 0,
      completedOrders: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.couriers.set(id, courier);
    this.logger.log(`Created courier: ${id}`);
    
    return courier;
  }

  async findOne(id: string): Promise<CourierEntity> {
    const courier = this.couriers.get(id);
    if (!courier) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }
    return courier;
  }

  async findAll(filters?: CourierFilters): Promise<CourierEntity[]> {
    let couriers = Array.from(this.couriers.values());

    if (filters) {
      if (filters.status) {
        couriers = couriers.filter(c => c.status === filters.status);
      }
      if (filters.serviceArea) {
        couriers = couriers.filter(c => c.serviceAreas.includes(filters.serviceArea!));
      }
      if (filters.rating) {
        couriers = couriers.filter(c => c.rating >= filters.rating!);
      }
      if (filters.location) {
        couriers = couriers.filter(c => {
          if (!c.location) return false;
          const distance = this.calculateDistance(
            { latitude: c.location.latitude, longitude: c.location.longitude },
            { latitude: filters.location!.latitude, longitude: filters.location!.longitude }
          );
          return distance <= filters.location!.radius;
        });
      }
    }

    return couriers;
  }

  async update(id: string, data: UpdateCourierData): Promise<CourierEntity> {
    const courier = await this.findOne(id);
    
    Object.assign(courier, {
      ...data,
      updatedAt: new Date(),
    });

    this.couriers.set(id, courier);
    this.logger.log(`Updated courier: ${id}`);
    
    return courier;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const courier = await this.findOne(id);
    
    this.couriers.delete(id);
    this.logger.log(`Deleted courier: ${id}`);
    
    return { success: true };
  }

  async updateLocation(id: string, location: UpdateLocationData): Promise<CourierEntity> {
    const courier = await this.findOne(id);
    
    courier.location = {
      ...location,
      updatedAt: new Date(),
    };
    courier.updatedAt = new Date();

    this.couriers.set(id, courier);
    this.logger.log(`Updated location for courier: ${id}`);
    
    return courier;
  }

  async createPickupNotification(data: CreatePickupNotificationData): Promise<PickupNotificationEntity> {
    const id = this.generateNotificationId();
    
    // 验证快递员存在
    await this.findOne(data.courierId);

    const notification: PickupNotificationEntity = {
      id,
      ...data,
      status: NotificationStatus.PENDING,
      createdAt: new Date(),
    };

    this.notifications.set(id, notification);
    
    // 发送推送通知
    try {
      await this.sendPushNotification(data.courierId, notification);
      notification.status = NotificationStatus.SENT;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
    }

    this.notifications.set(id, notification);
    this.logger.log(`Created pickup notification: ${id}`);
    
    return notification;
  }

  async respondToNotification(
    notificationId: string, 
    courierId: string, 
    response: NotificationResponseData
  ): Promise<PickupNotificationEntity> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    if (notification.courierId !== courierId) {
      throw new BadRequestException('Courier not authorized for this notification');
    }

    if (notification.status !== NotificationStatus.SENT && notification.status !== NotificationStatus.READ) {
      throw new BadRequestException('Notification cannot be responded to in current status');
    }

    notification.response = response;
    notification.respondedAt = new Date();
    notification.status = response.action === 'ACCEPT' ? NotificationStatus.ACCEPTED : NotificationStatus.REJECTED;

    this.notifications.set(notificationId, notification);

    // 如果接受，创建任务分配
    if (response.action === 'ACCEPT') {
      await this.createTaskAssignment(notification);
    } else {
      // 如果拒绝，重新分配任务
      await this.reassignTask(notification);
    }

    // 通知调度服务
    try {
      await this.notifyDispatchService(notification, response);
    } catch (error) {
      this.logger.error(`Failed to notify dispatch service: ${error.message}`);
    }

    this.logger.log(`Courier ${courierId} responded to notification ${notificationId}: ${response.action}`);
    
    return notification;
  }

  async findNotifications(filters?: NotificationFilters): Promise<PickupNotificationEntity[]> {
    let notifications = Array.from(this.notifications.values());

    if (filters) {
      if (filters.status) {
        notifications = notifications.filter(n => n.status === filters.status);
      }
      if (filters.priority) {
        notifications = notifications.filter(n => n.priority === filters.priority);
      }
      if (filters.startDate) {
        notifications = notifications.filter(n => n.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        notifications = notifications.filter(n => n.createdAt <= filters.endDate!);
      }
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findCourierAssignments(courierId: string, filters?: TaskFilters): Promise<TaskAssignmentEntity[]> {
    let assignments = Array.from(this.taskAssignments.values())
      .filter(a => a.courierId === courierId);

    if (filters) {
      if (filters.status) {
        assignments = assignments.filter(a => a.status === filters.status);
      }
      if (filters.startDate) {
        assignments = assignments.filter(a => a.assignedAt >= filters.startDate!);
      }
      if (filters.endDate) {
        assignments = assignments.filter(a => a.assignedAt <= filters.endDate!);
      }
      if (filters.orderId) {
        assignments = assignments.filter(a => a.orderId === filters.orderId);
      }
    }

    return assignments.sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());
  }

  async updateTaskStatus(
    taskId: string, 
    courierId: string, 
    data: UpdateTaskStatusData
  ): Promise<TaskAssignmentEntity> {
    const assignment = this.taskAssignments.get(taskId);
    if (!assignment) {
      throw new NotFoundException(`Task assignment with ID ${taskId} not found`);
    }

    if (assignment.courierId !== courierId) {
      throw new BadRequestException('Courier not authorized for this task');
    }

    // 验证状态转换
    this.validateStatusTransition(assignment.status, data.status);

    const now = new Date();
    assignment.status = data.status;
    assignment.notes = data.notes;

    switch (data.status) {
      case TaskStatus.ACCEPTED:
        assignment.acceptedAt = now;
        break;
      case TaskStatus.IN_PROGRESS:
        assignment.startedAt = now;
        break;
      case TaskStatus.DELIVERED:
        assignment.completedAt = now;
        if (assignment.startedAt) {
          assignment.actualDuration = Math.floor(
            (now.getTime() - assignment.startedAt.getTime()) / (1000 * 60)
          );
        }
        break;
    }

    if (data.actualDuration !== undefined) {
      assignment.actualDuration = data.actualDuration;
    }

    this.taskAssignments.set(taskId, assignment);

    // 通知调度服务状态变更
    try {
      await this.notifyTaskStatusChange(assignment);
    } catch (error) {
      this.logger.error(`Failed to notify task status change: ${error.message}`);
    }

    this.logger.log(`Updated task ${taskId} status to ${data.status}`);
    
    return assignment;
  }

  async getCourierPerformance(courierId: string, period: string): Promise<CourierPerformanceEntity> {
    await this.findOne(courierId); // 验证快递员存在

    const assignments = await this.findCourierAssignments(courierId);
    
    // 根据期间过滤任务
    const periodAssignments = assignments.filter(a => {
      const assignedMonth = a.assignedAt.toISOString().substring(0, 7); // YYYY-MM
      return assignedMonth === period;
    });

    const totalTasks = periodAssignments.length;
    const completedTasks = periodAssignments.filter(a => a.status === TaskStatus.DELIVERED).length;
    const cancelledTasks = periodAssignments.filter(a => 
      a.status === TaskStatus.CANCELLED || a.status === TaskStatus.FAILED
    ).length;

    const completedAssignments = periodAssignments.filter(a => a.completedAt);
    const averagePickupTime = completedAssignments.length > 0 
      ? completedAssignments.reduce((sum, a) => sum + (a.actualDuration || 0), 0) / completedAssignments.length
      : 0;

    const courier = await this.findOne(courierId);

    return {
      courierId,
      period,
      totalTasks,
      completedTasks,
      cancelledTasks,
      averageRating: courier.rating,
      averagePickupTime,
      averageDeliveryTime: averagePickupTime, // 简化处理
      onTimeRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      customerSatisfactionRate: courier.rating * 20, // 转换为百分比
    };
  }

  async findAvailableCouriers(
    serviceArea?: string, 
    location?: { latitude: number; longitude: number; radius: number }
  ): Promise<CourierEntity[]> {
    const filters: CourierFilters = {
      status: CourierStatus.AVAILABLE,
    };

    if (serviceArea) {
      filters.serviceArea = serviceArea;
    }

    if (location) {
      filters.location = location;
    }

    return this.findAll(filters);
  }

  calculateDistance(
    from: { latitude: number; longitude: number }, 
    to: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) * Math.cos(this.toRadians(to.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private validateStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus): void {
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.ASSIGNED]: [TaskStatus.ACCEPTED, TaskStatus.REJECTED],
      [TaskStatus.ACCEPTED]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.REJECTED]: [],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.PICKED_UP, TaskStatus.FAILED],
      [TaskStatus.PICKED_UP]: [TaskStatus.IN_TRANSIT],
      [TaskStatus.IN_TRANSIT]: [TaskStatus.DELIVERED, TaskStatus.FAILED],
      [TaskStatus.DELIVERED]: [],
      [TaskStatus.FAILED]: [],
      [TaskStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  private async createTaskAssignment(notification: PickupNotificationEntity): Promise<TaskAssignmentEntity> {
    const id = this.generateAssignmentId();
    
    const assignment: TaskAssignmentEntity = {
      id,
      taskId: notification.taskId,
      orderId: notification.orderId,
      orderNo: notification.orderNo,
      courierId: notification.courierId,
      waybillNo: notification.waybillNo,
      pickupCode: notification.pickupCode,
      assignedAt: new Date(),
      status: TaskStatus.ASSIGNED,
      pickupLocation: {
        latitude: notification.senderInfo.latitude || 0,
        longitude: notification.senderInfo.longitude || 0,
        address: notification.senderInfo.address,
        updatedAt: new Date(),
      },
      deliveryLocation: {
        latitude: notification.receiverInfo.latitude || 0,
        longitude: notification.receiverInfo.longitude || 0,
        address: notification.receiverInfo.address,
        updatedAt: new Date(),
      },
      estimatedDuration: 60, // 默认60分钟
    };

    this.taskAssignments.set(id, assignment);
    this.logger.log(`Created task assignment: ${id}`);
    
    return assignment;
  }

  private async sendPushNotification(courierId: string, notification: PickupNotificationEntity): Promise<void> {
    try {
      await this.httpClient.post(`${this.notificationServiceUrl}/push`, {
        courierId,
        title: '新的取件通知',
        message: `订单 ${notification.orderNo} 需要取件`,
        data: notification,
      });
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  private async notifyDispatchService(
    notification: PickupNotificationEntity, 
    response: NotificationResponseData
  ): Promise<void> {
    try {
      await this.httpClient.post(`${this.dispatchServiceUrl}/notification-response`, {
        notificationId: notification.id,
        courierId: notification.courierId,
        response,
      });
    } catch (error) {
      this.logger.error(`Failed to notify dispatch service: ${error.message}`);
      throw error;
    }
  }

  private async notifyTaskStatusChange(assignment: TaskAssignmentEntity): Promise<void> {
    try {
      await this.httpClient.post(`${this.dispatchServiceUrl}/task-status`, {
        taskId: assignment.taskId,
        status: assignment.status,
        courierId: assignment.courierId,
        notes: assignment.notes,
      });
    } catch (error) {
      this.logger.error(`Failed to notify task status change: ${error.message}`);
      throw error;
    }
  }

  private async reassignTask(notification: PickupNotificationEntity): Promise<void> {
    try {
      await this.httpClient.post(`${this.dispatchServiceUrl}/reassign-task`, {
        taskId: notification.taskId,
        rejectedCourierId: notification.courierId,
        reason: notification.response?.reason,
      });
    } catch (error) {
      this.logger.error(`Failed to reassign task: ${error.message}`);
      throw error;
    }
  }

  private initializeTestData(): void {
    // 初始化测试数据
    const testCourier: CourierEntity = {
      id: 'courier-001',
      name: '张三',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      status: CourierStatus.AVAILABLE,
      location: {
        latitude: 39.9042,
        longitude: 116.4074,
        address: '北京市朝阳区',
        updatedAt: new Date(),
      },
      workingHours: {
        startTime: '08:00',
        endTime: '18:00',
        workingDays: [1, 2, 3, 4, 5],
      },
      serviceAreas: ['朝阳区', '海淀区'],
      rating: 4.8,
      totalOrders: 150,
      completedOrders: 145,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.couriers.set(testCourier.id, testCourier);
  }

  private generateCourierId(): string {
    return `courier-${this.idGenerator.nextId()}`;
  }

  private generateNotificationId(): string {
    return `notification-${this.idGenerator.nextId()}`;
  }

  private generateAssignmentId(): string {
    return `assignment-${this.idGenerator.nextId()}`;
  }
}