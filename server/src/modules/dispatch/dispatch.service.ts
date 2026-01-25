import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderService } from '../order/services/order.service';
import { CourierService } from '../courier/courier.service';

@Injectable()
export class DispatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
    private readonly courierService: CourierService,
  ) {}

  async assignOrder(orderId: string, courierId: string) {
    const order = await this.orderService.findById(Number(orderId));
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    await this.courierService.findOne(courierId);

    const assignment = await this.prisma.courierAssignment.create({
      data: {
        id: `assignment-${Date.now()}`,
        orderId: BigInt(orderId),
        orderNo: order.orderNo,
        courierId,
        status: 'ASSIGNED' as any,
        pickupLocation: (order as any).address
          ? ({
              address: (order as any).address?.detail,
            } as any)
          : undefined,
      },
    });

    await this.orderService.update(Number(orderId), {
      status: 'CONFIRMED' as any,
    } as any);
    return { success: true, orderId, courierId, assignmentId: assignment.id };
  }

  async getAllAssignments() {
    return this.prisma.courierAssignment.findMany({
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getAssignment(id: string) {
    const a = await this.prisma.courierAssignment.findUnique({ where: { id } });
    if (!a) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return a;
  }

  async updateAssignmentStatus(id: string, status: string) {
    return this.prisma.courierAssignment.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async acceptAssignment(id: string) {
    return this.prisma.courierAssignment.update({
      where: { id },
      data: { status: 'ACCEPTED' as any, acceptedAt: new Date() },
    });
  }

  async rejectAssignment(id: string) {
    return this.prisma.courierAssignment.update({
      where: { id },
      data: { status: 'REJECTED' as any },
    });
  }
}
