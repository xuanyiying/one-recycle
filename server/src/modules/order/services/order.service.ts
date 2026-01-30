import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  RedisService,
} from '@/common';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { OrderFilters, DayTimeSlots } from '../interfaces/order.interface';
import { Order, Prisma } from '@prisma/client';

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  private readonly defaultTimeSlots = [
    { start: '09:00', end: '11:00', quota: 5 },
    { start: '11:00', end: '13:00', quota: 5 },
    { start: '13:00', end: '15:00', quota: 5 },
    { start: '15:00', end: '17:00', quota: 5 },
    { start: '17:00', end: '19:00', quota: 5 },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.idGenerator = new PersistentSnowflakeIdGenerator({
      workerId: this.configService.get<number>('ORDER_WORKER_ID', 6),
      datacenterId: this.configService.get<number>('DATACENTER_ID', 1),
      stateStore: new RedisSnowflakeStateStore(this.redisService),
      stateKey: 'snowflake:state:order',
      metricsKey: 'snowflake:order',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.idGenerator.initialize();
  }

  /**
   * 释放时间槽
   * @param slotId 时间槽ID
   */
  async releaseTimeSlot(slotId: string): Promise<void> {
    const parts = slotId.split('_');
    if (parts.length >= 3) {
      const dateStr = parts[1];
      const index = parseInt(parts[2], 10);
      const key = `timeslot:usage:${dateStr}:${index}`;

      const current = await this.redisService.getClient().get(key);
      if (current && parseInt(current, 10) > 0) {
        await this.redisService.getClient().decr(key);
      }
    }
    console.log(`Released time slot: ${slotId}`);
  }

  async create(createOrderData: CreateOrderDto): Promise<Order> {
    // 兼容 CreateOrderDto 的变更
    // 1. 处理 timeSlotId -> expectPickupTime
    if (createOrderData.timeSlotId) {
      // 解析 slotId 格式: slot_2026-01-29_0
      const parts = createOrderData.timeSlotId.split('_');
      if (parts.length >= 3) {
        const dateStr = parts[1];
        const index = parseInt(parts[2], 10);

        // 预占时间槽
        const key = `timeslot:usage:${dateStr}:${index}`;
        const count = await this.redisService.getClient().incr(key);

        // 检查配额 (假设默认配额为5)
        const quota = this.defaultTimeSlots[index]?.quota || 5;
        if (count > quota) {
          await this.redisService.getClient().decr(key);
          throw new Error('Time slot is fully booked');
        }

        if (!createOrderData.expectPickupTime) {
          // 简单映射：假设 index 0 是 09:00, index 1 是 11:00...
          const timeSlot = this.defaultTimeSlots[index];
          if (timeSlot) {
            createOrderData.expectPickupTime = new Date(
              `${dateStr}T${timeSlot.start}:00`,
            ).toISOString();
          }
        }
      } else if (parts.length >= 2 && !createOrderData.expectPickupTime) {
        // Fallback for old format if any or partial parse
        const dateStr = parts[1];
        createOrderData.expectPickupTime = new Date(
          `${dateStr}T09:00:00`,
        ).toISOString();
      }
    }

    // 2. 处理 items 中的 weight -> estimatedWeight, categoryId string -> int
    const items = createOrderData.items.map((item) => ({
      ...item,
      categoryId:
        typeof item.categoryId === 'string'
          ? parseInt(item.categoryId, 10)
          : item.categoryId,
      estimatedWeight: item.weight || item.estimatedWeight || 0,
      unitPrice: item.unitPrice || 0,
    }));

    // 3. 处理 notes -> remark
    const remark = createOrderData.notes || createOrderData.remark;

    // 4. 处理 userId 缺失
    if (!createOrderData.userId) {
      throw new Error('User ID is required');
    }

    // 检查用户是否存在
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(createOrderData.userId) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const order = await this.prisma.$transaction(async (prisma) => {
      // 生成订单号
      const orderNo = await this.idGenerator.nextId();

      // 创建订单
      const order = await prisma.order.create({
        data: {
          orderNo: orderNo.toString(),
          userId: BigInt(createOrderData.userId!),
          addressId: BigInt(createOrderData.addressId),
          status: createOrderData.status || OrderStatus.PENDING,
          channel: createOrderData.channel || 'APP',
          remark: remark,
          expectPickupTime: createOrderData.expectPickupTime
            ? new Date(createOrderData.expectPickupTime)
            : undefined,
          estimatedAmount: 0,
          settlementAmount: 0,
          payAmount: 0,
          items: {
            create: items.map((item) => ({
              category: { connect: { id: item.categoryId } },
              estimatedWeight: item.estimatedWeight,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice,
              amount: (item.quantity || 1) * item.unitPrice,
              condition: item.condition,
              brandModel: item.brandModel,
              notes: item.notes,
              photos: item.photos,
            })),
          },
        },
        include: {
          items: true,
          assignments: true,
        },
      });

      return order;
    });

    return this.mapToOrder(order);
  }

  /**
   * 获取订单列表
   * @param filters 筛选条件
   * @param page 页码
   * @param limit 每页数量
   */
  async findAll(
    filters: OrderFilters,
    page?: number,
    limit?: number,
  ): Promise<{ orders: Order[]; total: number }> {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.userId) {
      where.userId = BigInt(filters.userId);
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.orderType) {
      where.orderType = filters.orderType;
    }

    const skip = page && limit ? (page - 1) * limit : undefined;
    const take = limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          assignments: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => this.mapToOrder(order)),
      total,
    };
  }

  /**
   * 获取订单详情
   * @param id 订单ID
   */
  async findOne(id: number): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        assignments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapToOrder(order);
  }

  async findById(id: number): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        assignments: true,
      },
    });

    return order ? this.mapToOrder(order) : null;
  }

  /**
   * 更新订单
   * @param id 订单ID
   * @param data 更新数据
   */
  async update(id: number, data: UpdateOrderDto): Promise<Order> {
    const updateData: Prisma.OrderUpdateInput = {};

    if (data.status) updateData.status = data.status;
    if (data.expectPickupTime)
      updateData.expectPickupTime = new Date(data.expectPickupTime);
    if (data.actualPickupTime)
      updateData.actualPickupTime = new Date(data.actualPickupTime);
    if (data.expectDeliveryTime)
      updateData.expectDeliveryTime = new Date(data.expectDeliveryTime);
    if (data.actualDeliveryTime)
      updateData.actualDeliveryTime = new Date(data.actualDeliveryTime);
    if (data.settlementAmount !== undefined)
      updateData.settlementAmount = data.settlementAmount;
    if (data.payAmount !== undefined) updateData.payAmount = data.payAmount;
    if (data.remark) updateData.remark = data.remark;
    if (data.priority) updateData.priority = data.priority as unknown as number;

    const order = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        items: true,
        assignments: true,
      },
    });

    return this.mapToOrder(order);
  }

  /**
   * 取消订单
   * @param id 订单ID
   */
  async cancel(id: number): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: true,
        assignments: true,
      },
    });

    return this.mapToOrder(order);
  }

  /**
   * 删除订单
   * @param id 订单ID
   */
  async remove(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id: BigInt(id) },
    });
  }

  /**
   * 批量获取时间段
   * @param startDate 开始日期
   * @param daysCount 天数
   * @param addressId 地址ID
   */
  async getBatchTimeSlots(
    startDate: string,
    daysCount: number,
    addressId?: string | number,
  ): Promise<DayTimeSlots[]> {
    const slots: DayTimeSlots[] = [];
    const start = new Date(startDate);

    // Validate date
    if (isNaN(start.getTime())) {
      throw new Error('Invalid start date');
    }

    // Collect all keys to fetch
    const keys: string[] = [];
    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      for (let j = 0; j < this.defaultTimeSlots.length; j++) {
        keys.push(`timeslot:usage:${dateStr}:${j}`);
      }
    }

    // Fetch usages
    const usages = await this.redisService.mget<string>(keys);

    // Map back
    let keyIndex = 0;
    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const daySlots = this.defaultTimeSlots.map((range, index) => {
        const usageStr = usages[keyIndex++];
        const used = usageStr ? parseInt(String(usageStr), 10) : 0;
        const remaining = Math.max(0, range.quota - used);

        return {
          startTime: range.start,
          endTime: range.end,
          isAvailable: remaining > 0,
          quota: range.quota,
          remaining: remaining,
        };
      });

      slots.push({
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        slots: daySlots,
      });
    }

    return slots;
  }

  // 兼容旧版方法
  async createRecycleOrder(data: CreateOrderDto): Promise<Order> {
    return this.create(data);
  }

  async createSaleOrder(data: CreateOrderDto): Promise<Order> {
    return this.create(data);
  }

  private mapToOrder(order: any): Order {
    const baseOrder: any = {
      ...order,
      id: Number(order.id),
      userId: Number(order.userId),
      addressId: Number(order.addressId),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    if (order.items) {
      baseOrder.items = order.items.map((item: any) => ({
        ...item,
        id: Number(item.id),
        orderId: Number(item.orderId),
        categoryId: Number(item.categoryId),
      }));
    }

    if (order.assignments) {
      baseOrder.assignments = order.assignments.map((assignment: any) => ({
        ...assignment,
        id: Number(assignment.id),
        orderId: Number(assignment.orderId),
        courierId: Number(assignment.courierId),
      }));
    }

    return baseOrder as Order;
  }
}
