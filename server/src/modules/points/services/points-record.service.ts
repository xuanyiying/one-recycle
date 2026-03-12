import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PointsType, Prisma } from '@prisma/client';

@Injectable()
export class PointsRecordService {
  private readonly logger = new Logger(PointsRecordService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 增加积分
   */
  async addPoints(
    userId: bigint,
    points: number,
    type: PointsType,
    description: string,
    sourceType?: string,
    sourceId?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const client = tx || this.prisma;

    const user = await client.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
      select: { points: true },
    });

    await client.pointsRecord.create({
      data: {
        userId,
        type,
        points,
        balanceAfter: user.points,
        sourceType,
        sourceId,
        description,
      },
    });

    this.logger.log(
      `Points added: user=${userId}, points=${points}, type=${type}`,
    );

    return user.points;
  }

  /**
   * 获取用户积分记录
   */
  async findByUser(
    userId: bigint,
    page: number = 1,
    limit: number = 20,
    type?: PointsType,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.PointsRecordWhereInput = { userId };

    if (type) {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.pointsRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pointsRecord.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取用户积分统计
   */
  async getStats(userId: bigint) {
    const records = await this.prisma.pointsRecord.groupBy({
      by: ['type'],
      where: { userId },
      _sum: { points: true },
      _count: true,
    });

    const stats = {
      totalEarned: 0,
      totalSpent: 0,
      byType: {} as Record<string, { points: number; count: number }>,
    };

    for (const record of records) {
      stats.byType[record.type] = {
        points: record._sum.points || 0,
        count: record._count,
      };

      if (record._sum.points && record._sum.points > 0) {
        stats.totalEarned += record._sum.points;
      } else if (record._sum.points && record._sum.points < 0) {
        stats.totalSpent += Math.abs(record._sum.points);
      }
    }

    return stats;
  }
}
