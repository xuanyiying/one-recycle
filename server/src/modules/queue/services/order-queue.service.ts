import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { QUEUE_NAMES } from '../queue.constants';
import {
  OrderCreatedEventDto,
  OrderStatusChangedEventDto,
  OrderCancelledEventDto,
  OrderCompletedEventDto,
} from '../dto/order-events.dto';

@Injectable()
export class OrderQueueService {
  private readonly logger = new Logger(OrderQueueService.name);

  constructor(@InjectQueue(QUEUE_NAMES.ORDER) private orderQueue: Queue) {}

  /**
   * 处理订单创建事件
   */
  async handleOrderCreated(data: OrderCreatedEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 10,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      // 添加订单处理任务
      const job = await this.orderQueue.add('order-created', data, jobOptions);

      this.logger.log(
        `Order created event queued: ${data.orderId}, Job ID: ${job.id}`,
      );

      // 添加派单任务（延迟5分钟执行，给用户修改时间）
      const dispatchJob = await this.orderQueue.add(
        'dispatch-order',
        { orderId: data.orderId },
        {
          delay: 5 * 60 * 1000, // 5分钟延迟
          priority: 8,
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
        },
      );

      this.logger.log(
        `Dispatch order task scheduled: ${data.orderId}, Job ID: ${dispatchJob.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue order created event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理订单状态变更事件
   */
  async handleOrderStatusChanged(
    data: OrderStatusChangedEventDto,
  ): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 7,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      const job = await this.orderQueue.add(
        'order-status-changed',
        data,
        jobOptions,
      );

      this.logger.log(
        `Order status changed event queued: ${data.orderId} (${data.oldStatus} -> ${data.newStatus}), Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue order status changed event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理订单完成事件（触发积分入账）
   */
  async handleOrderCompleted(data: OrderCompletedEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 10, // 高优先级，确保及时入账
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      const job = await this.orderQueue.add(
        'order-completed',
        data,
        jobOptions,
      );

      this.logger.log(
        `Order completed event queued: ${data.orderId}, ` +
          `User: ${data.userId}, Amount: ${data.settlementAmount}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue order completed event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理订单取消
   */
  async handleOrderCancelled(data: OrderCancelledEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 9,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      };

      const job = await this.orderQueue.add(
        'order-cancelled',
        data,
        jobOptions,
      );

      this.logger.log(
        `Order cancelled event queued: ${data.orderId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue order cancelled event: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 取消派单任务（用户修改订单时）
   */
  async cancelDispatchTask(orderId: string): Promise<void> {
    try {
      const jobs = await this.orderQueue.getJobs(['delayed', 'waiting']);

      for (const job of jobs) {
        if (job.name === 'dispatch-order' && job.data.orderId === orderId) {
          await job.remove();
          this.logger.log(`Cancelled dispatch task for order: ${orderId}`);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to cancel dispatch task: ${(error as Error).message}`,
        (error as Error).stack,
      );
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
        this.orderQueue.getWaiting(),
        this.orderQueue.getActive(),
        this.orderQueue.getCompleted(),
        this.orderQueue.getFailed(),
        this.orderQueue.getDelayed(),
      ]);

      const isPaused = await this.orderQueue.isPaused();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        paused: isPaused,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get queue stats: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 清理已完成的任务
   */
  async cleanCompleted(grace: number = 0): Promise<void> {
    try {
      await this.orderQueue.clean(grace, 'completed');
      this.logger.log(`Cleaned completed jobs older than ${grace}ms`);
    } catch (error) {
      this.logger.error(
        `Failed to clean completed jobs: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 暂停队列
   */
  async pause(): Promise<void> {
    try {
      await this.orderQueue.pause();
      this.logger.log('Order queue paused');
    } catch (error) {
      this.logger.error(
        `Failed to pause queue: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 恢复队列
   */
  async resume(): Promise<void> {
    try {
      await this.orderQueue.resume();
      this.logger.log('Order queue resumed');
    } catch (error) {
      this.logger.error(
        `Failed to resume queue: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
