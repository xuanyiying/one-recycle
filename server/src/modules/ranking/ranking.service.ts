import { toNumber } from '@/common/utils/decimal.util';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RankingQueryDto, RankingResponseDto } from './dto';

@Injectable()
export class RankingService {
  private readonly logger = new Logger(RankingService.name);

  constructor(private readonly prisma: PrismaService) { }

  async getRankings(query: RankingQueryDto): Promise<RankingResponseDto[]> {
    const { type = 'total', page = 1, pageSize = 20 } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {
      status: 'COMPLETED',
    };

    const now = new Date();
    if (type === 'week') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      where.completedAt = { gte: lastWeek };
    } else if (type === 'month') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      where.completedAt = { gte: lastMonth };
    }

    // Aggregate orders to get top users by settlementAmount
    const topUsers = await this.prisma.order.groupBy({
      by: ['userId'],
      _sum: {
        settlementAmount: true,
      },
      where,
      orderBy: {
        _sum: {
          settlementAmount: 'desc',
        },
      },
      take: pageSize,
      skip: skip,
    });

    if (topUsers.length === 0) {
      return [];
    }

    // Fetch user details
    const userIds = topUsers.map((u) => u.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatarUrl: true },
    });

    // Map back to response
    return topUsers.map((u, index) => {
      const user = users.find((usr) => usr.id === u.userId);
      // Default nickname and avatar if not found
      const nickname = user?.nickname || `环保卫士 ${u.userId}`;
      // Use a default avatar if none provided.
      // Using dicebear with userId as seed for consistent default avatars
      const avatar =
        user?.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.userId}`;

      return {
        rank: skip + index + 1,
        userId: u.userId.toString(),
        nickname,
        avatar,
        score: Math.round(toNumber(u._sum.settlementAmount)), // Use integer for score
        trend: 'same', // Placeholder as we don't track historical rank yet
      };
    });
  }

  async getMyRank(
    userId: bigint | string,
    query: RankingQueryDto,
  ): Promise<RankingResponseDto> {
    const { type = 'total' } = query;
    const uid = typeof userId === 'string' ? BigInt(userId) : userId;

    // 1. Calculate my score
    const where: any = { status: 'COMPLETED', userId: uid };
    const now = new Date();
    if (type === 'week') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      where.completedAt = { gte: lastWeek };
    } else if (type === 'month') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      where.completedAt = { gte: lastMonth };
    }

    const myScoreAgg = await this.prisma.order.aggregate({
      _sum: { settlementAmount: true },
      where,
    });
    const myScore = Math.round(toNumber(myScoreAgg._sum.settlementAmount));

    // 2. Count better users using Raw Query for performance
    let dateFilter = '';
    if (type === 'week') {
      // PostgreSQL specific syntax for date diff
      dateFilter = `AND "completedAt" >= NOW() - INTERVAL '7 days'`;
    } else if (type === 'month') {
      dateFilter = `AND "completedAt" >= NOW() - INTERVAL '30 days'`;
    }

    const sql = Prisma.sql`
            SELECT COUNT(*) as count FROM (
                SELECT "user_id", SUM("settlement_amount") as score
                FROM "orders"
                WHERE "status" = 'COMPLETED' ${Prisma.raw(dateFilter)}
                GROUP BY "user_id"
                HAVING SUM("settlement_amount") > ${myScore}
            ) as better_users
        `;

    let rank = 0;
    try {
      const result: any[] = await this.prisma.$queryRaw(sql);
      rank = Number(result[0]?.count || 0) + 1;
    } catch (e) {
      this.logger.error('Error calculating rank:', e);
      rank = 999;
    }

    // Get User Info
    const user = await this.prisma.user.findUnique({
      where: { id: uid },
      select: { nickname: true, avatarUrl: true },
    });

    return {
      rank,
      userId: uid.toString(),
      nickname: user?.nickname || `环保卫士`,
      avatar:
        user?.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      score: myScore,
      trend: 'same',
    };
  }
}
