import { QUEUE_NAMES } from '@/common';
import { TemplateType } from '@/modules/notification/entities/notification.entity';
import { NotificationService } from '@/modules/notification/services/notification.service';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import {
  BatchNotificationEventDto,
  EmailNotificationEventDto,
  PushNotificationEventDto,
  SmsNotificationEventDto,
} from '../dto/notification-events.dto';
import {
  WithdrawalCompletedEventDto,
  WithdrawalCreatedEventDto,
} from '../dto/payment-events.dto';
import { DeadLetterQueueService } from '../services/dead-letter-queue.service';

@Processor(QUEUE_NAMES.NOTIFICATION)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly deadLetterQueueService: DeadLetterQueueService,
  ) {}

  /**
   * 处理短信通知
   */
  @Process({ name: 'send-sms', concurrency: 5 })
  async handleSendSms(job: Job<SmsNotificationEventDto>): Promise<any> {
    const { phone, template, params, priority } = job.data;

    this.logger.log(
      `Processing SMS notification: ${phone}, Template: ${template}, Priority: ${priority}`,
    );

    try {
      // 1. 验证手机号格式
      if (!this.validatePhoneNumber(phone)) {
        throw new Error(`Invalid phone number: ${phone}`);
      }

      // 2. 调用通知服务API发送短信
      this.logger.log(`Sending SMS via notification service to: ${phone}`);
      const result = await this.notificationService.sendSms({
        phone,
        template,
        params,
      });

      // 3. 记录发送日志
      this.logger.log(
        `SMS sent successfully to: ${phone}, MessageId: ${result.messageId}`,
      );

      return {
        success: true,
        phone,
        messageId: result.messageId,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phone}: ${(error as Error).message}`,
        (error as Error).stack,
      );

      // 如果是速率限制错误，延迟重试
      if ((error as Error).message.includes('rate limit')) {
        throw new Error('Rate limit exceeded, will retry later');
      }

      throw error;
    }
  }

  /**
   * 处理推送通知
   */
  @Process({ name: 'send-push', concurrency: 10 })
  async handleSendPush(job: Job<PushNotificationEventDto>): Promise<any> {
    const { userId, title, content, data, priority } = job.data;

    this.logger.log(
      `Processing push notification: ${userId}, Title: ${title}, Priority: ${priority}`,
    );

    try {
      // 1. 调用通知服务API发送推送
      this.logger.log(
        `Sending push notification via notification service to user: ${userId}`,
      );
      const result = await this.notificationService.sendPush({
        userId,
        title,
        content,
        data,
      });

      // 2. 记录发送结果
      this.logger.log(
        `Push notification sent: ${result.successCount}/${result.devicesCount} devices`,
      );

      return {
        success: result.success,
        userId,
        devicesCount: result.devicesCount,
        successCount: result.successCount,
        sentAt: result.sentAt,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to ${userId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理邮件通知
   */
  @Process({ name: 'send-email', concurrency: 5 })
  async handleSendEmail(job: Job<EmailNotificationEventDto>): Promise<any> {
    const { to, subject, content, template, params, priority } = job.data;

    this.logger.log(
      `Processing email notification: ${to}, Subject: ${subject}, Priority: ${priority}`,
    );

    try {
      // 1. 验证邮箱格式
      if (!this.validateEmail(to)) {
        throw new Error(`Invalid email address: ${to}`);
      }

      // 2. 调用通知服务API发送邮件
      this.logger.log(`Sending email via notification service to: ${to}`);
      const result = await this.notificationService.sendEmail({
        to,
        subject,
        content,
        template,
        params,
      });

      // 3. 记录发送日志
      this.logger.log(
        `Email sent successfully to: ${to}, MessageId: ${result.messageId}`,
      );

      return {
        success: true,
        to,
        messageId: result.messageId,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理批量通知
   */
  @Process({ name: 'batch-notification', concurrency: 3 })
  async handleBatchNotification(
    job: Job<BatchNotificationEventDto>,
  ): Promise<any> {
    const { type, notifications } = job.data;

    this.logger.log(
      `Processing batch notification: Type ${type}, Count: ${notifications.length}`,
    );

    try {
      // 调用通知服务的批量发送API
      this.logger.log(
        `Sending batch ${type} notifications: ${notifications.length} items`,
      );
      const result = await this.notificationService.sendBatch(
        type,
        notifications,
      );

      const successCount = result.successCount || 0;
      const failedCount = result.failedCount || 0;

      this.logger.log(
        `Batch notification completed: ${successCount} succeeded, ${failedCount} failed`,
      );

      return {
        success: true,
        type,
        total: notifications.length,
        successCount,
        failedCount,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process batch notification: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理提现申请创建通知
   */
  @Process({ name: 'withdrawal-created', concurrency: 5 })
  async handleWithdrawalCreated(
    job: Job<WithdrawalCreatedEventDto>,
  ): Promise<any> {
    const { withdrawalId, userId, amount, provider, outTradeNo, createdAt } =
      job.data;

    this.logger.log(
      `Processing withdrawal created notification: ${withdrawalId}, User: ${userId}, Amount: ${amount}`,
    );

    try {
      const userPhone = await this.notificationService.getUserPhone(userId);

      await this.notificationService.sendByTemplateType(
        TemplateType.WITHDRAWAL_RESULT,
        {
          withdrawalId,
          amount: amount.toFixed(2),
          outTradeNo,
          provider: provider === 'WECHAT' ? '微信' : '支付宝',
          status: 'PENDING',
          createdAt: new Date(createdAt).toLocaleString('zh-CN'),
        },
        {
          push: { userId },
          ...(userPhone ? { sms: { phone: userPhone } } : {}),
        },
      );

      this.logger.log(
        `Withdrawal created notification sent successfully: ${withdrawalId}`,
      );

      return {
        success: true,
        withdrawalId,
        userId,
        notificationsSent: ['sms', 'push'],
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send withdrawal created notification: ${withdrawalId}`,
        (error as Error).message,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 处理提现完成通知
   */
  @Process({ name: 'withdrawal-completed', concurrency: 5 })
  async handleWithdrawalCompleted(
    job: Job<WithdrawalCompletedEventDto>,
  ): Promise<any> {
    const {
      withdrawalId,
      userId,
      amount,
      status,
      transactionId,
      rejectedReason,
      completedAt,
    } = job.data;

    this.logger.log(
      `Processing withdrawal completed notification: ${withdrawalId}, Status: ${status}`,
    );

    try {
      if (!['SUCCESS', 'FAILED', 'PENDING', 'REJECTED'].includes(status)) {
        this.logger.warn(`Unknown withdrawal status: ${status}`);
        return {
          success: false,
          withdrawalId,
          reason: 'Unknown status',
        };
      }

      const userPhone = await this.notificationService.getUserPhone(userId);

      await this.notificationService.sendByTemplateType(
        TemplateType.WITHDRAWAL_RESULT,
        {
          withdrawalId,
          amount: amount.toFixed(2),
          status,
          transactionId: transactionId || '',
          rejectedReason: rejectedReason || '',
          completedAt: new Date(completedAt).toLocaleString('zh-CN'),
        },
        {
          push: { userId },
          ...(userPhone ? { sms: { phone: userPhone } } : {}),
        },
      );

      this.logger.log(
        `Withdrawal completed notification sent successfully: ${withdrawalId}`,
      );

      return {
        success: true,
        withdrawalId,
        userId,
        status,
        notificationsSent: ['sms', 'push'],
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to send withdrawal completed notification: ${withdrawalId}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * 任务开始处理时的钩子
   */
  @OnQueueActive()
  onActive(job: Job): void {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  /**
   * 任务完成时的钩子
   */
  @OnQueueCompleted()
  onCompleted(job: Job, _result: any): void {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  /**
   * 任务失败时的钩子
   */
  @OnQueueFailed()
  async onFailed(job: Job, error: Error): Promise<void> {
    this.logger.error(
      `Job ${job.id} failed with error: ${error.message}`,
      error.stack,
    );

    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      await this.deadLetterQueueService.recordFailure({
        queueName: job.queue.name,
        jobId: job.id,
        jobName: job.name,
        data: job.data,
        error: error.message,
        attemptsMade: job.attemptsMade,
        failedAt: new Date(),
      });
    }
  }

  /**
   * 验证手机号格式
   */
  private validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * 验证邮箱格式
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
