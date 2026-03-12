import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PointsType } from '@prisma/client';
import { PointsRecordService } from './points-record.service';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  // 邀请奖励积分
  private readonly INVITE_REWARD_POINTS = 50;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsRecordService: PointsRecordService,
  ) {}

  /**
   * 获取邀请码（用户ID的base62编码）
   */
  getInviteCode(userId: bigint): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let code = '';
    let num = Number(userId);

    while (num > 0) {
      code = chars[num % 62] + code;
      num = Math.floor(num / 62);
    }

    return code.padStart(6, '0');
  }

  /**
   * 解析邀请码
   */
  parseInviteCode(code: string): bigint | null {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let num = 0;

    for (const char of code) {
      const index = chars.indexOf(char);
      if (index === -1) return null;
      num = num * 62 + index;
    }

    return BigInt(num);
  }

  /**
   * 处理邀请关系
   */
  async handleInvite(inviteeId: bigint, inviteCode: string) {
    // 解析邀请码
    const inviterId = this.parseInviteCode(inviteCode);
    if (!inviterId) {
      this.logger.warn(`Invalid invite code: ${inviteCode}`);
      return;
    }

    // 不能邀请自己
    if (inviterId === inviteeId) {
      this.logger.warn(`User cannot invite themselves: ${inviteeId}`);
      return;
    }

    // 检查邀请人是否存在
    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    if (!inviter) {
      this.logger.warn(`Inviter not found: ${inviterId}`);
      return;
    }

    // 检查是否已被邀请
    const existingInvite = await this.prisma.inviteRecord.findUnique({
      where: { inviteeId },
    });

    if (existingInvite) {
      this.logger.log(`User already invited: ${inviteeId}`);
      return;
    }

    // 创建邀请记录并发放奖励
    await this.prisma.$transaction(async (tx) => {
      // 创建邀请记录
      await tx.inviteRecord.create({
        data: {
          inviterId,
          inviteeId,
          rewardPoints: this.INVITE_REWARD_POINTS,
        },
      });

      // 给邀请人发放积分
      await this.pointsRecordService.addPoints(
        inviterId,
        this.INVITE_REWARD_POINTS,
        PointsType.INVITE,
        '邀请好友奖励',
        'INVITE',
        inviteeId.toString(),
        tx,
      );
    });

    this.logger.log(
      `Invite processed: inviter=${inviterId}, invitee=${inviteeId}`,
    );
  }

  /**
   * 获取邀请统计
   */
  async getInviteStats(userId: bigint) {
    const totalInvites = await this.prisma.inviteRecord.count({
      where: { inviterId: userId },
    });

    const totalRewards = await this.prisma.inviteRecord.aggregate({
      where: { inviterId: userId },
      _sum: { rewardPoints: true },
    });

    const recentInvites = await this.prisma.inviteRecord.findMany({
      where: { inviterId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        invitee: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      inviteCode: this.getInviteCode(userId),
      totalInvites,
      totalRewards: totalRewards._sum.rewardPoints || 0,
      recentInvites,
    };
  }

  /**
   * 获取邀请列表
   */
  async getInviteList(userId: bigint, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inviteRecord.findMany({
        where: { inviterId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          invitee: {
            select: {
              id: true,
              nickname: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.inviteRecord.count({
        where: { inviterId: userId },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
