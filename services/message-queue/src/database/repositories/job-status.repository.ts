import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface CreateJobStatusDto {
  jobId: string;
  jobType: string;
  queueName: string;
  status: string;
  payload: any;
  maxAttempts?: number;
}

export interface UpdateJobStatusDto {
  status?: string;
  result?: any;
  errorMessage?: string;
  attempts?: number;
  completedAt?: Date;
}

@Injectable()
export class JobStatusRepository {
  private readonly logger = new Logger(JobStatusRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建任务状态记录
   */
  async create(data: CreateJobStatusDto): Promise<any> {
    try {
      return await this.prisma.jobStatus.create({
        data: {
          jobId: data.jobId,
          jobType: data.jobType,
          queueName: data.queueName,
          status: data.status,
          payload: data.payload,
          maxAttempts: data.maxAttempts || 3,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create job status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据jobId查找任务状态
   */
  async findByJobId(jobId: string): Promise<any | null> {
    try {
      return await this.prisma.jobStatus.findUnique({
        where: { jobId },
      });
    } catch (error) {
      this.logger.error(`Failed to find job status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 更新任务状态
   */
  async update(jobId: string, data: UpdateJobStatusDto): Promise<any> {
    try {
      return await this.prisma.jobStatus.update({
        where: { jobId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update job status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 增加尝试次数
   */
  async incrementAttempts(jobId: string): Promise<any> {
    try {
      return await this.prisma.jobStatus.update({
        where: { jobId },
        data: {
          attempts: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to increment attempts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 标记任务为已完成
   */
  async markCompleted(jobId: string, result?: any): Promise<any> {
    try {
      return await this.prisma.jobStatus.update({
        where: { jobId },
        data: {
          status: 'completed',
          result,
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to mark job as completed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 标记任务为失败
   */
  async markFailed(jobId: string, errorMessage: string): Promise<any> {
    try {
      return await this.prisma.jobStatus.update({
        where: { jobId },
        data: {
          status: 'failed',
          errorMessage,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to mark job as failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取指定状态的任务列表
   */
  async findByStatus(status: string, limit: number = 100): Promise<any[]> {
    try {
      return await this.prisma.jobStatus.findMany({
        where: { status },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to find jobs by status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取队列的任务统计
   */
  async getQueueStats(queueName: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const [total, pending, processing, completed, failed] = await Promise.all([
        this.prisma.jobStatus.count({ where: { queueName } }),
        this.prisma.jobStatus.count({ where: { queueName, status: 'pending' } }),
        this.prisma.jobStatus.count({ where: { queueName, status: 'processing' } }),
        this.prisma.jobStatus.count({ where: { queueName, status: 'completed' } }),
        this.prisma.jobStatus.count({ where: { queueName, status: 'failed' } }),
      ]);

      return { total, pending, processing, completed, failed };
    } catch (error) {
      this.logger.error(`Failed to get queue stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 清理旧的已完成任务
   */
  async cleanOldCompleted(daysOld: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.jobStatus.deleteMany({
        where: {
          status: 'completed',
          completedAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`Cleaned ${result.count} old completed jobs`);
      return result.count;
    } catch (error) {
      this.logger.error(`Failed to clean old completed jobs: ${error.message}`, error.stack);
      throw error;
    }
  }
}