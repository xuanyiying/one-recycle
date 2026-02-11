import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
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
import { OrderQueueService } from '../../queue/services/order-queue.service';
import { InventoryService } from '@/modules/inventory/services/inventory.service';
import { AccountService } from '@/modules/account/account.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { PaymentProvider } from '@prisma/client';

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
    private readonly inventoryService: InventoryService,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => OrderQueueService))
    private readonly orderQueueService: OrderQueueService,
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
          address: true,
        },
      });

      const photoIds = items
        .flatMap((item) => (Array.isArray(item.photos) ? item.photos : []))
        .filter((photoId) => typeof photoId === 'string' && photoId.length > 0);

      if (photoIds.length > 0) {
        const uniquePhotoIds = Array.from(new Set(photoIds));
        const transactionClient = prisma as any;
        const storageFiles = await transactionClient.storage.findMany({
          where: { id: { in: uniquePhotoIds } },
        });

        if (storageFiles.length > 0) {
          await transactionClient.orderPhoto.createMany({
            data: storageFiles.map((file: any) => ({
              orderId: order.id,
              storageId: file.id,
              filename: file.filename,
              originalName: file.originalName,
              photoUrl: file.fileUrl,
              filePath: file.filePath,
              fileSize: file.fileSize,
              mimeType: file.mimeType,
              hashMd5: file.hashMd5,
              fileType: file.fileType,
              category: file.category,
              thumbnailUrl: file.thumbnailUrl,
              ossType: file.ossType,
            })),
            skipDuplicates: true,
          });
        }
      }

      return order;
    });

    // 发送订单创建消息到队列
    await this.orderQueueService.handleOrderCreated({
      orderId: order.id.toString(),
      userId: order.userId.toString(),
      items: order.items.map((item) => ({
        categoryId: item.categoryId.toString(),
        quantity: item.quantity,
        estimatedPrice: item.unitPrice,
        weight: item.estimatedWeight,
        condition: item.condition || undefined,
        description: item.notes || undefined,
      })),
      address: {
        id: order.addressId.toString(),
        fullAddress: order.address.detail || '',
        coordinates:
          order.latitude && order.longitude
            ? {
                lat: order.latitude,
                lng: order.longitude,
              }
            : undefined,
      },
      scheduledTime:
        order.expectPickupTime?.toISOString() || new Date().toISOString(),
      totalAmount: order.estimatedAmount,
      createdAt: order.createdAt.toISOString(),
      orderType: order.orderType,
    });

    return this.mapToOrder(order);
  }

  /**
   * 保存派单结果（事务操作：创建物流单 + 更新订单状态）
   */
  async saveDispatchResult(
    orderId: string,
    logisticsData: {
      logisticsNo: string;
      logisticsCompany: string;
      status: string;
      senderName?: string;
      senderPhone?: string;
      senderAddress?: string;
      receiverName?: string;
      receiverPhone?: string;
      receiverAddress?: string;
      estimatedPickupTime?: Date;
      estimatedDeliveryTime?: Date;
      providerData?: any;
    },
  ): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      // 1. 创建物流单
      await prisma.logisticsOrder.create({
        data: {
          orderId: BigInt(orderId),
          logisticsNo: logisticsData.logisticsNo,
          logisticsCompany: logisticsData.logisticsCompany,
          status: logisticsData.status,
          senderName: logisticsData.senderName,
          senderPhone: logisticsData.senderPhone,
          senderAddress: logisticsData.senderAddress,
          receiverName: logisticsData.receiverName,
          receiverPhone: logisticsData.receiverPhone,
          receiverAddress: logisticsData.receiverAddress,
          estimatedPickupTime: logisticsData.estimatedPickupTime,
          estimatedDeliveryTime: logisticsData.estimatedDeliveryTime,
          providerData: logisticsData.providerData,
        },
      });

      // 2. 更新订单状态
      await prisma.order.update({
        where: { id: BigInt(orderId) },
        data: {
          status: OrderStatus.PENDING_PICKUP,
        },
      });
    });
  }

  /**
   * 创建物流订单记录
   */
  async createLogisticsOrder(
    orderId: string,
    logisticsData: {
      logisticsNo: string;
      logisticsCompany: string;
      status: string;
      senderName?: string;
      senderPhone?: string;
      senderAddress?: string;
      receiverName?: string;
      receiverPhone?: string;
      receiverAddress?: string;
      estimatedPickupTime?: Date;
      estimatedDeliveryTime?: Date;
      providerData?: any;
    },
  ): Promise<void> {
    await this.prisma.logisticsOrder.create({
      data: {
        orderId: BigInt(orderId),
        logisticsNo: logisticsData.logisticsNo,
        logisticsCompany: logisticsData.logisticsCompany,
        status: logisticsData.status,
        senderName: logisticsData.senderName,
        senderPhone: logisticsData.senderPhone,
        senderAddress: logisticsData.senderAddress,
        receiverName: logisticsData.receiverName,
        receiverPhone: logisticsData.receiverPhone,
        receiverAddress: logisticsData.receiverAddress,
        estimatedPickupTime: logisticsData.estimatedPickupTime,
        estimatedDeliveryTime: logisticsData.estimatedDeliveryTime,
        providerData: logisticsData.providerData,
      },
    });

    // Update order status if needed, e.g. to ASSIGNED
    // await this.updateOrderStatus(orderId, 'ASSIGNED');
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
          address: true,
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
        address: true,
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

  async updateStatus(id: number, data: UpdateOrderDto): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (data.status) {
      this.validateTransition(order.status, data.status);
    }

    return this.update(id, data);
  }

  async confirmOrder(id: number): Promise<Order> {
    return this.updateStatus(id, { status: OrderStatus.PENDING_PICKUP });
  }

  async updateLogisticsStatus(
    orderId: number,
    logisticsStatus: string,
    providerData?: any,
  ): Promise<Order> {
    const logisticsOrder = await this.prisma.logisticsOrder.findFirst({
      where: { orderId: BigInt(orderId) },
    });

    if (!logisticsOrder) {
      throw new NotFoundException('Logistics order not found');
    }

    await this.prisma.logisticsOrder.update({
      where: { id: logisticsOrder.id },
      data: {
        status: logisticsStatus,
        providerData: providerData ?? logisticsOrder.providerData,
      },
    });

    const normalized = logisticsStatus.toString().toUpperCase();
    const statusMap: Record<string, OrderStatus> = {
      PICKED_UP: OrderStatus.PICKED_UP,
      IN_TRANSIT: OrderStatus.IN_TRANSIT,
      ARRIVED: OrderStatus.PENDING_RECEIPT,
      DELIVERED: OrderStatus.PENDING_RECEIPT,
      RECEIVED: OrderStatus.PENDING_RECEIPT,
    };

    const mappedStatus = statusMap[normalized];
    if (mappedStatus) {
      return this.updateStatus(orderId, { status: mappedStatus });
    }

    return this.findOne(orderId);
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
   * 获取订单统计信息
   */
  async getStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalAmount: number;
  }> {
    const [totalOrders, pendingOrders, completedOrders, aggregateResult] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        this.prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
        this.prisma.order.aggregate({
          _sum: {
            settlementAmount: true,
          },
        }),
      ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalAmount: aggregateResult._sum.settlementAmount || 0,
    };
  }

  /**
   * 获取最近订单
   * @param limit 数量
   */
  async getRecentOrders(limit: number = 5): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        items: true,
        assignments: true,
        address: true,
      },
    });
    return orders.map((order) => this.mapToOrder(order));
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

  /**
   * 查找订单关联的物流单
   * @param orderId 订单ID
   */
  async findLogisticsOrder(orderId: string): Promise<any> {
    return this.prisma.logisticsOrder.findFirst({
      where: { orderId: BigInt(orderId) },
    });
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

  // State Machine Transitions

  async courierPickUp(id: number, time: Date = new Date()): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.PICKED_UP);
    return this.update(id, {
      status: OrderStatus.PICKED_UP,
      actualPickupTime: time.toISOString(),
    });
  }

  async startTransport(id: number): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.IN_TRANSIT);
    return this.update(id, { status: OrderStatus.IN_TRANSIT });
  }

  async arriveAtStation(id: number): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.PENDING_RECEIPT);
    return this.update(id, { status: OrderStatus.PENDING_RECEIPT });
  }

  async confirmReceipt(id: number): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.INSPECTING);
    return this.update(id, { status: OrderStatus.INSPECTING });
  }

  async finishInspection(
    id: number,
    result: {
      actualAmount: number;
      items?: {
        id: number;
        actualWeight: number;
        unitPrice?: number;
        condition?: string;
      }[];
    },
  ): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.INSPECTED);

    await this.prisma.$transaction(async (tx) => {
      // Update items if provided
      if (result.items && result.items.length > 0) {
        for (const item of result.items) {
          await tx.orderItem.update({
            where: { id: BigInt(item.id) },
            data: {
              actualWeight: item.actualWeight,
              unitPrice: item.unitPrice, // Optional update
              amount: item.unitPrice
                ? item.actualWeight * item.unitPrice
                : undefined,
              condition: item.condition,
            },
          });
        }
      }

      // Update order status and settlement amount
      await tx.order.update({
        where: { id: BigInt(id) },
        data: {
          status: OrderStatus.INSPECTED,
          settlementAmount: result.actualAmount,
        },
      });
    });

    return this.findById(id) as Promise<Order>;
  }

  async handleInspectionException(id: number, reason: string): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.INSPECTION_EXCEPTION);
    return this.update(id, {
      status: OrderStatus.INSPECTION_EXCEPTION,
      remark: `Exception: ${reason}`,
    });
  }

  async resolveException(
    id: number,
    resolution: 'RETRY' | 'MANUAL',
  ): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const nextStatus =
      resolution === 'RETRY'
        ? OrderStatus.INSPECTING
        : OrderStatus.MANUAL_PROCESSING;
    this.validateTransition(order.status, nextStatus);

    return this.update(id, { status: nextStatus });
  }

  async confirmInbound(id: number): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.INBOUNDED);

    // Call InventoryService to create items
    await this.inventoryService.createFromOrder(order as any);

    // Update to INBOUNDED
    await this.update(id, { status: OrderStatus.INBOUNDED });

    // Auto transition to PENDING_SETTLEMENT
    return this.update(id, { status: OrderStatus.PENDING_SETTLEMENT });
  }

  /**
   * AI Assisted Grading
   * Analyzes order item photos to suggest category and condition
   */
  async performAiGrading(id: number): Promise<any> {
    const order = (await this.findById(id)) as any;
    if (!order) throw new NotFoundException('Order not found');

    // Mock AI Analysis Logic
    // In production, this would call an external AI Vision API
    if (order.items) {
      const results = order.items.map((item: any) => {
        // Logic to analyze item.photos
        return {
          itemId: item.id.toString(),
          aiSuggestion: {
            category: 'Recyclable',
            condition: 'Good',
            confidence: 0.88,
            tags: ['plastic', 'bottle'],
          },
        };
      });
      return results;
    }
    return [];
  }

  async completeSettlement(
    id: number,
    options?: { method: PaymentProvider; accountInfo?: any },
  ): Promise<Order> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    this.validateTransition(order.status, OrderStatus.COMPLETED);

    // Perform settlement (deposit to user account or transfer)
    if (order.settlementAmount > 0) {
      const method = options?.method || PaymentProvider.BALANCE;

      if (method === PaymentProvider.BALANCE) {
        await this.accountService.deposit(
          order.userId,
          order.settlementAmount,
          order.id.toString(),
          `Recycle Order Settlement #${order.orderNo}`,
        );
      } else if (
        method === PaymentProvider.WECHAT ||
        method === PaymentProvider.ALIPAY
      ) {
        // Ensure we have account info
        // If not provided in options, try to find from UserIdentity
        let accountInfo = options?.accountInfo;
        if (!accountInfo) {
          const identity = await this.prisma.userIdentity.findFirst({
            where: {
              userId: BigInt(order.userId),
              provider: method === PaymentProvider.WECHAT ? 'wechat' : 'alipay',
            },
          });

          if (identity) {
            accountInfo = {
              openid: identity.openid,
              // Real name might be in User profile
              realName: (
                await this.prisma.user.findUnique({
                  where: { id: BigInt(order.userId) },
                })
              )?.realName,
            };
          }
        }

        if (!accountInfo || !accountInfo.openid) {
          throw new Error(`Missing account info for ${method} transfer`);
        }

        await this.paymentService.transferToUser(
          BigInt(order.userId),
          order.settlementAmount,
          method,
          accountInfo,
          `Recycle Order Settlement #${order.orderNo}`,
          BigInt(order.id),
        );
      }
    }

    return this.update(id, { status: OrderStatus.COMPLETED });
  }

  private validateTransition(current: string, target: string): void {
    const validTransitions: Record<string, string[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.PENDING_PICKUP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PENDING_PICKUP]: [
        OrderStatus.PICKED_UP,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
      [OrderStatus.IN_TRANSIT]: [OrderStatus.PENDING_RECEIPT],
      [OrderStatus.PENDING_RECEIPT]: [OrderStatus.INSPECTING],
      [OrderStatus.INSPECTING]: [
        OrderStatus.INSPECTED,
        OrderStatus.INSPECTION_EXCEPTION,
      ],
      [OrderStatus.INSPECTION_EXCEPTION]: [
        OrderStatus.MANUAL_PROCESSING,
        OrderStatus.INSPECTING,
      ],
      [OrderStatus.MANUAL_PROCESSING]: [
        OrderStatus.INSPECTED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.INSPECTED]: [OrderStatus.PENDING_INBOUND],
      [OrderStatus.PENDING_INBOUND]: [OrderStatus.INBOUNDED],
      [OrderStatus.INBOUNDED]: [OrderStatus.PENDING_SETTLEMENT],
      [OrderStatus.PENDING_SETTLEMENT]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
    };

    if (!validTransitions[current]?.includes(target)) {
      if (current === target) return;
      throw new BadRequestException(
        `Invalid state transition from ${current} to ${target}`,
      );
    }
  }
}
