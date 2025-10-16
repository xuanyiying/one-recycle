import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SnowflakeIdGenerator } from '@one-recycle/shared';
import {
  INotificationService,
  SendNotificationData,
  SendBatchNotificationData,
  CreateTemplateData,
  UpdateTemplateData,
  NotificationFilters,
  TemplateFilters,
  BatchFilters,
  NotificationProvider
} from '../interfaces/notification.interface';
import {
  NotificationEntity,
  NotificationTemplateEntity,
  NotificationBatchEntity,
  NotificationStatsEntity,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  TemplateType
} from '../entities/notification.entity';

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly idGenerator: SnowflakeIdGenerator;
  
  // 模拟数据存储 - 实际应用中应使用数据库
  private notifications: Map<string, NotificationEntity> = new Map();
  private templates: Map<string, NotificationTemplateEntity> = new Map();
  private batches: Map<string, NotificationBatchEntity> = new Map();
  private providers: Map<string, NotificationProvider> = new Map();

  constructor() {
    this.idGenerator = new SnowflakeIdGenerator({ workerId: 10, datacenterId: 1 });
    this.initializeProviders();
    this.initializeTemplates();
  }

  async sendNotification(data: SendNotificationData): Promise<NotificationEntity> {
    const id = this.generateNotificationId();
    
    const notification: NotificationEntity = {
      id,
      type: data.type,
      status: NotificationStatus.PENDING,
      priority: data.priority || NotificationPriority.NORMAL,
      recipient: data.recipient,
      content: data.content,
      deliveryOptions: data.deliveryOptions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.notifications.set(id, notification);

    // 异步发送通知
    this.processNotification(notification).catch(error => {
      this.logger.error(`Failed to process notification ${id}: ${error.message}`);
    });

    this.logger.log(`Created notification: ${id}`);
    return notification;
  }

  async sendBatchNotifications(data: SendBatchNotificationData): Promise<NotificationBatchEntity> {
    const batchId = this.generateBatchId();
    
    const batch: NotificationBatchEntity = {
      id: batchId,
      name: data.batchName,
      description: data.description,
      totalCount: data.notifications.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.batches.set(batchId, batch);

    // 异步处理批量通知
    this.processBatchNotifications(batch, data.notifications).catch(error => {
      this.logger.error(`Failed to process batch ${batchId}: ${error.message}`);
    });

    this.logger.log(`Created batch notification: ${batchId}`);
    return batch;
  }

  async findNotifications(filters?: NotificationFilters): Promise<NotificationEntity[]> {
    let notifications = Array.from(this.notifications.values());

    if (filters) {
      if (filters.type) {
        notifications = notifications.filter(n => n.type === filters.type);
      }
      if (filters.status) {
        notifications = notifications.filter(n => n.status === filters.status);
      }
      if (filters.priority) {
        notifications = notifications.filter(n => n.priority === filters.priority);
      }
      if (filters.userId) {
        notifications = notifications.filter(n => n.recipient.userId === filters.userId);
      }
      if (filters.startDate) {
        notifications = notifications.filter(n => n.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        notifications = notifications.filter(n => n.createdAt <= filters.endDate!);
      }
      if (filters.batchId) {
        notifications = notifications.filter(n => n.deliveryOptions?.batchId === filters.batchId);
      }
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findNotificationById(id: string): Promise<NotificationEntity> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async retryNotification(id: string): Promise<NotificationEntity> {
    const notification = await this.findNotificationById(id);
    
    if (notification.status !== NotificationStatus.FAILED) {
      throw new BadRequestException('Only failed notifications can be retried');
    }

    notification.status = NotificationStatus.PENDING;
    notification.updatedAt = new Date();
    
    if (notification.deliveryOptions) {
      notification.deliveryOptions.retryCount = (notification.deliveryOptions.retryCount || 0) + 1;
    }

    this.notifications.set(id, notification);

    // 重新处理通知
    this.processNotification(notification).catch(error => {
      this.logger.error(`Failed to retry notification ${id}: ${error.message}`);
    });

    this.logger.log(`Retrying notification: ${id}`);
    return notification;
  }

  async cancelNotification(id: string): Promise<NotificationEntity> {
    const notification = await this.findNotificationById(id);
    
    if (notification.status === NotificationStatus.SENT || notification.status === NotificationStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel already sent or delivered notifications');
    }

    notification.status = NotificationStatus.CANCELLED;
    notification.updatedAt = new Date();

    this.notifications.set(id, notification);
    this.logger.log(`Cancelled notification: ${id}`);
    
    return notification;
  }

  async createTemplate(data: CreateTemplateData): Promise<NotificationTemplateEntity> {
    const id = this.generateTemplateId();
    
    const template: NotificationTemplateEntity = {
      id,
      name: data.name,
      type: data.type,
      subject: data.subject,
      content: data.content,
      variables: data.variables,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(id, template);
    this.logger.log(`Created template: ${id}`);
    
    return template;
  }

  async findTemplates(filters?: TemplateFilters): Promise<NotificationTemplateEntity[]> {
    let templates = Array.from(this.templates.values());

    if (filters) {
      if (filters.type) {
        templates = templates.filter(t => t.type === filters.type);
      }
      if (filters.isActive !== undefined) {
        templates = templates.filter(t => t.isActive === filters.isActive);
      }
      if (filters.name) {
        templates = templates.filter(t => t.name.toLowerCase().includes(filters.name!.toLowerCase()));
      }
    }

    return templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findTemplateById(id: string): Promise<NotificationTemplateEntity> {
    const template = this.templates.get(id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async updateTemplate(id: string, data: UpdateTemplateData): Promise<NotificationTemplateEntity> {
    const template = await this.findTemplateById(id);
    
    Object.assign(template, {
      ...data,
      updatedAt: new Date(),
    });

    this.templates.set(id, template);
    this.logger.log(`Updated template: ${id}`);
    
    return template;
  }

  async deleteTemplate(id: string): Promise<{ success: boolean }> {
    const template = await this.findTemplateById(id);
    
    this.templates.delete(id);
    this.logger.log(`Deleted template: ${id}`);
    
    return { success: true };
  }

  async findBatches(filters?: BatchFilters): Promise<NotificationBatchEntity[]> {
    let batches = Array.from(this.batches.values());

    if (filters) {
      if (filters.status) {
        batches = batches.filter(b => b.status === filters.status);
      }
      if (filters.startDate) {
        batches = batches.filter(b => b.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        batches = batches.filter(b => b.createdAt <= filters.endDate!);
      }
    }

    return batches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findBatchById(id: string): Promise<NotificationBatchEntity> {
    const batch = this.batches.get(id);
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async getBatchNotifications(batchId: string): Promise<NotificationEntity[]> {
    await this.findBatchById(batchId); // 验证批次存在
    
    return this.findNotifications({ batchId });
  }

  async getNotificationStats(period: string): Promise<NotificationStatsEntity> {
    const notifications = Array.from(this.notifications.values());
    
    // 根据期间过滤通知
    const periodNotifications = notifications.filter(n => {
      const notificationMonth = n.createdAt.toISOString().substring(0, 7); // YYYY-MM
      return notificationMonth === period;
    });

    const totalSent = periodNotifications.filter(n => 
      n.status === NotificationStatus.SENT || 
      n.status === NotificationStatus.DELIVERED
    ).length;
    
    const totalDelivered = periodNotifications.filter(n => 
      n.status === NotificationStatus.DELIVERED
    ).length;
    
    const totalFailed = periodNotifications.filter(n => 
      n.status === NotificationStatus.FAILED
    ).length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    
    const deliveredNotifications = periodNotifications.filter(n => n.deliveredAt);
    const averageDeliveryTime = deliveredNotifications.length > 0
      ? deliveredNotifications.reduce((sum, n) => {
          const deliveryTime = n.deliveredAt!.getTime() - n.createdAt.getTime();
          return sum + deliveryTime;
        }, 0) / deliveredNotifications.length / 1000 // 转换为秒
      : 0;

    // 计算各类型统计
    const breakdown = {
      sms: this.calculateTypeStats(periodNotifications, NotificationType.SMS),
      email: this.calculateTypeStats(periodNotifications, NotificationType.EMAIL),
      push: this.calculateTypeStats(periodNotifications, NotificationType.PUSH),
      inApp: this.calculateTypeStats(periodNotifications, NotificationType.IN_APP),
      webhook: this.calculateTypeStats(periodNotifications, NotificationType.WEBHOOK),
    };

    const costTotal = Object.values(breakdown).reduce((sum, type) => sum + type.cost, 0);

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
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.createdAt >= startDate && n.createdAt <= endDate);

    const report = {
      period: { startDate, endDate },
      summary: {
        total: notifications.length,
        sent: notifications.filter(n => n.status === NotificationStatus.SENT || n.status === NotificationStatus.DELIVERED).length,
        delivered: notifications.filter(n => n.status === NotificationStatus.DELIVERED).length,
        failed: notifications.filter(n => n.status === NotificationStatus.FAILED).length,
        pending: notifications.filter(n => n.status === NotificationStatus.PENDING).length,
      },
      byType: {},
      byDay: {},
    };

    // 按类型统计
    Object.values(NotificationType).forEach(type => {
      const typeNotifications = notifications.filter(n => n.type === type);
      report.byType[type] = {
        total: typeNotifications.length,
        sent: typeNotifications.filter(n => n.status === NotificationStatus.SENT || n.status === NotificationStatus.DELIVERED).length,
        delivered: typeNotifications.filter(n => n.status === NotificationStatus.DELIVERED).length,
        failed: typeNotifications.filter(n => n.status === NotificationStatus.FAILED).length,
      };
    });

    // 按天统计
    const dayMap = new Map<string, any>();
    notifications.forEach(n => {
      const day = n.createdAt.toISOString().split('T')[0];
      if (!dayMap.has(day)) {
        dayMap.set(day, { total: 0, sent: 0, delivered: 0, failed: 0 });
      }
      const dayStats = dayMap.get(day)!;
      dayStats.total++;
      if (n.status === NotificationStatus.SENT || n.status === NotificationStatus.DELIVERED) dayStats.sent++;
      if (n.status === NotificationStatus.DELIVERED) dayStats.delivered++;
      if (n.status === NotificationStatus.FAILED) dayStats.failed++;
    });

    report.byDay = Object.fromEntries(dayMap);

    return report;
  }

  async getProviders(): Promise<NotificationProvider[]> {
    return Array.from(this.providers.values());
  }

  async updateProviderConfig(providerName: string, config: Record<string, any>): Promise<NotificationProvider> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new NotFoundException(`Provider ${providerName} not found`);
    }

    provider.config = { ...provider.config, ...config };
    this.providers.set(providerName, provider);
    
    this.logger.log(`Updated provider config: ${providerName}`);
    return provider;
  }

  async validateTemplate(templateId: string, data: Record<string, any>): Promise<{ isValid: boolean; errors?: string[] }> {
    const template = await this.findTemplateById(templateId);
    const errors: string[] = [];

    // 检查必需变量
    template.variables.forEach(variable => {
      if (!(variable in data)) {
        errors.push(`Missing required variable: ${variable}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async renderTemplate(templateId: string, data: Record<string, any>): Promise<{ subject?: string; content: string }> {
    const template = await this.findTemplateById(templateId);
    
    // 验证模板数据
    const validation = await this.validateTemplate(templateId, data);
    if (!validation.isValid) {
      throw new BadRequestException(`Template validation failed: ${validation.errors?.join(', ')}`);
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

  private async processNotification(notification: NotificationEntity): Promise<void> {
    try {
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      notification.updatedAt = new Date();

      // 模拟发送过程
      const provider = this.providers.get(`${notification.type.toLowerCase()}-provider`);
      if (!provider || !provider.isEnabled) {
        throw new Error(`Provider for ${notification.type} is not available`);
      }

      // 模拟发送延迟
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

      // 模拟发送结果
      const success = Math.random() > 0.1; // 90% 成功率
      
      if (success) {
        notification.status = NotificationStatus.DELIVERED;
        notification.deliveredAt = new Date();
        notification.result = {
          messageId: this.generateMessageId(),
          externalId: `ext-${Date.now()}`,
          deliveredAt: new Date(),
          cost: this.calculateCost(notification.type),
          metadata: { provider: provider.name },
        };
      } else {
        notification.status = NotificationStatus.FAILED;
        notification.failedAt = new Date();
        notification.result = {
          messageId: this.generateMessageId(),
          failureReason: 'Simulated delivery failure',
          cost: 0,
        };
      }

      this.notifications.set(notification.id, notification);
      this.logger.log(`Processed notification ${notification.id}: ${notification.status}`);

    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.failedAt = new Date();
      notification.updatedAt = new Date();
      notification.result = {
        messageId: this.generateMessageId(),
        failureReason: error.message,
        cost: 0,
      };

      this.notifications.set(notification.id, notification);
      this.logger.error(`Failed to process notification ${notification.id}: ${error.message}`);
    }
  }

  private async processBatchNotifications(batch: NotificationBatchEntity, notifications: SendNotificationData[]): Promise<void> {
    batch.status = 'PROCESSING';
    batch.updatedAt = new Date();
    this.batches.set(batch.id, batch);

    try {
      for (const notificationData of notifications) {
        // 添加批次ID到delivery options
        const deliveryOptions = {
          ...notificationData.deliveryOptions,
          batchId: batch.id,
        };

        const notification = await this.sendNotification({
          ...notificationData,
          deliveryOptions,
        });

        // 等待通知处理完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const processedNotification = await this.findNotificationById(notification.id);
        
        if (processedNotification.status === NotificationStatus.SENT || processedNotification.status === NotificationStatus.DELIVERED) {
          batch.sentCount++;
        }
        if (processedNotification.status === NotificationStatus.DELIVERED) {
          batch.deliveredCount++;
        }
        if (processedNotification.status === NotificationStatus.FAILED) {
          batch.failedCount++;
        }
      }

      batch.status = 'COMPLETED';
      batch.completedAt = new Date();
      
    } catch (error) {
      batch.status = 'FAILED';
      this.logger.error(`Batch processing failed for ${batch.id}: ${error.message}`);
    }

    batch.updatedAt = new Date();
    this.batches.set(batch.id, batch);
  }

  private calculateTypeStats(notifications: NotificationEntity[], type: NotificationType) {
    const typeNotifications = notifications.filter(n => n.type === type);
    return {
      sent: typeNotifications.filter(n => n.status === NotificationStatus.SENT || n.status === NotificationStatus.DELIVERED).length,
      delivered: typeNotifications.filter(n => n.status === NotificationStatus.DELIVERED).length,
      failed: typeNotifications.filter(n => n.status === NotificationStatus.FAILED).length,
      cost: typeNotifications.reduce((sum, n) => sum + (n.result?.cost || 0), 0),
    };
  }

  private calculateCost(type: NotificationType): number {
    const costs = {
      [NotificationType.SMS]: 0.05,
      [NotificationType.EMAIL]: 0.01,
      [NotificationType.PUSH]: 0.001,
      [NotificationType.IN_APP]: 0,
      [NotificationType.WEBHOOK]: 0.002,
    };
    return costs[type] || 0;
  }

  private initializeProviders(): void {
    const providers: NotificationProvider[] = [
      {
        name: 'sms-provider',
        type: NotificationType.SMS,
        isEnabled: true,
        config: { apiKey: 'sms-api-key', endpoint: 'https://sms.example.com' },
      },
      {
        name: 'email-provider',
        type: NotificationType.EMAIL,
        isEnabled: true,
        config: { apiKey: 'email-api-key', endpoint: 'https://email.example.com' },
      },
      {
        name: 'push-provider',
        type: NotificationType.PUSH,
        isEnabled: true,
        config: { apiKey: 'push-api-key', endpoint: 'https://push.example.com' },
      },
      {
        name: 'webhook-provider',
        type: NotificationType.WEBHOOK,
        isEnabled: true,
        config: { timeout: 30000, retries: 3 },
      },
    ];

    providers.forEach(provider => {
      this.providers.set(provider.name, provider);
    });
  }

  private initializeTemplates(): void {
    const templates: NotificationTemplateEntity[] = [
      {
        id: 'template-001',
        name: '订单确认',
        type: TemplateType.ORDER_CONFIRMATION,
        subject: '订单确认 - {{orderNo}}',
        content: '您的订单 {{orderNo}} 已确认，金额：{{amount}} 元',
        variables: ['orderNo', 'amount'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'template-002',
        name: '支付成功',
        type: TemplateType.PAYMENT_SUCCESS,
        subject: '支付成功通知',
        content: '您的订单 {{orderNo}} 支付成功，金额：{{amount}} 元',
        variables: ['orderNo', 'amount'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private generateNotificationId(): string {
    return this.idGenerator.nextId();
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