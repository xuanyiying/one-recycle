import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Inject,
  forwardRef,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  RedisService,
  validateTransition as validateStateTransition,
  StateMachineError,
  isValidOrderStatus,
} from '@/common';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { OrderFilters, DayTimeSlots } from '../interfaces/order.interface';
import {
  InventoryTxnType,
  InboundStatus,
  InspectionResult,
  LogisticsStatus,
  Order,
  Prisma,
  ReservationStatus,
} from '@prisma/client';
import { toDecimal, toNumber } from '@/common/utils/decimal.util';
import { delay } from '@/common/utils/common.util';
import { OrderQueueService } from '../../queue/services/order-queue.service';
import { InventoryService } from '@/modules/inventory/services/inventory.service';
import { AccountService } from '@/modules/account/account.service';
import { PaymentService } from '@/modules/payment/payment.service';
import { PaymentProvider } from '@prisma/client';
import { CategoryWarehouseService } from '@/modules/category-warehouse/category-warehouse.service';

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly idGenerator: PersistentSnowflakeIdGenerator;
  private readonly logger = new Logger(OrderService.name);

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
    private readonly categoryWarehouseService: CategoryWarehouseService,
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

        // 预占时间槽 - 使用 Lua 脚本保证原子性（INCR + 配额检查 + 超额回滚）
        const key = `timeslot:usage:${dateStr}:${index}`;
        const quota = this.defaultTimeSlots[index]?.quota || 5;

        const luaScript = `
          local current = redis.call('INCR', KEYS[1])
          if current == 1 then
            local ttl = tonumber(ARGV[1])
            redis.call('EXPIRE', KEYS[1], ttl)
          end
          if current > tonumber(ARGV[2]) then
            redis.call('DECR', KEYS[1])
            return -1
          end
          return current
        `;

        // 设置 TTL：时间槽对应日期结束后的2小时过期，防止 Redis 键泄漏
        // 最短保留 48 小时（覆盖到次日结束），最长 7 天
        const slotDate = new Date(`${dateStr}T23:59:59`);
        const ttlSeconds = Math.max(
          48 * 3600,
          Math.floor((slotDate.getTime() - Date.now()) / 1000) + 2 * 3600,
        );
        const cappedTtl = Math.min(ttlSeconds, 7 * 24 * 3600);

        const result = await this.redisService.getClient().eval(
          luaScript,
          1,
          key,
          cappedTtl.toString(),
          quota.toString(),
        );

        if (Number(result) === -1) {
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
    const userId = this.parseBigInt(createOrderData.userId, 'userId');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const addressId = this.parseBigInt(createOrderData.addressId, 'addressId');
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // 根据主分类获取目标仓库
    let targetWarehouseId: bigint | undefined;
    if (items.length > 0) {
      const mainCategoryId = items[0].categoryId;
      const config =
        await this.categoryWarehouseService.findActiveByCategoryId(
          mainCategoryId,
        );
      if (config) {
        targetWarehouseId = BigInt(config.warehouseId);
      }
    }

    const order = await this.prisma.$transaction(async (prisma) => {
      // 生成订单号
      const orderNo = this.idGenerator.nextId();

      // 创建订单
      const order = await prisma.order.create({
        data: {
          orderNo: orderNo.toString(),
          userId: userId,
          addressId: addressId,
          targetWarehouseId: targetWarehouseId,
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
    await this.publishOrderCreatedEvent(order);

    const photoIds = this.extractPhotoIds([order]);
    const storageMap = await this.getStorageMap(photoIds);

    return this.mapToOrder(order, storageMap);
  }

  /**
   * 保存派单结果（事务操作：创建物流单 + 更新订单状态）
   */
  async saveDispatchResult(
    orderId: string,
    logisticsData: {
      logisticsNo: string;
      logisticsCompany: string;
      status: LogisticsStatus;
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
      const before = await prisma.order.findUnique({
        where: { id: BigInt(orderId) },
        select: { status: true },
      });

      // Validate state transition before making any changes
      if (before) {
        this.validateTransition(before.status, OrderStatus.PENDING_PICKUP);
      }

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

      await prisma.orderTimeline.create({
        data: {
          orderId: BigInt(orderId),
          status: OrderStatus.PENDING_PICKUP,
          fromStatus: before?.status ?? null,
          toStatus: OrderStatus.PENDING_PICKUP,
          message: `状态变更为 ${OrderStatus.PENDING_PICKUP}`,
          operator: 'SYSTEM',
          operatorType: 'SYSTEM',
          operatorId: null,
          reason: null,
          rawSnapshot: { action: 'saveDispatchResult' } as any,
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
      status: LogisticsStatus;
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
          targetWarehouse: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    const photoIds = this.extractPhotoIds(orders);
    const storageMap = await this.getStorageMap(photoIds);

    return {
      orders: orders.map((order) => this.mapToOrder(order, storageMap)),
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
        targetWarehouse: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const photoIds = this.extractPhotoIds([order]);
    const storageMap = await this.getStorageMap(photoIds);

    return this.mapToOrder(order, storageMap);
  }

  async findById(id: number | bigint): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        assignments: true,
      },
    });

    if (!order) {
      return null;
    }

    const photoIds = this.extractPhotoIds([order]);
    const storageMap = await this.getStorageMap(photoIds);

    return this.mapToOrder(order, storageMap);
  }

  /**
   * 更新订单
   * @param id 订单ID
   * @param data 更新数据
   * @param operator 操作人信息（用于状态变更日志）
   */
  async update(
    id: number | bigint,
    data: UpdateOrderDto,
    operator?: { id: string; role: string; type: string },
  ): Promise<Order> {
    if (operator !== undefined) {
      if (
        typeof operator.id !== 'string' ||
        operator.id.length === 0 ||
        typeof operator.role !== 'string' ||
        operator.role.length === 0 ||
        typeof operator.type !== 'string' ||
        operator.type.length === 0
      ) {
        throw new BadRequestException(
          'Invalid operator: must contain non-empty id, role, and type',
        );
      }
    }

    // 如果包含状态变更，直接使用 updateStatus（在事务内验证状态转换）
    if (data.status) {
      return this.updateStatus(id, data, operator);
    }

    // 不包含状态变更的普通更新
    const updateData: Prisma.OrderUpdateInput = {};

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

    // Update order item quantities in parallel
    if (data.items && data.items.length > 0) {
      await Promise.all(
        data.items.map((item) =>
          this.prisma.orderItem.update({
            where: { id: BigInt(item.id) },
            data: { quantity: item.quantity },
          }),
        ),
      );
    }

    const order = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        items: true,
        assignments: true,
      },
    });

    const photoIds = this.extractPhotoIds([order]);
    const storageMap = await this.getStorageMap(photoIds);

    return this.mapToOrder(order, storageMap);
  }

  async updateStatus(
    id: number | bigint,
    data: UpdateOrderDto,
    operator?: { id: string; role: string; type: string },
  ): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      // Read + validate inside transaction to prevent TOCTOU race condition
      const order = await tx.order.findUnique({
        where: { id: BigInt(id) },
        include: {
          items: true,
          assignments: true,
        },
      });
      if (!order) throw new NotFoundException('Order not found');

      if (data.status) {
        this.validateTransition(order.status, data.status);
      }
      const fromStatus = order.status;

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
        updateData.settlementAmount = toDecimal(data.settlementAmount);
      if (data.payAmount !== undefined)
        updateData.payAmount = toDecimal(data.payAmount);
      if (data.remark) updateData.remark = data.remark;
      if (data.priority) updateData.priority = data.priority as unknown as number;

      const updated = await tx.order.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: {
          items: true,
          assignments: true,
        },
      });

      if (data.status && data.status !== fromStatus) {
        await tx.orderTimeline.create({
          data: {
            orderId: BigInt(id),
            status: data.status,
            fromStatus: fromStatus,
            toStatus: data.status,
            message: `状态变更为 ${data.status}`,
            operator: operator?.type ?? 'SYSTEM',
            operatorType: operator?.role ?? 'SYSTEM',
            operatorId: operator?.id ? BigInt(operator.id) : null,
            reason: data.remark ?? null,
            rawSnapshot: data as any,
          },
        });
      }

      const photoIds = this.extractPhotoIds([updated]);
      const storageMap = await this.getStorageMap(photoIds);

      return this.mapToOrder(updated, storageMap);
    });
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

    const normalized = logisticsStatus.toString().toUpperCase();
    const statusEnum = (Object.values(LogisticsStatus) as string[]).includes(
      normalized,
    )
      ? (normalized as LogisticsStatus)
      : LogisticsStatus.FAILED;

    await this.prisma.logisticsOrder.update({
      where: { id: logisticsOrder.id },
      data: {
        status: statusEnum,
        providerStatus: normalized,
        providerData: providerData ?? logisticsOrder.providerData,
      },
    });

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
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: BigInt(id) },
        include: { items: true, assignments: true, reservations: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      this.validateTransition(order.status, OrderStatus.CANCELLED);

      const now = new Date();

      // Batch update all cancellable reservations
      const cancellableReservations = order.reservations.filter(
        (r) =>
          r.status !== ReservationStatus.CANCELLED &&
          r.status !== ReservationStatus.EXPIRED,
      );

      if (cancellableReservations.length > 0) {
        await tx.reservation.updateMany({
          where: {
            id: { in: cancellableReservations.map((r) => r.id) },
          },
          data: {
            status: ReservationStatus.CANCELLED,
            cancelledAt: now,
          },
        });

        // Batch process inventory items
        const inventoryUpdates = cancellableReservations.map((r) =>
          tx.inventoryItem.update({
            where: { id: r.itemId },
            data: {
              reservedQty: { decrement: r.quantity },
              availableQty: { increment: r.quantity },
            },
          }),
        );
        await Promise.all(inventoryUpdates);

        // Batch create inventory transactions
        const transactions = cancellableReservations.map(async (r) => {
          const item = await tx.inventoryItem.findUnique({
            where: { id: r.itemId },
          });
          const unitPrice = item ? new Prisma.Decimal(item.unitPrice) : new Prisma.Decimal(0);
          const qty = new Prisma.Decimal(r.quantity);
          return tx.inventoryTransaction.create({
            data: {
              itemId: r.itemId,
              type: InventoryTxnType.RELEASE,
              quantity: r.quantity,
              unitPrice,
              totalPrice: unitPrice.mul(qty),
              referenceId: order.id.toString(),
              notes: 'order:cancel:release',
            },
          });
        });
        await Promise.all(transactions);
      }

      const updated = await tx.order.update({
        where: { id: BigInt(id) },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true, assignments: true },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: BigInt(id),
          status: OrderStatus.CANCELLED,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          message: `状态变更为 ${OrderStatus.CANCELLED}`,
          operator: 'SYSTEM',
          operatorType: 'SYSTEM',
          operatorId: null,
          reason: null,
          rawSnapshot: { action: 'cancel' } as any,
        },
      });

      const photoIds = this.extractPhotoIds([updated]);
      const storageMap = await this.getStorageMap(photoIds);

      return this.mapToOrder(updated, storageMap);
    });
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
   * 导出订单（不分页，用于Excel导出）
   * @param filters 筛选条件
   */
  async exportOrders(filters: OrderFilters): Promise<Order[]> {
    const { orders } = await this.findAll(filters, 1, 10000);
    return orders;
  }

  /**
   * 批量删除订单
   * @param ids 订单ID数组
   */
  async batchDelete(ids: string[]): Promise<void> {
    await this.prisma.order.deleteMany({
      where: { id: { in: ids.map((id) => BigInt(id)) } },
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
      totalAmount: toNumber(aggregateResult._sum.settlementAmount),
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

    const photoIds = this.extractPhotoIds(orders);
    const storageMap = await this.getStorageMap(photoIds);

    return orders.map((order) => this.mapToOrder(order, storageMap));
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
    _addressId?: string | number,
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
          id: `slot_${dateStr}_${index}`,
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

  async getAvailableTimeSlots(
    date: string,
    addressId?: string | number,
  ): Promise<DayTimeSlots[]> {
    return this.getBatchTimeSlots(date, 1, addressId);
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

  private mapToOrder(
    order: any,
    storageMap?: Map<string, { fileUrl: string; thumbnailUrl?: string | null }>,
  ): Order {
    const baseOrder: any = {
      ...order,
      id: Number(order.id),
      userId: Number(order.userId),
      addressId: Number(order.addressId),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    if (order.estimatedAmount !== undefined)
      baseOrder.estimatedAmount = toNumber(order.estimatedAmount);
    if (order.settlementAmount !== undefined)
      baseOrder.settlementAmount = toNumber(order.settlementAmount);
    if (order.payAmount !== undefined)
      baseOrder.payAmount = toNumber(order.payAmount);
    if (order.discountAmount !== undefined)
      baseOrder.discountAmount = toNumber(order.discountAmount);

    if (order.items) {
      baseOrder.items = order.items.map((item: any) => {
        const mappedItem: any = {
          ...item,
          id: Number(item.id),
          orderId: Number(item.orderId),
          categoryId: Number(item.categoryId),
        };

        if (item.photos && Array.isArray(item.photos) && storageMap) {
          mappedItem.photos = item.photos.map((photoId: string) => {
            const storage = storageMap.get(photoId);
            return storage ? storage.fileUrl : photoId;
          });
          mappedItem.thumbnailUrls = item.photos
            .map((photoId: string) => {
              const storage = storageMap.get(photoId);
              return storage?.thumbnailUrl || storage?.fileUrl || null;
            })
            .filter(Boolean);
        }

        return mappedItem;
      });
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

  private async getStorageMap(
    photoIds: string[],
  ): Promise<Map<string, { fileUrl: string; thumbnailUrl?: string | null }>> {
    const storageMap = new Map<
      string,
      { fileUrl: string; thumbnailUrl?: string | null }
    >();

    if (!photoIds || photoIds.length === 0) {
      return storageMap;
    }

    const storages = await this.prisma.storage.findMany({
      where: { id: { in: photoIds } },
      select: { id: true, fileUrl: true, thumbnailUrl: true },
    });

    for (const storage of storages) {
      storageMap.set(storage.id, {
        fileUrl: storage.fileUrl,
        thumbnailUrl: storage.thumbnailUrl,
      });
    }

    return storageMap;
  }

  private extractPhotoIds(orders: any[]): string[] {
    const photoIds: string[] = [];
    for (const order of orders) {
      if (order.items) {
        for (const item of order.items) {
          if (item.photos && Array.isArray(item.photos)) {
            for (const photoId of item.photos) {
              if (typeof photoId === 'string' && photoId.length > 0) {
                photoIds.push(photoId);
              }
            }
          }
        }
      }
    }
    return [...new Set(photoIds)];
  }

  private parseBigInt(value: string | number, fieldName: string): bigint {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(`${fieldName} is invalid`);
    }
  }

  private async publishOrderCreatedEvent(order: any): Promise<void> {
    const payload = {
      orderId: order.id.toString(),
      userId: order.userId.toString(),
      items: order.items.map((item: any) => ({
        categoryId: item.categoryId.toString(),
        quantity: item.quantity,
        estimatedPrice: toNumber(item.unitPrice),
        weight: item.estimatedWeight,
        condition: item.condition || undefined,
        description: item.notes || undefined,
      })),
      address: {
        id: order.addressId.toString(),
        fullAddress: order.address?.detail || '',
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
      totalAmount: toNumber(order.estimatedAmount),
      createdAt: order.createdAt.toISOString(),
      orderType: order.orderType,
    };

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await this.orderQueueService.handleOrderCreated(payload);
        return;
      } catch (error) {
        if (attempt < 3) {
          await delay(100 * attempt);
          continue;
        }
        this.logger.error(
          `Order created event publish failed for ${payload.orderId}: ${(error as Error).message}`,
          (error as Error).stack,
        );
      }
    }
  }

  // State Machine Transitions

  async courierPickUp(id: number, time: Date = new Date()): Promise<Order> {
    return this.updateStatus(id, {
      status: OrderStatus.PICKED_UP,
      actualPickupTime: time.toISOString(),
    });
  }

  async startTransport(id: number): Promise<Order> {
    return this.updateStatus(id, { status: OrderStatus.IN_TRANSIT });
  }

  async arriveAtStation(id: number): Promise<Order> {
    return this.updateStatus(id, { status: OrderStatus.PENDING_RECEIPT });
  }

  async confirmReceipt(id: number): Promise<Order> {
    return this.updateStatus(id, { status: OrderStatus.INSPECTING });
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
    await this.prisma.$transaction(async (tx) => {
      // Re-read order inside transaction to prevent TOCTOU race condition
      const currentOrder = await tx.order.findUnique({
        where: { id: BigInt(id) },
        include: { items: true },
      });

      if (!currentOrder) {
        throw new NotFoundException('订单不存在');
      }

      // Validate transition inside transaction
      this.validateTransition(currentOrder.status, OrderStatus.INSPECTED);

      // Update items in parallel if provided
      if (result.items && result.items.length > 0) {
        await Promise.all(
          result.items.map((item) =>
            tx.orderItem.update({
              where: { id: BigInt(item.id) },
              data: {
                actualWeight: item.actualWeight,
                unitPrice: item.unitPrice,
                amount: item.unitPrice
                  ? item.actualWeight * item.unitPrice
                  : undefined,
                condition: item.condition,
              },
            }),
          ),
        );
      }

      // Update order status and settlement amount
      await tx.order.update({
        where: { id: BigInt(id) },
        data: {
          status: OrderStatus.INSPECTED,
          settlementAmount: result.actualAmount,
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: BigInt(id),
          status: OrderStatus.INSPECTED,
          fromStatus: currentOrder.status,
          toStatus: OrderStatus.INSPECTED,
          message: `状态变更为 ${OrderStatus.INSPECTED}`,
          operator: 'SYSTEM',
          operatorType: 'SYSTEM',
          operatorId: null,
          reason: null,
          rawSnapshot: result as any,
        },
      });
    });

    return this.findById(id) as Promise<Order>;
  }

  async handleInspectionException(id: number, reason: string): Promise<Order> {
    return this.updateStatus(id, {
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
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: BigInt(id) },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      this.validateTransition(order.status, OrderStatus.INBOUNDED);

      let warehouse = await tx.warehouse.findFirst({
        where: {
          type: 'MAIN' as any,
          status: 'ACTIVE' as any,
        },
      });
      if (!warehouse) {
        warehouse = await tx.warehouse.create({
          data: {
            name: 'Default Warehouse',
            code: 'WH-DEFAULT',
            type: 'MAIN' as any,
            address: 'Default Address',
            contactPhone: '000-0000000',
            capacity: 10000,
            status: 'ACTIVE' as any,
          },
        });
      }

      await this.inventoryService.createFromOrder(order as any, tx);

      const now = new Date();
      await tx.inboundReceipt.upsert({
        where: { orderId: BigInt(id) },
        create: {
          orderId: BigInt(id),
          warehouseId: warehouse.id,
          staffId: null,
          status: InboundStatus.INBOUNDED,
          inspectionResult: InspectionResult.PASS,
          exceptionReason: null,
          photos: [],
          receivedAt: now,
          inspectedAt: now,
          inboundedAt: now,
        },
        update: {
          warehouseId: warehouse.id,
          status: InboundStatus.INBOUNDED,
          inboundedAt: now,
          inspectedAt: now,
          receivedAt: now,
        },
      });

      await tx.order.update({
        where: { id: BigInt(id) },
        data: { status: OrderStatus.INBOUNDED },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: BigInt(id),
          status: OrderStatus.INBOUNDED,
          fromStatus: order.status,
          toStatus: OrderStatus.INBOUNDED,
          message: `状态变更为 ${OrderStatus.INBOUNDED}`,
          operator: 'SYSTEM',
          operatorType: 'SYSTEM',
          operatorId: null,
          reason: null,
          rawSnapshot: { action: 'confirmInbound' } as any,
        },
      });

      this.validateTransition(
        OrderStatus.INBOUNDED,
        OrderStatus.PENDING_SETTLEMENT,
      );

      const pendingSettlement = await tx.order.update({
        where: { id: BigInt(id) },
        data: { status: OrderStatus.PENDING_SETTLEMENT },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: BigInt(id),
          status: OrderStatus.PENDING_SETTLEMENT,
          fromStatus: OrderStatus.INBOUNDED,
          toStatus: OrderStatus.PENDING_SETTLEMENT,
          message: `状态变更为 ${OrderStatus.PENDING_SETTLEMENT}`,
          operator: 'SYSTEM',
          operatorType: 'SYSTEM',
          operatorId: null,
          reason: null,
          rawSnapshot: { action: 'confirmInbound:auto' } as any,
        },
      });

      return pendingSettlement;
    });

    return updated as any;
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
    const method = options?.method || PaymentProvider.BALANCE;

    if (method === PaymentProvider.BALANCE) {
      const updated = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: BigInt(id) },
        });
        if (!order) throw new NotFoundException('Order not found');
        this.validateTransition(order.status, OrderStatus.COMPLETED);

        const settlementAmount = toNumber(order.settlementAmount);
        if (settlementAmount > 0) {
          await this.accountService.deposit(
            order.userId,
            settlementAmount,
            order.id.toString(),
            `Recycle Order Settlement #${order.orderNo}`,
            tx,
          );
        }

        const updatedOrder = await tx.order.update({
          where: { id: BigInt(id) },
          data: { status: OrderStatus.COMPLETED },
        });

        await tx.orderTimeline.create({
          data: {
            orderId: BigInt(id),
            status: OrderStatus.COMPLETED,
            fromStatus: order.status,
            toStatus: OrderStatus.COMPLETED,
            message: `状态变更为 ${OrderStatus.COMPLETED}`,
            operator: 'SYSTEM',
            operatorType: 'SYSTEM',
            operatorId: null,
            reason: null,
            rawSnapshot: {
              method: PaymentProvider.BALANCE,
              settlementAmount,
            } as any,
          },
        });

        return updatedOrder;
      });

      return updated as any;
    }

    // Non-balance path: transfer via external payment provider
    // Use Redis lock to prevent double-settlement
    const lockKey = `order:settlement:${id}`;
    const lockResult = await this.redisService.getClient().set(
      lockKey,
      'PROCESSING',
      'EX',
      300,
      'NX',
    );
    if (!lockResult) {
      throw new BadRequestException('结算正在处理中，请勿重复操作');
    }

    // Step 1: Validate order status
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
    });
    if (!order) {
      await this.redisService.getClient().del(lockKey);
      throw new NotFoundException('Order not found');
    }
    this.validateTransition(order.status, OrderStatus.COMPLETED);

    const settlementAmount = toNumber(order.settlementAmount);

    try {
      if (settlementAmount > 0) {
        if (
          method === PaymentProvider.WECHAT ||
          method === PaymentProvider.ALIPAY
        ) {
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
                accountNo: identity.openid,
                realName: (
                  await this.prisma.user.findUnique({
                    where: { id: BigInt(order.userId) },
                  })
                )?.realName,
              };
            }
          }

          const hasWechat = !!accountInfo?.openid;
          const hasAlipay = !!accountInfo?.accountNo;
          if (
            (method === PaymentProvider.WECHAT && !hasWechat) ||
            (method === PaymentProvider.ALIPAY && !hasAlipay)
          ) {
            throw new Error(`Missing account info for ${method} transfer`);
          }

          await this.paymentService.transferToUser(
            BigInt(order.userId),
            settlementAmount,
            method,
            accountInfo,
            `Recycle Order Settlement #${order.orderNo}`,
            BigInt(order.id),
          );
        }
      }

      const currentOrder = await this.prisma.order.findUnique({ where: { id: BigInt(id) } });
      if (currentOrder && currentOrder.status === OrderStatus.COMPLETED) {
        return currentOrder as any;
      }
      return this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: BigInt(id) } });
        if (!order) throw new NotFoundException('Order not found');
        if (order.status === OrderStatus.COMPLETED) return order;
        this.validateTransition(order.status, OrderStatus.COMPLETED);
        const updatedOrder = await tx.order.update({
          where: { id: BigInt(id) },
          data: { status: OrderStatus.COMPLETED },
        });
        await tx.orderTimeline.create({
          data: {
            orderId: BigInt(id),
            status: OrderStatus.COMPLETED,
            fromStatus: order.status,
            toStatus: OrderStatus.COMPLETED,
            message: `状态变更为 ${OrderStatus.COMPLETED}`,
            operator: 'SYSTEM',
            operatorType: 'SYSTEM',
            operatorId: null,
            reason: null,
            rawSnapshot: { method, settlementAmount } as any,
          },
        });
        return updatedOrder;
      });
    } catch (error) {
      throw error;
    } finally {
      await this.redisService.getClient().del(lockKey);
    }
  }

  private validateTransition(current: string, target: string): void {
    if (!isValidOrderStatus(current) || !isValidOrderStatus(target)) {
      throw new BadRequestException(
        `Invalid order status: current="${current}", target="${target}"`,
      );
    }

    try {
      validateStateTransition(current, target);
    } catch (error) {
      if (error instanceof StateMachineError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
