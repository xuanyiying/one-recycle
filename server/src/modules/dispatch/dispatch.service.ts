import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order/services/order.service';
import { CourierService } from '../courier/courier.service';
import { TaskStatus } from '@prisma/client';
import { SnowflakeIdGenerator, OrderStatus } from '@/common';

@Injectable()
export class DispatchService {
  private readonly idGenerator: SnowflakeIdGenerator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly orderService: OrderService,
    private readonly courierService: CourierService,
  ) {
    this.idGenerator = new SnowflakeIdGenerator({
      workerId: this.configService.get<number>('SNOWFLAKE_WORKER_ID', 1),
      datacenterId: this.configService.get<number>('SNOWFLAKE_DATACENTER_ID', 1),
    });
  }

  async assignOrder(orderId: string, courierId: string) {
    const order = await this.orderService.findById(Number(orderId));
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    await this.courierService.findOne(courierId);

    const assignment = await this.prisma.courierAssignment.create({
      data: {
        id: this.idGenerator.nextId(),
        orderId: BigInt(orderId),
        orderNo: order.orderNo,
        courierId,
        status: TaskStatus.ASSIGNED,
        pickupLocation: (order as any).address
          ? ({
              address: (order as any).address?.detail,
            } as any)
          : undefined,
      },
    });

    await this.orderService.update(Number(orderId), {
      status: OrderStatus.ASSIGNED,
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

  async updateAssignmentStatus(id: string, status: TaskStatus) {
    return this.prisma.courierAssignment.update({
      where: { id },
      data: { status },
    });
  }

  async acceptAssignment(id: string) {
    return this.prisma.courierAssignment.update({
      where: { id },
      data: { status: TaskStatus.ACCEPTED, acceptedAt: new Date() },
    });
  }

  async rejectAssignment(id: string) {
    return this.prisma.courierAssignment.update({
      where: { id },
      data: { status: TaskStatus.REJECTED },
    });
  }
}
