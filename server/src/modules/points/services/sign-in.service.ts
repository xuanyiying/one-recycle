import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PointsType } from '@prisma/client';
import { PointsRecordService } from './points-record.service';

@Injectable()
export class SignInService {
  // 签到奖励配置
  private readonly SIGN_IN_REWARDS = [
    { day: 1, points: 5 },
    { day: 2, points: 5 },
    { day: 3, points: 10 },
    { day: 4, points: 10 },
    { day: 5, points: 15 },
    { day: 6, points: 15 },
    { day: 7, points: 30 }, // 连续签到7天额外奖励
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsRecordService: PointsRecordService,
  ) {}

  /**
   * 签到
   */
  async signIn(userId: bigint) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今天是否已签到
    const existingRecord = await this.prisma.signInRecord.findUnique({
      where: {
        userId_signInDate: {
          userId,
          signInDate: today,
        },
      },
    });

    if (existingRecord) {
      throw new BadRequestException('今日已签到');
    }

    // 获取昨日签到记录
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayRecord = await this.prisma.signInRecord.findUnique({
      where: {
        userId_signInDate: {
          userId,
          signInDate: yesterday,
        },
      },
    });

    // 计算连续签到天数
    let continuousDays = 1;
    if (yesterdayRecord) {
      continuousDays = yesterdayRecord.continuousDays + 1;
      // 超过7天重新开始
      if (continuousDays > 7) {
        continuousDays = 1;
      }
    }

    // 获取奖励积分
    const reward = this.SIGN_IN_REWARDS[continuousDays - 1];

    return this.prisma.$transaction(async (tx) => {
      // 创建签到记录
      const record = await tx.signInRecord.create({
        data: {
          userId,
          signInDate: today,
          continuousDays,
          points: reward.points,
        },
      });

      // 增加积分
      await this.pointsRecordService.addPoints(
        userId,
        reward.points,
        PointsType.SIGN_IN,
        `签到奖励（连续${continuousDays}天）`,
        'SIGN_IN',
        record.id.toString(),
        tx,
      );

      return {
        record,
        reward: reward.points,
        continuousDays,
        nextReward: this.SIGN_IN_REWARDS[continuousDays % 7],
      };
    });
  }

  /**
   * 获取签到状态
   */
  async getSignInStatus(userId: bigint) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRecord = await this.prisma.signInRecord.findUnique({
      where: {
        userId_signInDate: {
          userId,
          signInDate: today,
        },
      },
    });

    // 获取最近签到记录
    const lastRecord = await this.prisma.signInRecord.findFirst({
      where: { userId },
      orderBy: { signInDate: 'desc' },
    });

    // 检查是否连续
    let continuousDays = 0;
    if (lastRecord) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastRecord.signInDate.getTime() === yesterday.getTime()) {
        continuousDays = lastRecord.continuousDays;
      }
    }

    return {
      hasSignedInToday: !!todayRecord,
      continuousDays: todayRecord?.continuousDays || continuousDays,
      todayReward: this.SIGN_IN_REWARDS[todayRecord?.continuousDays || continuousDays || 0]?.points || this.SIGN_IN_REWARDS[0].points,
      rewards: this.SIGN_IN_REWARDS,
    };
  }

  /**
   * 获取签到记录
   */
  async getSignInRecords(userId: bigint, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await this.prisma.signInRecord.findMany({
      where: {
        userId,
        signInDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { signInDate: 'asc' },
    });

    return records;
  }
}
