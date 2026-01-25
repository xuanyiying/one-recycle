import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderStatus, OrderType } from '@/common';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { OrderFilters } from '../interfaces/order.interface';
import { Order, Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderDto): Promise<Order> {
    const { items, ...orderData } = data;
    
    // 构造 Prisma 输入类型
    const createInput: Prisma.OrderCreateInput = {
      orderNo: orderData.orderNo || `ORD${Date.now()}`,
      user: { connect: { id: BigInt(orderData.userId) } },
      address: { connect: { id: BigInt(orderData.addressId) } },
      status: orderData.status || OrderStatus.PENDING,
      expectPickupTime: new Date(orderData.expectPickupTime),
      estimatedAmount: orderData.estimatedAmount || 0,
      settlementAmount: orderData.estimatedAmount || 0, // 初始结算金额等于预估金额
      payAmount: 0,
      channel: orderData.channel,
      remark: orderData.remark,
      source: orderData.source,
      orderType: OrderType.RECYCLE,
      items: {
        create: items.map(item => ({
          category: { connect: { id: item.categoryId } },
          estimatedWeight: item.estimatedWeight,
          actualWeight: 0, // 初始实际重量为0
          unitPrice: item.unitPrice,
          amount: item.estimatedWeight * item.unitPrice,
        }))
      }
    };

    const order = await this.prisma.order.create({
      data: createInput,
      include: {
        items: true,
        assignments: true,
      },
    });

    return this.mapToOrder(order);
  }

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

  async remove(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id: BigInt(id) },
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
}
