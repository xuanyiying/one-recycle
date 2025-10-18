import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IOrderService, CreateOrderData, UpdateOrderData, OrderFilters } from '../interfaces/order.interface';
import { OrderEntity, OrderType, OrderStatus } from '../entities/order.entity';

@Injectable()
export class OrderService implements IOrderService {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: CreateOrderData): Promise<OrderEntity> {
    const order = await this.prisma.order.create({
      data: {
        orderNo: data.orderNo,
        userId: BigInt(data.userId),
        addressId: BigInt(data.addressId),
        status: OrderStatus.PENDING as any,
        expectPickupTime: data.expectPickupTime,
        expectDeliveryTime: data.expectDeliveryTime,
        estimatedAmount: data.estimatedAmount,
        settlementAmount: data.settlementAmount || data.estimatedAmount,
        payAmount: data.payAmount || 0,
        channel: data.channel || 'APP',
        remark: data.remark,
        source: data.source,
      } as any,
      include: {
        items: true,
        assignments: true,
      },
    });

    return this.mapToOrderEntity(order);
  }

  async findAll(filters: OrderFilters, page?: number, limit?: number): Promise<{ orders: OrderEntity[]; total: number }> {
    const where: any = {};

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
      orders: orders.map(order => this.mapToOrderEntity(order)),
      total,
    };
  }

  async findOne(id: number): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        assignments: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return this.mapToOrderEntity(order);
  }

  async findById(id: number): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: {
        items: true,
        assignments: true,
      },
    });

    return order ? this.mapToOrderEntity(order) : null;
  }

  async update(id: number, data: UpdateOrderData): Promise<OrderEntity> {
    const updateData: any = {};

    if (data.status) updateData.status = data.status;
    if (data.expectPickupTime) updateData.expectPickupTime = data.expectPickupTime;
    if (data.actualPickupTime) updateData.actualPickupTime = data.actualPickupTime;
    if (data.expectDeliveryTime) updateData.expectDeliveryTime = data.expectDeliveryTime;
    if (data.actualDeliveryTime) updateData.actualDeliveryTime = data.actualDeliveryTime;
    if (data.settlementAmount !== undefined) updateData.settlementAmount = data.settlementAmount;
    if (data.payAmount !== undefined) updateData.payAmount = data.payAmount;
    if (data.remark) updateData.remark = data.remark;
    if (data.priority) updateData.priority = data.priority;

    const order = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        items: true,
        assignments: true,
      },
    });

    return this.mapToOrderEntity(order);
  }

  async cancel(id: number): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id: BigInt(id) },
      data: { status: OrderStatus.CANCELLED as any },
      include: {
        items: true,
        assignments: true,
      },
    });

    return this.mapToOrderEntity(order);
  }

  async remove(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id: BigInt(id) },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.order.delete({
      where: { id: BigInt(id) },
    });
  }

  // 兼容旧版方法
  async createRecycleOrder(data: CreateOrderData): Promise<OrderEntity> {
    return this.create({
      ...data,
      orderType: OrderType.RECYCLE,
    });
  }

  async createSaleOrder(data: CreateOrderData): Promise<OrderEntity> {
    return this.create({
      ...data,
      orderType: OrderType.SALE,
    });
  }

  private mapToOrderEntity(order: any): OrderEntity {
    return {
      id: Number(order.id),
      orderNo: order.orderNo,
      userId: Number(order.userId),
      addressId: Number(order.addressId),
      orderType: order.orderType,
      status: order.status,
      priority: order.priority,
      expectPickupTime: order.expectPickupTime,
      actualPickupTime: order.actualPickupTime,
      expectDeliveryTime: order.expectDeliveryTime,
      actualDeliveryTime: order.actualDeliveryTime,
      estimatedAmount: order.estimatedAmount,
      settlementAmount: order.settlementAmount,
      payAmount: order.payAmount,
      channel: order.channel,
      remark: order.remark,
      source: order.source,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items?.map((item: any) => ({
        id: Number(item.id),
        orderId: Number(item.orderId),
        categoryId: Number(item.categoryId),
        estimatedWeight: item.estimatedWeight,
        actualWeight: item.actualWeight,
        unitPrice: item.unitPrice,
        amount: item.amount,
        createdAt: item.createdAt,
      })),
      assignments: order.assignments?.map((assignment: any) => ({
        id: Number(assignment.id),
        orderId: Number(assignment.orderId),
        courierId: Number(assignment.courierId),
        status: assignment.status,
        acceptedAt: assignment.acceptedAt,
        arrivedAt: assignment.arrivedAt,
        finishedAt: assignment.finishedAt,
        createdAt: assignment.createdAt,
      })),
    };
  }

  async getOrderStats(userId: number): Promise<any> {
    const stats = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        userId: BigInt(userId),
      },
      _count: {
        status: true,
      },
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  async getUserDetailedStats(userId: number): Promise<any> {
    const [totalOrders, completedOrders, totalAmount] = await Promise.all([
      this.prisma.order.count({
        where: { userId: BigInt(userId) },
      }),
      this.prisma.order.count({
        where: {
          userId: BigInt(userId),
          status: OrderStatus.COMPLETED as any,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          userId: BigInt(userId),
          status: OrderStatus.COMPLETED as any,
        },
        _sum: {
          settlementAmount: true,
        },
      }),
    ]);

    return {
      totalOrders,
      completedOrders,
      totalAmount: totalAmount._sum.settlementAmount || 0,
    };
  }
}