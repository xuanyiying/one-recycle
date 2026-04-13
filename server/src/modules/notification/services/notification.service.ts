import {
  PersistentSnowflakeIdGenerator,
  RedisService,
  RedisSnowflakeStateStore,
} from '@/common';
import { NOTIFICATION_COSTS } from '@/common/constants';
import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotificationPriority,
  NotificationStatsEntity,
  NotificationStatus,
  NotificationType,
} from '../entities/notification.entity';
import {
  BatchFilters,
  CreateTemplateData,
  INotificationService,
  NotificationFilters,
  NotificationProvider,
  SendBatchNotificationData,
  SendNotificationData,
  TemplateFilters,
  UpdateTemplateData,
} from '../interfaces/notification.interface';

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
  }): Promise<{ messageId: string; status: string }> {
    const providers = await this.getProviders();
    const smsProvider = providers.find(
      (p) => p.type === NotificationType.SMS && p.isEnabled,
    );

    if (!smsProvider) {
      throw new Error('No enabled SMS provider found');
    }

    try {
      // 根据提供商类型调用不同的发送逻辑
      switch (smsProvider.name) {
        case 'aliyun-sms':
          return await this.sendAliyunSms(data, smsProvider.config);
        case 'tencent-sms':
          return await this.sendTencentSms(data, smsProvider.config);
        default:
          // 默认使用通用 HTTP 接口
          return await this.sendGenericSms(data, smsProvider.config);
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${data.phone}:`, error);
      throw error;
    }
  }

  private async sendAliyunSms(
    data: { phone: string; template: string; params: Record<string, any> },
    config: Record<string, any>,
  ): Promise<{ messageId: string; status: string }> {
    // 阿里云 SMS 实现
    const { accessKeyId, accessKeySecret } = config;
    if (!accessKeyId || !accessKeySecret) {
      throw new Error('Aliyun SMS credentials not configured');
    }

    const messageId = this.generateMessageId();
    this.logger.log(
      `Sending Aliyun SMS to ${data.phone}, template: ${data.template}`,
    );

    // TODO: 集成阿里云 SMS SDK
    // const client = new AliyunSMSClient({ accessKeyId, accessKeySecret });
    // await client.sendSMS({
    //   PhoneNumbers: data.phone,
    //   SignName: signName,
    //   TemplateCode: data.template,
    //   TemplateParam: JSON.stringify(data.params),
    // });

    return { messageId, status: 'SENT' };
  }

  private async sendTencentSms(
    data: { phone: string; template: string; params: Record<string, any> },
    config: Record<string, any>,
  ): Promise<{ messageId: string; status: string }> {
    // 腾讯云 SMS 实现
    const { secretId, secretKey } = config;
    if (!secretId || !secretKey) {
      throw new Error('Tencent SMS credentials not configured');
    }

    const messageId = this.generateMessageId();
    this.logger.log(
      `Sending Tencent SMS to ${data.phone}, template: ${data.template}`,
    );

    // TODO: 集成腾讯云 SMS SDK
    void config.appId;
    void config.signName;
    return { messageId, status: 'SENT' };
  }

  private async sendGenericSms(
    data: { phone: string; template: string; params: Record<string, any> },
    config: Record<string, any>,
  ): Promise<{ messageId: string; status: string }> {
    const { apiKey, endpoint, signName } = config;
    if (!apiKey || !endpoint) {
      throw new Error('SMS provider not configured properly');
    }

    const messageId = this.generateMessageId();
    this.logger.log(`Sending SMS via generic provider to ${data.phone}`);

    // 通用 HTTP 调用
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone: data.phone,
        template: data.template,
        params: data.params,
        signName: signName,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `SMS provider returned ${response.status}: ${await response.text()}`,
      );
    }

    const result = await response.json();
    return { messageId: result.messageId || messageId, status: 'SENT' };
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
    const providers = await this.getProviders();
    const pushProvider = providers.find(
      (p) => p.type === NotificationType.PUSH && p.isEnabled,
    );

    if (!pushProvider) {
      throw new Error('No enabled push provider found');
    }

    // TODO: 集成推送服务 (FCM, APNS, JPush, 等)
    this.logger.log(`Sending push notification to user ${data.userId}`);

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
  }): Promise<{ messageId: string; status: string }> {
    const providers = await this.getProviders();
    const emailProvider = providers.find(
      (p) => p.type === NotificationType.EMAIL && p.isEnabled,
    );

    if (!emailProvider) {
      throw new Error('No enabled email provider found');
    }

    const messageId = this.generateMessageId();
    this.logger.log(`Sending email to ${data.to}, subject: ${data.subject}`);

    // TODO: 集成邮件服务 (SendGrid, AWS SES, 等)
    return { messageId, status: 'SENT' };
  }

  async sendWebhook(data: {
    url: string;
    payload: Record<string, any>;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
  }): Promise<{ success: boolean; statusCode: number; response?: string }> {
    const providers = await this.getProviders();
    const webhookProvider = providers.find(
      (p) => p.type === NotificationType.WEBHOOK && p.isEnabled,
    );

    if (!webhookProvider) {
      throw new Error('No enabled webhook provider found');
    }

    const config = webhookProvider.config;
    const timeout = data.timeout || config.timeout || 30000;
    const maxRetries = data.retries ?? config.retries ?? 3;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(data.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...data.headers,
          },
          body: JSON.stringify(data.payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();

        if (response.ok) {
          this.logger.log(`Webhook sent successfully to ${data.url}`);
          return {
            success: true,
            statusCode: response.status,
            response: responseText,
          };
        }

        throw new Error(`HTTP ${response.status}: ${responseText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Webhook attempt ${attempt + 1}/${maxRetries} failed: ${lastError.message}`,
        );

        if (attempt < maxRetries - 1) {
          // 指数退避重试
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Webhook failed after ${maxRetries} attempts: ${lastError?.message}`,
    );
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
    await this.findTemplateById(id);

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
      orderBy: { createdAt: 'desc' },
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
    // 从配置中读取提供商设置
    const smsProvider = this.configService.get<string>(
      'SMS_PROVIDER',
      'generic',
    );
    const emailProvider = this.configService.get<string>(
      'EMAIL_PROVIDER',
      'generic',
    );
    const pushProvider = this.configService.get<string>(
      'PUSH_PROVIDER',
      'generic',
    );

    return [
      // SMS 提供商
      {
        name:
          smsProvider === 'aliyun'
            ? 'aliyun-sms'
            : smsProvider === 'tencent'
              ? 'tencent-sms'
              : 'sms-provider',
        type: NotificationType.SMS,
        isEnabled: this.configService.get<boolean>('SMS_ENABLED', true),
        config: {
          // 通用配置
          apiKey: this.configService.get('SMS_API_KEY'),
          endpoint: this.configService.get('SMS_ENDPOINT'),
          signName: this.configService.get('SMS_SIGN_NAME'),
          // 阿里云 SMS 配置
          accessKeyId: this.configService.get('ALIYUN_SMS_ACCESS_KEY_ID'),
          accessKeySecret: this.configService.get(
            'ALIYUN_SMS_ACCESS_KEY_SECRET',
          ),
          // 腾讯云 SMS 配置
          secretId: this.configService.get('TENCENT_SMS_SECRET_ID'),
          secretKey: this.configService.get('TENCENT_SMS_SECRET_KEY'),
          appId: this.configService.get('TENCENT_SMS_APP_ID'),
        },
      },
      // 邮件提供商
      {
        name:
          emailProvider === 'sendgrid'
            ? 'sendgrid-email'
            : emailProvider === 'ses'
              ? 'aws-ses'
              : 'email-provider',
        type: NotificationType.EMAIL,
        isEnabled: this.configService.get<boolean>('EMAIL_ENABLED', true),
        config: {
          apiKey: this.configService.get('EMAIL_API_KEY'),
          endpoint: this.configService.get('EMAIL_ENDPOINT'),
          fromAddress: this.configService.get('EMAIL_FROM_ADDRESS'),
          fromName: this.configService.get('EMAIL_FROM_NAME'),
          // SMTP 配置
          smtpHost: this.configService.get('SMTP_HOST'),
          smtpPort: this.configService.get('SMTP_PORT'),
          smtpUser: this.configService.get('SMTP_USER'),
          smtpPass: this.configService.get('SMTP_PASS'),
          // AWS SES 配置
          sesRegion: this.configService.get('AWS_SES_REGION'),
          sesAccessKeyId: this.configService.get('AWS_SES_ACCESS_KEY_ID'),
          sesSecretAccessKey: this.configService.get(
            'AWS_SES_SECRET_ACCESS_KEY',
          ),
        },
      },
      // 推送提供商
      {
        name:
          pushProvider === 'fcm'
            ? 'firebase-fcm'
            : pushProvider === 'jpush'
              ? 'jpush'
              : 'push-provider',
        type: NotificationType.PUSH,
        isEnabled: this.configService.get<boolean>('PUSH_ENABLED', true),
        config: {
          apiKey: this.configService.get('PUSH_API_KEY'),
          endpoint: this.configService.get('PUSH_ENDPOINT'),
          // FCM 配置
          fcmServerKey: this.configService.get('FCM_SERVER_KEY'),
          fcmProjectId: this.configService.get('FCM_PROJECT_ID'),
          // JPush 配置
          jpushAppKey: this.configService.get('JPUSH_APP_KEY'),
          jpushMasterSecret: this.configService.get('JPUSH_MASTER_SECRET'),
          // APNS 配置
          apnsKeyId: this.configService.get('APNS_KEY_ID'),
          apnsTeamId: this.configService.get('APNS_TEAM_ID'),
          apnsBundleId: this.configService.get('APNS_BUNDLE_ID'),
          apnsPrivateKey: this.configService.get('APNS_PRIVATE_KEY'),
        },
      },
      // Webhook 提供商
      {
        name: 'webhook-provider',
        type: NotificationType.WEBHOOK,
        isEnabled: this.configService.get<boolean>('WEBHOOK_ENABLED', true),
        config: {
          timeout: this.configService.get('WEBHOOK_TIMEOUT', 30000),
          retries: this.configService.get('WEBHOOK_RETRIES', 3),
          defaultHeaders: {
            'User-Agent': 'OneRecycle-Webhook/1.0',
          },
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
