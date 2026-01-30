import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, JobOptions } from 'bull';
import { QUEUE_NAMES } from '../queue.constants';
import {
  SmsNotificationEventDto,
  PushNotificationEventDto,
  EmailNotificationEventDto,
  BatchNotificationEventDto,
  NotificationPriority,
} from '../dto/notification-events.dto';
import {
  WithdrawalCreatedEventDto,
  WithdrawalCompletedEventDto,
} from '../dto/payment-events.dto';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.NOTIFICATION) private notificationQueue: Queue,
  ) {}

  /**
   * 发送短信通知
   */
  async sendSms(data: SmsNotificationEventDto): Promise<void> {
    try {
      const priority = this.getPriorityValue(data.priority);

      const jobOptions: JobOptions = {
        priority,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      };

      const job = await this.notificationQueue.add(
        'send-sms',
        data,
        jobOptions,
      );

      this.logger.log(
        `SMS notification queued: ${data.phone}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue SMS notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 发送推送通知
   */
  async sendPush(data: PushNotificationEventDto): Promise<void> {
    try {
      const priority = this.getPriorityValue(data.priority);

      const jobOptions: JobOptions = {
        priority,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
      };

      const job = await this.notificationQueue.add(
        'send-push',
        data,
        jobOptions,
      );

      this.logger.log(
        `Push notification queued: ${data.userId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue push notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 发送邮件通知
   */
  async sendEmail(data: EmailNotificationEventDto): Promise<void> {
    try {
      const priority = this.getPriorityValue(data.priority);

      const jobOptions: JobOptions = {
        priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      };

      const job = await this.notificationQueue.add(
        'send-email',
        data,
        jobOptions,
      );

      this.logger.log(
        `Email notification queued: ${data.to}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue email notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 批量发送通知
   */
  async sendBatchNotifications(data: BatchNotificationEventDto): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 6,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      };

      const job = await this.notificationQueue.add(
        'batch-notification',
        data,
        jobOptions,
      );

      this.logger.log(
        `Batch notification queued: ${data.type}, Count: ${data.notifications.length}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue batch notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 发送订单状态变更通知
   */
  async sendOrderStatusNotification(
    userId: string,
    orderId: string,
    status: string,
    phone?: string,
  ): Promise<void> {
    try {
      // 发送推送通知
      await this.sendPush({
        userId,
        title: '订单状态更新',
        content: `您的订单 ${orderId} 状态已更新为: ${status}`,
        data: { orderId, status },
        priority: NotificationPriority.HIGH,
      });

      // 如果有手机号，发送短信
      if (phone) {
        await this.sendSms({
          phone,
          template: 'order_status_changed',
          params: { orderId, status },
          priority: NotificationPriority.NORMAL,
        });
      }

      this.logger.log(`Order status notification sent for order: ${orderId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send order status notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 获取优先级数值
   */
  private getPriorityValue(priority?: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.HIGH:
        return 10;
      case NotificationPriority.LOW:
        return 5;
      case NotificationPriority.NORMAL:
      default:
        return 8;
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
        this.notificationQueue.getWaiting(),
        this.notificationQueue.getActive(),
        this.notificationQueue.getCompleted(),
        this.notificationQueue.getFailed(),
        this.notificationQueue.getDelayed(),
      ]);

      const isPaused = await this.notificationQueue.isPaused();

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
   * 暂停队列
   */
  async pause(): Promise<void> {
    try {
      await this.notificationQueue.pause();
      this.logger.log('Notification queue paused');
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
      await this.notificationQueue.resume();
      this.logger.log('Notification queue resumed');
    } catch (error) {
      this.logger.error(
        `Failed to resume queue: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 发送提现创建通知
   */
  async sendWithdrawalCreatedNotification(
    data: WithdrawalCreatedEventDto,
  ): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 9,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
      };

      const job = await this.notificationQueue.add(
        'withdrawal-created',
        data,
        jobOptions,
      );

      this.logger.log(
        `Withdrawal created notification queued: ${data.withdrawalId}, User: ${data.userId}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue withdrawal created notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 发送提现完成通知
   */
  async sendWithdrawalCompletedNotification(
    data: WithdrawalCompletedEventDto,
  ): Promise<void> {
    try {
      const jobOptions: JobOptions = {
        priority: 10,
        attempts: 3,
        backoff: {
          type: 'fixed',
          delay: 3000,
        },
      };

      const job = await this.notificationQueue.add(
        'withdrawal-completed',
        data,
        jobOptions,
      );

      this.logger.log(
        `Withdrawal completed notification queued: ${data.withdrawalId}, Status: ${data.status}, Job ID: ${job.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue withdrawal completed notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
