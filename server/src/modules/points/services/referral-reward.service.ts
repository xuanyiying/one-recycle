import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PointsType, ReferralRewardStatus } from '@prisma/client';
import { PointsRecordService } from './points-record.service';
import { toNumber } from '@/common/utils/decimal.util';

export enum RewardType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum RewardTiming {
  FIRST_ORDER = 'FIRST_ORDER',
  EVERY_ORDER = 'EVERY_ORDER',
}

export interface ReferralRewardConfig {
  rewardType: RewardType;
  rewardValue: number;
  rewardTiming: RewardTiming;
  minRewardPoints?: number;
}

@Injectable()
export class ReferralRewardService {
  private readonly logger = new Logger(ReferralRewardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsRecordService: PointsRecordService,
  ) {}

  async getReferralRewardConfig(): Promise<ReferralRewardConfig> {
    const configs = await this.prisma.systemConfig.findMany({
      where: {
        key: {
          in: [
            'REFERRAL_REWARD_TYPE',
            'REFERRAL_REWARD_VALUE',
            'REFERRAL_REWARD_TIMING',
            'REFERRAL_MIN_REWARD_POINTS',
          ],
        },
        isActive: true,
      },
    });

    const configMap = new Map(configs.map((c) => [c.key, c.value]));

    return {
      rewardType:
        (configMap.get('REFERRAL_REWARD_TYPE') as RewardType) ||
        RewardType.FIXED,
      rewardValue: parseFloat(configMap.get('REFERRAL_REWARD_VALUE') || '50'),
      rewardTiming:
        (configMap.get('REFERRAL_REWARD_TIMING') as RewardTiming) ||
        RewardTiming.FIRST_ORDER,
      minRewardPoints: parseInt(
        configMap.get('REFERRAL_MIN_REWARD_POINTS') || '1',
        10,
      ),
    };
  }

  calculateRewardPoints(
    orderAmount: number,
    config: ReferralRewardConfig,
  ): number {
    let rewardPoints: number;

    if (config.rewardType === RewardType.FIXED) {
      rewardPoints = config.rewardValue;
    } else {
      rewardPoints = Math.floor(orderAmount * (config.rewardValue / 100));
    }

    if (config.minRewardPoints && rewardPoints < config.minRewardPoints) {
      rewardPoints = config.minRewardPoints;
    }

    return Math.max(0, rewardPoints);
  }

  async shouldRewardOrder(
    inviteeId: bigint,
    config: ReferralRewardConfig,
  ): Promise<boolean> {
    if (config.rewardTiming === RewardTiming.EVERY_ORDER) {
      return true;
    }

    const existingReward = await this.prisma.referralReward.findFirst({
      where: { inviteeId },
    });

    return !existingReward;
  }

  async processOrderReward(orderId: bigint): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      return;
    }

    if (order.status !== 'COMPLETED') {
      this.logger.warn(
        `Order not completed: ${orderId}, status: ${order.status}`,
      );
      return;
    }

    const inviteRecord = await this.prisma.inviteRecord.findUnique({
      where: { inviteeId: order.userId },
    });

    if (!inviteRecord) {
      this.logger.log(`No invite record found for user: ${order.userId}`);
      return;
    }

    const existingReward = await this.prisma.referralReward.findUnique({
      where: { orderId },
    });

    if (existingReward) {
      this.logger.log(`Reward already processed for order: ${orderId}`);
      return;
    }

    const config = await this.getReferralRewardConfig();

    const shouldReward = await this.shouldRewardOrder(order.userId, config);
    if (!shouldReward) {
      this.logger.log(`Order should not be rewarded: ${orderId}`);
      return;
    }

    const orderAmount = toNumber(
      order.settlementAmount || order.estimatedAmount,
    );
    const rewardPoints = await this.calculateRewardPoints(orderAmount, config);

    if (rewardPoints <= 0) {
      this.logger.log(`Reward points is zero, skipping: ${orderId}`);
      return;
    }

    const totalItems = order.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );

    await this.prisma.$transaction(async (tx) => {
      const reward = await tx.referralReward.create({
        data: {
          inviteRecordId: inviteRecord.id,
          orderId,
          inviterId: inviteRecord.inviterId,
          inviteeId: inviteRecord.inviteeId,
          rewardPoints,
          orderAmount,
          rewardType: config.rewardType,
          rewardValue: config.rewardValue,
          status: ReferralRewardStatus.COMPLETED,
        },
      });

      await tx.inviteRecord.update({
        where: { id: inviteRecord.id },
        data: {
          totalOrderRewards: { increment: rewardPoints },
          totalOrders: { increment: 1 },
          totalItems: { increment: totalItems },
        },
      });

      await this.pointsRecordService.addPoints(
        inviteRecord.inviterId,
        rewardPoints,
        PointsType.INVITE,
        `邀请好友订单返佣 - 订单号: ${order.orderNo}`,
        'REFERRAL_REWARD',
        reward.id.toString(),
        tx,
      );
    });

    this.logger.log(
      `Referral reward processed: order=${orderId}, inviter=${inviteRecord.inviterId}, points=${rewardPoints}`,
    );
  }
}
