import { Injectable, Logger } from '@nestjs/common';
import { JobStatusRepository } from '../../database/repositories/job-status.repository';

@Injectable()
export class IdempotencyService {
    private readonly logger = new Logger(IdempotencyService.name);

    constructor(
        private readonly jobStatusRepository: JobStatusRepository,
    ) { }

    /**
     * 使用幂等性包装器处理任务
     * @param jobId 任务唯一ID
     * @param jobType 任务类型
     * @param queueName 队列名称
     * @param payload 任务数据
     * @param handler 实际处理函数
     * @returns 处理结果
     */
    async processWithIdempotency<T>(
        jobId: string,
        jobType: string,
        queueName: string,
        payload: any,
        handler: () => Promise<T>,
    ): Promise<T> {
        try {
            // 1. 检查任务是否已处理
            const existing = await this.jobStatusRepository.findByJobId(jobId);

            if (existing) {
                if (existing.status === 'completed') {
                    this.logger.log(`Job ${jobId} already completed, returning cached result`);
                    return existing.result as T;
                }

                if (existing.status === 'processing') {
                    this.logger.warn(`Job ${jobId} is currently being processed`);
                    throw new Error(`Job ${jobId} is already being processed`);
                }

                if (existing.status === 'failed') {
                    this.logger.log(`Job ${jobId} previously failed, retrying`);
                    await this.jobStatusRepository.incrementAttempts(jobId);
                }
            } else {
                // 2. 创建新的任务状态记录
                await this.jobStatusRepository.create({
                    jobId,
                    jobType,
                    queueName,
                    status: 'pending',
                    payload,
                });
            }

            // 3. 标记为处理中
            await this.jobStatusRepository.update(jobId, {
                status: 'processing',
            });

            // 4. 执行实际处理逻辑
            const result = await handler();

            // 5. 标记为已完成
            await this.jobStatusRepository.markCompleted(jobId, result);

            this.logger.log(`Job ${jobId} completed successfully`);
            return result;
        } catch (error) {
            // 6. 标记为失败
            await this.jobStatusRepository.markFailed(jobId, error.message);

            this.logger.error(`Job ${jobId} failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 检查任务是否已处理
     */
    async isProcessed(jobId: string): Promise<boolean> {
        try {
            const jobStatus = await this.jobStatusRepository.findByJobId(jobId);
            return jobStatus && jobStatus.status === 'completed';
        } catch (error) {
            this.logger.error(`Failed to check if job is processed: ${error.message}`, error.stack);
            return false;
        }
    }

    /**
     * 获取任务状态
     */
    async getJobStatus(jobId: string): Promise<any | null> {
        try {
            return await this.jobStatusRepository.findByJobId(jobId);
        } catch (error) {
            this.logger.error(`Failed to get job status: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * 重置失败的任务以便重试
     */
    async resetFailedJob(jobId: string): Promise<void> {
        try {
            await this.jobStatusRepository.update(jobId, {
                status: 'pending',
                errorMessage: null,
            });

            this.logger.log(`Reset failed job ${jobId} for retry`);
        } catch (error) {
            this.logger.error(`Failed to reset job: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * 生成幂等性键
     * 用于创建唯一的jobId
     */
    static generateIdempotencyKey(
        prefix: string,
        ...parts: (string | number)[]
    ): string {
        return `${prefix}-${parts.join('-')}`;
    }
}