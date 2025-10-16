import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { QUEUE_NAMES } from '../queue.module';
import {
  AutoDispatchEventDto,
  ManualDispatchEventDto,
  ReassignCourierEventDto,
} from '../dto/dispatch-events.dto';

@Injectable()
export class DispatchQueueService {
  private readonly logger = new Logger(DispatchQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.DISPATCH) private dispatchQueue: Queue,
  ) {}

  /**
   * 自动派单
   */
  async autoDispatch(data: AutoDispatchEventDto, delayMs: number = 0): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 9,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        delay: delayMs,
      };

      const job = await this.dispatchQueue.add('auto-dispatch', data, jobOptions);

      this.logger.log(
        `Auto dispatch queued: Order ${data.orderId}, Delay: ${delayMs}ms, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to queue auto dispatch: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 手动派单
   */
  async manualDispatch(data: ManualDispatchEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      const job = await this.dispatchQueue.add('manual-dispatch', data, jobOptions);

      this.logger.log(
        `Manual dispatch queued: Order ${data.orderId}, Courier: ${data.courierId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to queue manual dispatch: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 重新分配快递员
   */
  async reassignCourier(data: ReassignCourierEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      const job = await this.dispatchQueue.add('reassign-courier', data, jobOptions);

      this.logger.log(
        `Courier reassignment queued: Order ${data.orderId}, ${data.oldCourierId} -> ${data.newCourierId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to queue courier reassignment: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量自动派单
   */
  async batchAutoDispatch(orderIds: string[], delayMs: number = 0): Promise<void> {
    try {
      const jobs = orderIds.map((orderId) =>
        this.autoDispatch({ orderId }, delayMs),
      );

      await Promise.all(jobs);

      this.logger.log(`Batch auto dispatch queued: ${orderIds.length} orders`);
    } catch (error) {
      this.logger.error(`Failed to queue batch auto dispatch: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 取消派单任务
   */
  async cancelDispatch(orderId: string): Promise<void> {
    try {
      const jobs = await this.dispatchQueue.getJobs(['delayed', 'waiting']);
      
      for (const job of jobs) {
        if (
          (job.name === 'auto-dispatch' || job.name === 'manual-dispatch') &&
          job.data.orderId === orderId
        ) {
          await job.remove();
          this.logger.log(`Cancelled dispatch task for order: ${orderId}, Job ID: ${job.id}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to cancel dispatch task: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取订单的派单状态
   */
  async getDispatchStatus(orderId: string): Promise<{
    pending: boolean;
    jobId?: string;
    jobType?: string;
    scheduledTime?: Date;
  }> {
    try {
      const jobs = await this.dispatchQueue.getJobs(['delayed', 'waiting', 'active']);
      
      for (const job of jobs) {
        if (job.data.orderId === orderId) {
          return {
            pending: true,
            jobId: job.id.toString(),
            jobType: job.name,
            scheduledTime: job.processedOn ? new Date(job.processedOn) : undefined,
          };
        }
      }
      
      return { pending: false };
    } catch (error) {
      this.logger.error(`Failed to get dispatch status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取队列统计信息
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.dispatchQueue.getWaiting(),
        this.dispatchQueue.getActive(),
        this.dispatchQueue.getCompleted(),
        this.dispatchQueue.getFailed(),
        this.dispatchQueue.getDelayed(),
      ]);

      const isPaused = await this.dispatchQueue.isPaused();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        paused: isPaused,
      };
    } catch (error) {
      this.logger.error(`Failed to get queue stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 暂停队列
   */
  async pause(): Promise<void> {
    try {
      await this.dispatchQueue.pause();
      this.logger.log('Dispatch queue paused');
    } catch (error) {
      this.logger.error(`Failed to pause queue: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 恢复队列
   */
  async resume(): Promise<void> {
    try {
      await this.dispatchQueue.resume();
      this.logger.log('Dispatch queue resumed');
    } catch (error) {
      this.logger.error(`Failed to resume queue: ${error.message}`, error.stack);
      throw error;
    }
  }
}