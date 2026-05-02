import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CustomerOrderResponseDto,
  CustomerPointsRecordResponseDto,
  CustomerUserDetailDto,
  CustomerUserListResponseDto,
  CustomerUserQueryDto,
} from './dto/customer-user.dto';

@Injectable()
export class CustomerUserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: CustomerUserQueryDto,
  ): Promise<CustomerUserListResponseDto> {
    const {
      page = 1,
      limit = 10,
      mobile,
      nickname,
      status,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (mobile) {
      where.mobile = { contains: mobile };
    }

    if (nickname) {
      where.nickname = { contains: nickname };
    }

    if (status) {
      where.status = status as Prisma.EnumUserStatusFilter['equals'];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          mobile: true,
          nickname: true,
          avatarUrl: true,
          status: true,
          points: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
          orders: {
            where: { status: 'COMPLETED' },
            select: { settlementAmount: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = users.map((user) => ({
      id: user.id.toString(),
      mobile: user.mobile,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      status: user.status,
      points: user.points,
      createdAt: user.createdAt.toISOString(),
      orderCount: user._count.orders,
      totalOrderAmount: user.orders.reduce(
        (sum, order) => sum + Number(order.settlementAmount),
        0,
      ),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<CustomerUserDetailDto> {
    const userId = BigInt(id);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobile: true,
        nickname: true,
        realName: true,
        avatarUrl: true,
        gender: true,
        birthday: true,
        status: true,
        points: true,
        balance: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          where: { status: 'COMPLETED' },
          select: { settlementAmount: true },
        },
        invites: {
          select: {
            id: true,
            rewardPoints: true,
            totalOrderRewards: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            inviter: {
              select: {
                id: true,
                nickname: true,
                mobile: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    const orderStats = {
      totalOrders: user._count.orders,
      completedOrders: user.orders.length,
      totalAmount: user.orders.reduce(
        (sum, order) => sum + Number(order.settlementAmount),
        0,
      ),
    };

    let inviteStats = null;
    if (user.invites.length > 0) {
      inviteStats = {
        invitedCount: user.invites.length,
        totalRewardPoints: user.invites.reduce(
          (sum, inv) => sum + inv.rewardPoints,
          0,
        ),
        totalOrderRewards: user.invites.reduce(
          (sum, inv) => sum + inv.totalOrderRewards,
          0,
        ),
      };
    }

    let inviterInfo = null;
    if (user.invitedBy?.inviter) {
      inviterInfo = {
        id: user.invitedBy.inviter.id.toString(),
        nickname: user.invitedBy.inviter.nickname,
        mobile: user.invitedBy.inviter.mobile,
      };
    }

    return {
      id: user.id.toString(),
      mobile: user.mobile,
      nickname: user.nickname,
      realName: user.realName,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      birthday: user.birthday?.toISOString() || null,
      status: user.status,
      points: user.points,
      balance: Number(user.balance),
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString() || null,
      orderStats,
      inviteStats,
      inviterInfo,
    };
  }

  async getPointsRecords(
    userId: string,
    page: number = 1,
    limit: number = 20,
    startDate?: string,
    endDate?: string,
  ): Promise<CustomerPointsRecordResponseDto> {
    const skip = (page - 1) * limit;
    const userBigIntId = BigInt(userId);

    const where: Prisma.PointsRecordWhereInput = { userId: userBigIntId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.pointsRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pointsRecord.count({ where }),
    ]);

    return {
      items: records.map((record) => ({
        id: record.id.toString(),
        type: record.type,
        points: record.points,
        balanceAfter: record.balanceAfter,
        sourceType: record.sourceType,
        sourceId: record.sourceId,
        description: record.description,
        createdAt: record.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrders(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ): Promise<CustomerOrderResponseDto> {
    const skip = (page - 1) * limit;
    const userBigIntId = BigInt(userId);

    const where: Prisma.OrderWhereInput = { userId: userBigIntId };

    if (status) {
      where.status = status as Prisma.EnumOrderStatusFilter['equals'];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: {
          id: true,
          orderNo: true,
          status: true,
          settlementAmount: true,
          createdAt: true,
          completedAt: true,
          _count: {
            select: { items: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map((order) => ({
        id: order.id.toString(),
        orderNo: order.orderNo,
        status: order.status,
        settlementAmount: Number(order.settlementAmount),
        itemCount: order._count.items,
        createdAt: order.createdAt.toISOString(),
        completedAt: order.completedAt?.toISOString() || null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
