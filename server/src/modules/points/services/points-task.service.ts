import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PointsType, TaskType, TaskRecordStatus } from '@prisma/client';
import { PointsRecordService } from './points-record.service';

@Injectable()
export class PointsTaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pointsRecordService: PointsRecordService,
  ) {}

  /**
   * 获取所有任务列表
   */
  async getTaskList(userId: bigint) {
    const tasks = await this.prisma.pointsTask.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'desc' },
    });

    // 获取用户已完成记录
    const completedRecords = await this.prisma.taskRecord.findMany({
      where: { userId },
      select: { taskId: true, status: true },
    });

    const completedTaskIds = new Set(
      completedRecords.map((r) => r.taskId.toString()),
    );

    return tasks.map((task) => ({
      ...task,
      isCompleted: completedTaskIds.has(task.id.toString()),
    }));
  }

  /**
   * 完成任务
   */
  async completeTask(userId: bigint, taskId: bigint) {
    // 检查任务是否存在
    const task = await this.prisma.pointsTask.findUnique({
      where: { id: taskId },
    });

    if (!task || !task.isActive) {
      throw new Error('任务不存在或已下架');
    }

    // 检查是否已完成
    const existingRecord = await this.prisma.taskRecord.findUnique({
      where: {
        userId_taskId: { userId, taskId },
      },
    });

    if (existingRecord) {
      throw new Error('任务已完成');
    }

    return this.prisma.$transaction(async (tx) => {
      // 创建任务记录
      const record = await tx.taskRecord.create({
        data: {
          userId,
          taskId,
          status: TaskRecordStatus.COMPLETED,
          points: task.points,
        },
      });

      // 增加积分
      await this.pointsRecordService.addPoints(
        userId,
        task.points,
        PointsType.TASK,
        `完成任务: ${task.name}`,
        'TASK',
        record.id.toString(),
        tx,
      );

      return record;
    });
  }

  /**
   * 检查并完成首单任务
   */
  async checkFirstOrderTask(userId: bigint) {
    const task = await this.prisma.pointsTask.findFirst({
      where: { type: TaskType.FIRST_ORDER, isActive: true },
    });

    if (!task) return;

    // 检查是否已完成
    const existingRecord = await this.prisma.taskRecord.findUnique({
      where: {
        userId_taskId: { userId, taskId: task.id },
      },
    });

    if (!existingRecord) {
      await this.completeTask(userId, task.id);
    }
  }

  /**
   * 检查并完成完善资料任务
   */
  async checkProfileCompleteTask(userId: bigint) {
    const task = await this.prisma.pointsTask.findFirst({
      where: { type: TaskType.PROFILE_COMPLETE, isActive: true },
    });

    if (!task) return;

    // 检查用户资料是否完善
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, avatarUrl: true, realName: true },
    });

    if (user && user.nickname && user.avatarUrl) {
      // 检查是否已完成
      const existingRecord = await this.prisma.taskRecord.findUnique({
        where: {
          userId_taskId: { userId, taskId: task.id },
        },
      });

      if (!existingRecord) {
        await this.completeTask(userId, task.id);
      }
    }
  }

  /**
   * 创建任务（管理员）
   */
  async createTask(data: {
    name: string;
    description?: string;
    type: TaskType;
    points: number;
    icon?: string;
    config?: any;
    sortOrder?: number;
  }) {
    return this.prisma.pointsTask.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        points: data.points,
        icon: data.icon,
        config: data.config,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  /**
   * 更新任务（管理员）
   */
  async updateTask(taskId: bigint, data: Partial<{
    name: string;
    description: string;
    points: number;
    icon: string;
    config: any;
    isActive: boolean;
    sortOrder: number;
  }>) {
    return this.prisma.pointsTask.update({
      where: { id: taskId },
      data,
    });
  }
}
