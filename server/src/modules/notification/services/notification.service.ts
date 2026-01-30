import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  INotificationService,
  SendNotificationData,
  SendBatchNotificationData,
  CreateTemplateData,
  UpdateTemplateData,
  NotificationFilters,
  TemplateFilters,
  BatchFilters,
  NotificationProvider,
} from '../interfaces/notification.interface';
import {
  NotificationStatsEntity,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from '../entities/notification.entity';
import { NOTIFICATION_COSTS } from '@/common/constants';
import {
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  RedisService,
} from '@/common';

@Injectable()
export class NotificationService implements INotificationService, OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.idGenerator = new PersistentSnowflakeIdGenerator({
      workerId: this.configService.get<number>('NOTIFICATION_WORKER_ID', 10),
      datacenterId: this.configService.get<number>('DATACENTER_ID', 1),
      stateStore: new RedisSnowflakeStateStore(this.redisService),
      stateKey: 'snowflake:state:notification',
      metricsKey: 'snowflake:notification',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.idGenerator.initialize();
  }

  async sendNotification(data: SendNotificationData): Promise<any> {
    const id = this.generateNotificationId();

    const notification = await this.prisma.notification.create({
      data: {
        id: BigInt(id),
        type: data.type,
        status: NotificationStatus.PENDING as any,
        priority: (data.priority || NotificationPriority.NORMAL) as any,
        recipient: data.recipient as any,
        content:
          typeof (data as any).content === 'string'
            ? (data as any).content
            : JSON.stringify((data as any).content),
        deliveryOptions: (data as any).deliveryOptions,
      },
    });

    // 异步发送通知
    this.processNotification(notification).catch((error) => {
      this.logger.error(
        `Failed to process notification ${id}: ${error.message}`,
      );
    });

    this.logger.log(`Created notification: ${id}`);
    return notification;
  }

  async sendSms(data: {
    phone: string;
    template: string;
    params: Record<string, any>;
  }): Promise<{ messageId: string }> {
    const messageId = this.generateMessageId();
    return { messageId };
  }

  async sendPush(data: {
    userId: string | number;
    title: string;
    content: string;
    data?: Record<string, any>;
  }): Promise<{
    success: boolean;
    devicesCount: number;
    successCount: number;
    sentAt: string;
  }> {
    const devicesCount = 1;
    const successCount = 1;
    return {
      success: true,
      devicesCount,
      successCount,
      sentAt: new Date().toISOString(),
    };
  }

  async sendEmail(data: {
    to: string;
    subject: string;
    content: string;
    template?: string;
    params?: Record<string, any>;
  }): Promise<{ messageId: string }> {
    const messageId = this.generateMessageId();
    return { messageId };
  }

  async sendBatch(
    type: string,
    notifications: any[],
  ): Promise<{ successCount: number; failedCount: number }> {
    let successCount = 0;
    let failedCount = 0;
    for (const n of notifications) {
      try {
        await this.sendNotification(n);
        successCount++;
      } catch {
        failedCount++;
      }
    }
    return { successCount, failedCount };
  }

  async getUserPhone(userId: string | number): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    return user?.mobile || null;
  }

  async sendBatchNotifications(data: SendBatchNotificationData): Promise<any> {
    const batchId = this.generateBatchId();

    const batch = await this.prisma.notificationBatch.create({
      data: {
        id: BigInt(batchId),
        name: data.batchName,
        description: data.description,
        totalCount: data.notifications.length,
        sentCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        status: NotificationStatus.PENDING,
      },
    });

    // 异步处理批量通知
    this.processBatchNotifications(batch, data.notifications).catch((error) => {
      this.logger.error(`Failed to process batch ${batchId}: ${error.message}`);
    });

    this.logger.log(`Created batch notification: ${batchId}`);
    return batch;
  }

  async findNotifications(filters?: NotificationFilters): Promise<any[]> {
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.userId)
        where.recipient = { path: ['userId'], equals: filters.userId };
      if (filters.batchId)
        where.deliveryOptions = { path: ['batchId'], equals: filters.batchId };
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findNotificationById(id: string): Promise<any> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: BigInt(id) },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async retryNotification(id: string): Promise<any> {
    const notification = await this.findNotificationById(id);

    if (notification.status !== NotificationStatus.FAILED) {
      throw new BadRequestException('Only failed notifications can be retried');
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: BigInt(id) },
      data: {
        status: NotificationStatus.PENDING,
        deliveryOptions: {
          ...notification.deliveryOptions,
          retryCount: (notification.deliveryOptions?.retryCount || 0) + 1,
        },
      },
    });

    // 重新处理通知
    this.processNotification(updatedNotification).catch((error) => {
      this.logger.error(`Failed to retry notification ${id}: ${error.message}`);
    });

    this.logger.log(`Retrying notification: ${id}`);
    return updatedNotification;
  }

  async cancelNotification(id: string): Promise<any> {
    const notification = await this.findNotificationById(id);

    if (
      notification.status === NotificationStatus.SENT ||
      notification.status === NotificationStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Cannot cancel already sent or delivered notifications',
      );
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: BigInt(id) },
      data: { status: NotificationStatus.CANCELLED },
    });

    this.logger.log(`Cancelled notification: ${id}`);
    return updatedNotification;
  }

  async createTemplate(data: CreateTemplateData): Promise<any> {
    const id = this.generateTemplateId();

    const template = await this.prisma.notificationTemplate.create({
      data: {
        id: BigInt(id),
        name: data.name,
        type: data.type as any,
        subject: data.subject,
        content: data.content,
        variables: data.variables as any,
        isActive: true,
      },
    });

    this.logger.log(`Created template: ${id}`);
    return template;
  }

  async findTemplates(filters?: TemplateFilters): Promise<any[]> {
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.name)
        where.name = { contains: filters.name, mode: 'insensitive' };
    }

    return this.prisma.notificationTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplateById(id: string): Promise<any> {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id: BigInt(id) },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async updateTemplate(id: string, data: UpdateTemplateData): Promise<any> {
    const template = await this.findTemplateById(id);

    const updatedTemplate = await this.prisma.notificationTemplate.update({
      where: { id: BigInt(id) },
      data: {
        name: data.name,
        subject: data.subject,
        content: data.content,
        variables: data.variables as any,
      },
    });

    this.logger.log(`Updated template: ${id}`);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<{ success: boolean }> {
    await this.findTemplateById(id);

    await this.prisma.notificationTemplate.delete({
      where: { id: BigInt(id) },
    });

    this.logger.log(`Deleted template: ${id}`);
    return { success: true };
  }

  async findBatches(filters?: BatchFilters): Promise<any[]> {
    const where: any = {};

    if (filters) {
      if (filters.status) where.status = filters.status;
    }

    return this.prisma.notificationBatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBatchById(id: string): Promise<any> {
    const batch = await this.prisma.notificationBatch.findUnique({
      where: { id: BigInt(id) },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async getBatchNotifications(batchId: string): Promise<any[]> {
    await this.findBatchById(batchId); // 验证批次存在

    return this.prisma.notification.findMany({
      where: { deliveryOptions: { path: ['batchId'], equals: batchId } },
    });
  }

  async getNotificationStats(period: string): Promise<NotificationStatsEntity> {
    // 获取指定期间的通知
    const startDate = new Date(period + '-01');
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const notifications = await this.prisma.notification.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // 根据期间过滤通知
    const periodNotifications = notifications.filter((n) => {
      const notificationMonth = n.createdAt.toISOString().substring(0, 7); // YYYY-MM
      return notificationMonth === period;
    });

    const totalSent = periodNotifications.filter(
      (n) =>
        n.status === NotificationStatus.SENT ||
        n.status === NotificationStatus.DELIVERED,
    ).length;

    const totalDelivered = periodNotifications.filter(
      (n) => n.status === NotificationStatus.DELIVERED,
    ).length;

    const totalFailed = periodNotifications.filter(
      (n) => n.status === NotificationStatus.FAILED,
    ).length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    const deliveredNotifications = periodNotifications.filter(
      (n): n is typeof n & { deliveredAt: Date } => !!n.deliveredAt,
    );
    const averageDeliveryTime =
      deliveredNotifications.length > 0
        ? deliveredNotifications.reduce((sum, n) => {
            const deliveryTime =
              n.deliveredAt.getTime() - n.createdAt.getTime();
            return sum + deliveryTime;
          }, 0) /
          deliveredNotifications.length /
          1000 // 转换为秒
        : 0;

    // 计算各类型统计
    const breakdown: any = {
      sms: this.calculateTypeStats(
        periodNotifications as any,
        NotificationType.SMS,
      ),
      email: this.calculateTypeStats(
        periodNotifications as any,
        NotificationType.EMAIL,
      ),
      push: this.calculateTypeStats(
        periodNotifications as any,
        NotificationType.PUSH,
      ),
      inApp: this.calculateTypeStats(
        periodNotifications as any,
        NotificationType.IN_APP,
      ),
      webhook: this.calculateTypeStats(
        periodNotifications as any,
        NotificationType.WEBHOOK,
      ),
    };

    const costTotal = Object.values(
      breakdown as Record<string, { cost: number }>,
    ).reduce((sum, type) => sum + (type?.cost || 0), 0);

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate,
      averageDeliveryTime,
      costTotal,
      period,
      breakdown,
    };
  }

  async getDeliveryReport(startDate: Date, endDate: Date): Promise<any> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const report = {
      period: { startDate, endDate },
      summary: {
        total: notifications.length,
        sent: notifications.filter(
          (n) =>
            n.status === NotificationStatus.SENT ||
            n.status === NotificationStatus.DELIVERED,
        ).length,
        delivered: notifications.filter(
          (n) => n.status === NotificationStatus.DELIVERED,
        ).length,
        failed: notifications.filter(
          (n) => n.status === NotificationStatus.FAILED,
        ).length,
        pending: notifications.filter(
          (n) => n.status === NotificationStatus.PENDING,
        ).length,
      },
      byType: {} as Record<string, any>,
      byDay: {} as Record<string, any>,
    };

    // 按类型统计
    Object.values(NotificationType).forEach((type) => {
      const typeNotifications = notifications.filter((n) => n.type === type);
      report.byType[type] = {
        total: typeNotifications.length,
        sent: typeNotifications.filter(
          (n) =>
            n.status === NotificationStatus.SENT ||
            n.status === NotificationStatus.DELIVERED,
        ).length,
        delivered: typeNotifications.filter(
          (n) => n.status === NotificationStatus.DELIVERED,
        ).length,
        failed: typeNotifications.filter(
          (n) => n.status === NotificationStatus.FAILED,
        ).length,
      };
    });

    // 按天统计
    const dayMap = new Map<string, any>();
    notifications.forEach((n) => {
      const day = n.createdAt.toISOString().split('T')[0];
      if (!dayMap.has(day)) {
        dayMap.set(day, { total: 0, sent: 0, delivered: 0, failed: 0 });
      }
      const dayStats = dayMap.get(day)!;
      dayStats.total++;
      if (
        n.status === NotificationStatus.SENT ||
        n.status === NotificationStatus.DELIVERED
      )
        dayStats.sent++;
      if (n.status === NotificationStatus.DELIVERED) dayStats.delivered++;
      if (n.status === NotificationStatus.FAILED) dayStats.failed++;
    });

    report.byDay = Object.fromEntries(dayMap);

    return report;
  }

  async getProviders(): Promise<NotificationProvider[]> {
    // 在实际应用中，这可能来自数据库配置或ConfigService
    return [
      {
        name: 'sms-provider',
        type: NotificationType.SMS,
        isEnabled: true,
        config: {
          apiKey: this.configService.get('SMS_API_KEY', 'mock-sms-key'),
          endpoint: this.configService.get(
            'SMS_ENDPOINT',
            'https://sms.example.com',
          ),
        },
      },
      {
        name: 'email-provider',
        type: NotificationType.EMAIL,
        isEnabled: true,
        config: {
          apiKey: this.configService.get('EMAIL_API_KEY', 'mock-email-key'),
          endpoint: this.configService.get(
            'EMAIL_ENDPOINT',
            'https://email.example.com',
          ),
        },
      },
      {
        name: 'push-provider',
        type: NotificationType.PUSH,
        isEnabled: true,
        config: {
          apiKey: this.configService.get('PUSH_API_KEY', 'mock-push-key'),
          endpoint: this.configService.get(
            'PUSH_ENDPOINT',
            'https://push.example.com',
          ),
        },
      },
      {
        name: 'webhook-provider',
        type: NotificationType.WEBHOOK,
        isEnabled: true,
        config: {
          timeout: this.configService.get('WEBHOOK_TIMEOUT', 30000),
          retries: this.configService.get('WEBHOOK_RETRIES', 3),
        },
      },
    ];
  }

  async updateProviderConfig(
    providerName: string,
    config: Record<string, any>,
  ): Promise<NotificationProvider> {
    // 在实际应用中，这会更新数据库中的配置
    const providers = await this.getProviders();
    const provider = providers.find((p) => p.name === providerName);

    if (!provider) {
      throw new NotFoundException(`Provider ${providerName} not found`);
    }

    provider.config = { ...provider.config, ...config };

    this.logger.log(`Updated provider config: ${providerName}`);
    return provider;
  }

  async validateTemplate(
    templateId: string,
    data: Record<string, any>,
  ): Promise<{ isValid: boolean; errors?: string[] }> {
    const template = await this.findTemplateById(templateId);
    const errors: string[] = [];

    // 检查必需变量
    (template.variables as string[]).forEach((variable) => {
      if (!(variable in data)) {
        errors.push(`Missing required variable: ${variable}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async renderTemplate(
    templateId: string,
    data: Record<string, any>,
  ): Promise<{ subject?: string; content: string }> {
    const template = await this.findTemplateById(templateId);

    // 验证模板数据
    const validation = await this.validateTemplate(templateId, data);
    if (!validation.isValid) {
      throw new BadRequestException(
        `Template validation failed: ${validation.errors?.join(', ')}`,
      );
    }

    // 简单的模板渲染（实际应用中可能使用更复杂的模板引擎）
    let content = template.content;
    let subject = template.subject;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
      if (subject) {
        subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });

    return { subject, content };
  }

  private async processNotification(notification: any): Promise<void> {
    try {
      const updatedNotification = await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT as any,
          sentAt: new Date(),
        },
      });

      // 模拟发送过程
      const providers = await this.getProviders();
      const provider = providers.find(
        (p) => p.type === (updatedNotification.type as any),
      );
      if (!provider || !provider.isEnabled) {
        throw new Error(
          `Provider for ${updatedNotification.type} is not available`,
        );
      }

      // 模拟发送延迟
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 模拟发送结果
      const success = true;

      if (success) {
        await this.prisma.notification.update({
          where: { id: updatedNotification.id },
          data: {
            status: NotificationStatus.DELIVERED as any,
            deliveredAt: new Date(),
            result: {
              messageId: this.generateMessageId(),
              externalId: `ext-${Date.now()}`,
              deliveredAt: new Date(),
              cost: this.calculateCost(updatedNotification.type as any),
              metadata: { provider: provider.name },
            },
          },
        });
      } else {
        await this.prisma.notification.update({
          where: { id: updatedNotification.id },
          data: {
            status: NotificationStatus.FAILED as any,
            failedAt: new Date(),
            result: {
              messageId: this.generateMessageId(),
              failureReason: 'Simulated delivery failure',
              cost: 0,
            },
          },
        });
      }

      this.logger.log(
        `Processed notification ${updatedNotification.id}: ${updatedNotification.status}`,
      );
    } catch (error: any) {
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED as any,
          failedAt: new Date(),
          result: {
            messageId: this.generateMessageId(),
            failureReason: error.message,
            cost: 0,
          },
        },
      });

      this.logger.error(
        `Failed to process notification ${notification.id}: ${error.message}`,
      );
    }
  }

  private async processBatchNotifications(
    batch: any,
    notifications: any[],
  ): Promise<void> {
    const updatedBatch = await this.prisma.notificationBatch.update({
      where: { id: batch.id },
      data: { status: 'PROCESSING' as any },
    });

    try {
      let sentCount = 0;
      let deliveredCount = 0;
      let failedCount = 0;

      for (const notificationData of notifications) {
        // 添加批次ID到delivery options
        const deliveryOptions = {
          ...notificationData.deliveryOptions,
          batchId: updatedBatch.id,
        };

        const notification = await this.sendNotification({
          ...notificationData,
          deliveryOptions,
        });

        // 等待通知处理完成
        await new Promise((resolve) => setTimeout(resolve, 100));

        const processedNotification = await this.findNotificationById(
          notification.id,
        );

        if (
          processedNotification.status === NotificationStatus.SENT ||
          processedNotification.status === NotificationStatus.DELIVERED
        ) {
          sentCount++;
        }
        if (processedNotification.status === NotificationStatus.DELIVERED) {
          deliveredCount++;
        }
        if (processedNotification.status === NotificationStatus.FAILED) {
          failedCount++;
        }
      }

      await this.prisma.notificationBatch.update({
        where: { id: updatedBatch.id },
        data: {
          status: 'COMPLETED' as any,
          completedAt: new Date(),
          sentCount,
          deliveredCount,
          failedCount,
        },
      });
    } catch (error: any) {
      await this.prisma.notificationBatch.update({
        where: { id: updatedBatch.id },
        data: { status: 'FAILED' as any },
      });

      this.logger.error(
        `Batch processing failed for ${updatedBatch.id}: ${error.message}`,
      );
    }
  }

  private calculateTypeStats(notifications: any[], type: NotificationType) {
    const typeNotifications = notifications.filter(
      (n) => String(n.type) === String(type),
    );
    return {
      sent: typeNotifications.filter(
        (n) =>
          n.status === NotificationStatus.SENT ||
          n.status === NotificationStatus.DELIVERED,
      ).length,
      delivered: typeNotifications.filter(
        (n) => n.status === NotificationStatus.DELIVERED,
      ).length,
      failed: typeNotifications.filter(
        (n) => n.status === NotificationStatus.FAILED,
      ).length,
      cost: typeNotifications.reduce(
        (sum, n) => sum + (n.result?.cost || 0),
        0,
      ),
    };
  }

  private calculateCost(type: NotificationType): number {
    return NOTIFICATION_COSTS[type] || 0;
  }

  private generateNotificationId(): string {
    // Replace Snowflake with Timestamp + Random to avoid collisions
    const timestamp = BigInt(Date.now());
    const random = BigInt(Math.floor(Math.random() * 1000000));
    return (timestamp * 1000000n + random).toString();
  }

  private generateBatchId(): string {
    return this.idGenerator.nextId();
  }

  private generateTemplateId(): string {
    return this.idGenerator.nextId();
  }

  private generateMessageId(): string {
    return this.idGenerator.nextId();
  }
}
