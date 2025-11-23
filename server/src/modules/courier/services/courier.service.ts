import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCourierDto } from '../dto/create-courier.dto';
import { UpdateCourierDto } from '../dto/update-courier.dto';
import { CreatePickupNotificationDto } from '../dto/create-notification.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { UpdateTaskStatusDto } from '../dto/update-task.dto';

@Injectable()
export class CourierService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourier(data: CreateCourierDto) {
    return this.prisma.courier.create({
      data: {
        id: `courier-${Date.now()}`,
        name: data.name,
        phone: data.phone,
        email: data.email,
        workingHours: (data.workingHours as any) || undefined,
        serviceAreas: data.serviceAreas || [],
        status: 'OFFLINE' as any,
      },
    });
  }

  async findOne(id: string) {
    const courier = await this.prisma.courier.findUnique({ where: { id } });
    if (!courier) throw new NotFoundException(`Courier with ID ${id} not found`);
    return courier;
  }

  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.status) where.status = filters.status as any;
    if (filters?.serviceArea) where.serviceAreas = { has: filters.serviceArea };
    if (filters?.rating) where.rating = { gte: Number(filters.rating) };

    const couriers = await this.prisma.courier.findMany({ where });

    if (filters?.location) {
      const { latitude, longitude, radius } = filters.location;
      return couriers.filter((c) => {
        if (c.latitude == null || c.longitude == null) return false;
        const d = this.calculateDistance(
          { latitude: c.latitude, longitude: c.longitude },
          { latitude, longitude },
        );
        return d <= radius;
      });
    }

    return couriers;
  }

  async update(id: string, data: UpdateCourierDto) {
    await this.findOne(id);
    return this.prisma.courier.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        status: (data.status as any) || undefined,
        workingHours: (data.workingHours as any) || undefined,
        serviceAreas: data.serviceAreas,
        rating: (data.rating as any) || undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.courier.delete({ where: { id } });
    return { success: true };
  }

  async updateLocation(id: string, location: { latitude: number; longitude: number; address?: string }) {
    await this.findOne(id);
    return this.prisma.courier.update({
      where: { id },
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        status: 'AVAILABLE' as any,
      },
    });
  }

  async createPickupNotification(data: CreatePickupNotificationDto) {
    await this.findOne(data.courierId);
    return this.prisma.pickupNotification.create({
      data: {
        id: `notification-${Date.now()}`,
        taskId: data.taskId,
        orderId: BigInt(data.orderId),
        orderNo: data.orderNo,
        courierId: data.courierId,
        waybillNo: data.waybillNo || undefined,
        pickupCode: data.pickupCode || undefined,
        senderInfo: data.senderInfo as any,
        receiverInfo: data.receiverInfo as any,
        priority: data.priority,
        status: 'PENDING',
      },
    });
  }

  async respondToNotification(notificationId: string, courierId: string, response: NotificationResponseDto) {
    const notification = await this.prisma.pickupNotification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    if (notification.courierId !== courierId) {
      throw new BadRequestException('Courier not authorized for this notification');
    }

    const status = response.action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';

    const updated = await this.prisma.pickupNotification.update({
      where: { id: notificationId },
      data: {
        status,
        respondedAt: new Date(),
        response: response as any,
      },
    });

    if (response.action === 'ACCEPT') {
      await this.prisma.courierAssignment.create({
        data: {
          id: `assignment-${Date.now()}`,
          taskId: notification.taskId,
          orderId: notification.orderId,
          orderNo: notification.orderNo,
          courierId: notification.courierId,
          waybillNo: notification.waybillNo || undefined,
          pickupCode: notification.pickupCode || undefined,
          status: 'ASSIGNED' as any,
          pickupLocation: notification.senderInfo as any,
          deliveryLocation: notification.receiverInfo as any,
        },
      });
    }

    return updated;
  }

  async findNotifications(filters?: any) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.startDate) where.createdAt = { gte: filters.startDate };
    if (filters?.endDate) where.createdAt = { ...(where.createdAt || {}), lte: filters.endDate };
    return this.prisma.pickupNotification.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async findCourierAssignments(courierId: string, filters?: any) {
    const where: any = { courierId };
    if (filters?.status) where.status = filters.status as any;
    if (filters?.startDate) where.assignedAt = { gte: filters.startDate };
    if (filters?.endDate) where.assignedAt = { ...(where.assignedAt || {}), lte: filters.endDate };
    if (filters?.orderId) where.orderId = BigInt(filters.orderId);
    return this.prisma.courierAssignment.findMany({ where, orderBy: { assignedAt: 'desc' } });
  }

  async updateTaskStatus(taskId: string, courierId: string, data: UpdateTaskStatusDto) {
    const assignment = await this.prisma.courierAssignment.findUnique({ where: { id: taskId } });
    if (!assignment) throw new NotFoundException(`Task assignment with ID ${taskId} not found`);
    if (assignment.courierId !== courierId) {
      throw new BadRequestException('Courier not authorized for this task');
    }

    const now = new Date();
    const updateData: any = { status: data.status as any, notes: data.notes };
    switch (data.status) {
      case 'ACCEPTED':
        updateData.acceptedAt = now;
        break;
      case 'IN_PROGRESS':
        updateData.startedAt = now;
        break;
      case 'DELIVERED':
        updateData.completedAt = now;
        updateData.actualDuration = data.actualDuration;
        break;
      case 'CANCELLED':
        updateData.cancelledAt = now;
        break;
      case 'FAILED':
        updateData.failedAt = now;
        break;
    }

    return this.prisma.courierAssignment.update({ where: { id: taskId }, data: updateData });
  }

  async getCourierPerformance(courierId: string, period: string) {
    await this.findOne(courierId);
    const start = new Date(`${period}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const assignments = await this.prisma.courierAssignment.findMany({
      where: { courierId, assignedAt: { gte: start, lt: end } },
    });

    const totalTasks = assignments.length;
    const completedTasks = assignments.filter((a) => a.status === ('DELIVERED' as any)).length;
    const cancelledTasks = assignments.filter((a) => ['CANCELLED', 'FAILED'].includes(String(a.status))).length;

    const durations = assignments
      .filter((a) => a.completedAt && a.actualDuration != null)
      .map((a) => a.actualDuration as number);
    const averagePickupTime = durations.length > 0 ? Math.floor(durations.reduce((s, v) => s + v, 0) / durations.length) : 0;

    const courier = await this.findOne(courierId);
    return {
      courierId,
      period,
      totalTasks,
      completedTasks,
      cancelledTasks,
      averageRating: courier.rating,
      averagePickupTime,
      averageDeliveryTime: averagePickupTime,
      onTimeRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      customerSatisfactionRate: courier.rating * 20,
    };
  }

  async findAvailableCouriers(serviceArea?: string, location?: { latitude: number; longitude: number; radius: number }) {
    const filters: any = { status: 'AVAILABLE' };
    if (serviceArea) filters.serviceArea = serviceArea;
    if (location) filters.location = location;
    return this.findAll(filters);
  }

  calculateDistance(
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number },
  ): number {
    const R = 6371;
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) * Math.cos(this.toRadians(to.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

