import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateDLQDto {
  jobId: string;
  queueName: string;
  jobType: string;
  payload: any;
  errorMessage?: string;
  failedAttempts: number;
  lastError?: string;
}

@Injectable()
export class DeadLetterQueueRepository {
  private readonly logger = new Logger(DeadLetterQueueRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 添加任务到死信队列
   */
  async create(data: CreateDLQDto): Promise<any> {
    try {
      return await this.prisma.deadLetterQueue.create({
        data: {
          jobId: data.jobId,
          queueName: data.queueName,
          jobType: data.jobType,
          payload: data.payload,
          errorMessage: data.errorMessage,
          failedAttempts: data.failedAttempts,
          lastError: data.lastError,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create DLQ entry: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取未解决的死信任务
   */
  async findUnresolved(limit: number = 100): Promise<any[]> {
    try {
      return await this.prisma.deadLetterQueue.findMany({
        where: { resolved: false },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to find unresolved DLQ entries: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据队列名称获取死信任务
   */
  async findByQueue(queueName: string, resolved: boolean = false): Promise<any[]> {
    try {
      return await this.prisma.deadLetterQueue.findMany({
        where: {
          queueName,
          resolved,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to find DLQ entries by queue: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据ID获取死信任务
   */
  async findById(id: string): Promise<any | null> {
    try {
      return await this.prisma.deadLetterQueue.findUnique({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to find DLQ entry: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 标记死信任务为已解决
   */
  async markResolved(id: string, resolvedBy: string, note?: string): Promise<any> {
    try {
      return await this.prisma.deadLetterQueue.update({
        where: { id },
        data: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy,
          resolvedNote: note,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to mark DLQ entry as resolved: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除死信任务
   */
  async delete(id: string): Promise<any> {
    try {
      return await this.prisma.deadLetterQueue.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to delete DLQ entry: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取死信队列统计
   */
  async getStats(): Promise<{
    total: number;
    unresolved: number;
    resolved: number;
    byQueue: Record<string, number>;
  }> {
    try {
      const [total, unresolved, resolved, byQueue] = await Promise.all([
        this.prisma.deadLetterQueue.count(),
        this.prisma.deadLetterQueue.count({ where: { resolved: false } }),
        this.prisma.deadLetterQueue.count({ where: { resolved: true } }),
        this.prisma.deadLetterQueue.groupBy({
          by: ['queueName'],
          _count: true,
          where: { resolved: false },
        }),
      ]);

      const byQueueMap: Record<string, number> = {};
      byQueue.forEach((item) => {
        byQueueMap[item.queueName] = item._count;
      });

      return { total, unresolved, resolved, byQueue: byQueueMap };
    } catch (error) {
      this.logger.error(`Failed to get DLQ stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清理旧的已解决任务
   */
  async cleanOldResolved(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.deadLetterQueue.deleteMany({
        where: {
          resolved: true,
          resolvedAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned ${result.count} old resolved DLQ entries`);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to clean old resolved DLQ entries: ${error.message}`, error.stack);
      throw error;
    }
  }
}