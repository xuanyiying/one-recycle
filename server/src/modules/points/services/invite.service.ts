import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { PointsType } from '@prisma/client';
import * as qrcode from 'qrcode';
import { PointsRecordService } from './points-record.service';

@Injectable()
export class InviteService {
  private readonly logger = new Logger(InviteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsRecordService: PointsRecordService,
  ) { }

  /**
   * 获取邀请码（用户ID的base62编码）
   */
  getInviteCode(userId: bigint): string {
    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
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
    const chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let num = 0;

    for (const char of code) {
      const index = chars.indexOf(char);
      if (index === -1) return null;
      num = num * 62 + index;
    }

    return BigInt(num);
  }

  private async getInviteRewardConfig(): Promise<{ type: string; value: number }> {
    const configs = await this.prisma.systemConfig.findMany({
      where: {
        key: { in: ['INVITE_REWARD_TYPE', 'INVITE_REWARD_VALUE'] },
        isActive: true,
      },
    });
    const configMap = new Map(configs.map((c) => [c.key, c.value]));
    return {
      type: configMap.get('INVITE_REWARD_TYPE') || 'FIXED',
      value: parseFloat(configMap.get('INVITE_REWARD_VALUE') || '50'),
    };
  }

  /**
   * 处理邀请关系
   */
  async handleInvite(inviteeId: bigint, inviteCode: string) {
    const inviterId = this.parseInviteCode(inviteCode);
    if (!inviterId) {
      this.logger.warn(`Invalid invite code: ${inviteCode}`);
      return;
    }

    if (inviterId === inviteeId) {
      this.logger.warn(`User cannot invite themselves: ${inviteeId}`);
      return;
    }

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
    });

    if (!inviter) {
      this.logger.warn(`Inviter not found: ${inviterId}`);
      return;
    }

    const existingInvite = await this.prisma.inviteRecord.findUnique({
      where: { inviteeId },
    });

    if (existingInvite) {
      this.logger.log(`User already invited: ${inviteeId}`);
      return;
    }

    const inviteRewardConfig = await this.getInviteRewardConfig();

    if (inviteRewardConfig.type === 'FIXED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.inviteRecord.create({
          data: {
            inviterId,
            inviteeId,
            rewardPoints: inviteRewardConfig.value,
          },
        });

        await this.pointsRecordService.addPoints(
          inviterId,
          inviteRewardConfig.value,
          PointsType.INVITE,
          '邀请好友奖励',
          'INVITE',
          inviteeId.toString(),
          tx,
        );
      });
    } else {
      await this.prisma.$transaction(async (tx) => {
        await tx.inviteRecord.create({
          data: {
            inviterId,
            inviteeId,
            rewardPoints: 0,
          },
        });
      });
    }

    this.logger.log(
      `Invite processed: inviter=${inviterId}, invitee=${inviteeId}`,
    );
  }

  /**
   * 获取邀请统计（包含旧物数量）
   */
  async getInviteStats(userId: bigint) {
    const inviteRecords = await this.prisma.inviteRecord.findMany({
      where: { inviterId: userId },
      include: { referralRewards: true },
    });

    const totalInvites = inviteRecords.length;
    const totalRewards = inviteRecords.reduce(
      (sum, record) =>
        sum + (record.rewardPoints ?? 0) + (record.totalOrderRewards ?? 0),
      0,
    );
    const totalItems = inviteRecords.reduce(
      (sum, record) => sum + (record.totalItems ?? 0),
      0,
    );
    const totalOrders = inviteRecords.reduce(
      (sum, record) => sum + (record.totalOrders ?? 0),
      0,
    );

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
        referralRewards: true,
      },
    });

    return {
      inviteCode: this.getInviteCode(userId),
      totalInvites,
      totalRewards,
      totalItems,
      totalOrders,
      recentInvites,
    };
  }

  /**
   * 获取邀请列表（包含下单情况）
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
          referralRewards: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.inviteRecord.count({
        where: { inviterId: userId },
      }),
    ]);

    const enrichedData = data.map((record) => ({
      ...record,
      hasOrdered: record.totalOrders > 0,
      lastOrderAt: record.referralRewards[0]?.createdAt || null,
    }));

    return {
      data: enrichedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async generateReferralQRCode(userId: bigint): Promise<string> {
    const inviteCode = this.getInviteCode(userId);
    const qrContent = `${process.env.FRONTEND_URL || 'https://backbuy.cn'}/register?inviteCode=${inviteCode}`;

    try {
      const qrCodeDataUrl = await qrcode.toDataURL(qrContent, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1B5E20',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error('Failed to generate QR code:', error);
      throw new Error('QR code generation failed');
    }
  }
}
