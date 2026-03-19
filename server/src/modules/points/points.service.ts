import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PointsRecordService } from './services/points-record.service';
import { SignInService } from './services/sign-in.service';

@Injectable()
export class PointsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recordService: PointsRecordService,
    private readonly signInService: SignInService,
  ) {}

  /**
   * 获取用户积分概览
   */
  async getPointsOverview(userId: bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    const signInStatus = await this.signInService.getSignInStatus(userId);
    const stats = await this.recordService.getStats(userId);

    // 计算今日获得积分
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = await this.prisma.pointsRecord.findMany({
      where: {
        userId,
        type: { in: ['ORDER_REWARD', 'SIGN_IN', 'INVITE', 'TASK'] },
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: { points: true },
    });

    const todayPoints = todayRecords.reduce((sum, r) => sum + r.points, 0);

    // 获取待处理订单数
    const pendingOrders = await this.prisma.pointsOrder.count({
      where: {
        userId,
        status: { in: ['PENDING', 'SHIPPED'] },
      },
    });

    return {
      points: user?.points || 0,
      totalEarned: stats.totalEarned,
      totalSpent: stats.totalSpent,
      continuousDays: signInStatus.continuousDays,
      pendingOrders,
      todayPoints,
    };
  }

  /**
   * 获取管理端统计概览
   */
  async getAdminStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      todayOrders,
      todayPoints,
      topProducts,
    ] = await Promise.all([
      this.prisma.pointsProduct.count(),
      this.prisma.pointsProduct.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.pointsOrder.count(),
      this.prisma.pointsOrder.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.pointsOrder.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
      this.prisma.pointsRecord.aggregate({
        where: {
          type: {
            in: ['SIGN_IN', 'ORDER_REWARD', 'TASK', 'INVITE'],
          },
          createdAt: {
            gte: today,
          },
        },
        _sum: {
          points: true,
        },
      }),
      this.prisma.pointsOrder.groupBy({
        by: ['productId'],
        where: {
          status: 'COMPLETED',
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const topProductDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.pointsProduct.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            coverImage: true,
            points: true,
            soldCount: true,
          },
        });
        return {
          ...product,
          soldCount: item._sum.quantity || 0,
        };
      }),
    );

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      todayOrders,
      todayPointsIssued: todayPoints._sum.points || 0,
      topProducts: topProductDetails.filter(Boolean),
    };
  }
}
