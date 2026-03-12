import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PointsRecordService } from './services/points-record.service';
import { SignInService } from './services/sign-in.service';
import { InviteService } from './services/invite.service';

@Injectable()
export class PointsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recordService: PointsRecordService,
    private readonly signInService: SignInService,
    private readonly inviteService: InviteService,
  ) { }

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
    const inviteStats = await this.inviteService.getInviteStats(userId);

    return {
      currentPoints: user?.points || 0,
      totalEarned: stats.totalEarned,
      totalSpent: stats.totalSpent,
      signInStatus,
      inviteStats: {
        inviteCode: inviteStats.inviteCode,
        totalInvites: inviteStats.totalInvites,
        totalRewards: inviteStats.totalRewards,
      },
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
