import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { OrderService } from '../order/services/order.service';
import { CourierService } from '../courier/courier.service';
import { TaskStatus } from '@prisma/client';
import {
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  RedisService,
  OrderStatus,
} from '@/common';

@Injectable()
export class DispatchService implements OnModuleInit {
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly orderService: OrderService,
    private readonly courierService: CourierService,
  ) {
    this.idGenerator = new PersistentSnowflakeIdGenerator({
      workerId: this.configService.get<number>('SNOWFLAKE_WORKER_ID', 1),
      datacenterId: this.configService.get<number>(
        'SNOWFLAKE_DATACENTER_ID',
        1,
      ),
      stateStore: new RedisSnowflakeStateStore(this.redisService),
      stateKey: 'snowflake:state:dispatch',
      metricsKey: 'snowflake:dispatch',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.idGenerator.initialize();
  }

  async assignOrder(orderId: string, courierId: string) {
    const order = await this.orderService.findById(BigInt(orderId));
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    await this.courierService.findOne(courierId);

    const assignment = await this.prisma.orderAssignment.create({
      data: {
        orderId: BigInt(orderId),
        orderNo: order.orderNo,
        courierId,
        taskId: this.idGenerator.nextId().toString(),
        status: TaskStatus.ASSIGNED,
        pickupLocation: (order as any).address
          ? ({
              address: (order as any).address?.detail,
            } as any)
          : undefined,
      },
    });

    await this.orderService.update(BigInt(orderId), {
      status: OrderStatus.PENDING_PICKUP,
    } as any);
    return {
      success: true,
      orderId,
      courierId,
      assignmentId: assignment.id.toString(),
    };
  }

  async getAllAssignments() {
    return this.prisma.orderAssignment.findMany({
      orderBy: { assignedAt: 'desc' },
    });
  }

  async getAssignment(id: string) {
    const a = await this.prisma.orderAssignment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!a) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return a;
  }

  async updateAssignmentStatus(id: string, status: TaskStatus) {
    return this.prisma.orderAssignment.update({
      where: { id: BigInt(id) },
      data: { status },
    });
  }

  async acceptAssignment(id: string) {
    return this.prisma.orderAssignment.update({
      where: { id: BigInt(id) },
      data: { status: TaskStatus.ACCEPTED, acceptedAt: new Date() },
    });
  }

  async rejectAssignment(id: string) {
    return this.prisma.orderAssignment.update({
      where: { id: BigInt(id) },
      data: { status: TaskStatus.REJECTED },
    });
  }
}
