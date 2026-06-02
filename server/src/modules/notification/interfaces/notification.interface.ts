import {
  NotificationEntity,
  NotificationTemplateEntity,
  NotificationBatchEntity,
  NotificationStatsEntity,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  TemplateType,
  RecipientEntity,
  NotificationContentEntity,
  DeliveryOptionsEntity,
} from '../entities/notification.entity';

export interface SendNotificationData {
  type: NotificationType;
  recipient: RecipientEntity;
  content: NotificationContentEntity;
  priority?: NotificationPriority;
  deliveryOptions?: DeliveryOptionsEntity;
}

export interface SendBatchNotificationData {
  batchName: string;
  description?: string;
  notifications: SendNotificationData[];
}

export interface CreateTemplateData {
  name: string;
  type: TemplateType;
  subject?: string;
  content: string;
  variables: string[];
  smsTemplateCode?: string;
  wechatTemplateId?: string;
}

export interface UpdateTemplateData {
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  isActive?: boolean;
  smsTemplateCode?: string;
  wechatTemplateId?: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  batchId?: string;
}

export interface TemplateFilters {
  type?: TemplateType;
  isActive?: boolean;
  name?: string;
}

export interface BatchFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface NotificationProvider {
  name: string;
  type: NotificationType;
  isEnabled: boolean;
  config: Record<string, any>;
}

export interface SendByTemplateTypeOptions {
  sms?: { phone: string };
  push?: { userId: string };
  email?: { to: string; subject?: string };
}

export interface INotificationService {
  // 发送通知
  sendNotification(data: SendNotificationData): Promise<NotificationEntity>;
  sendBatchNotifications(
    data: SendBatchNotificationData,
  ): Promise<NotificationBatchEntity>;

  // 查询通知
  findNotifications(
    filters?: NotificationFilters,
  ): Promise<NotificationEntity[]>;
  findNotificationById(id: string): Promise<NotificationEntity>;

  // 重试和取消
  retryNotification(id: string): Promise<NotificationEntity>;
  cancelNotification(id: string): Promise<NotificationEntity>;

  // 模板管理
  createTemplate(data: CreateTemplateData): Promise<NotificationTemplateEntity>;
  findTemplates(
    filters?: TemplateFilters,
  ): Promise<NotificationTemplateEntity[]>;
  findTemplateById(id: string): Promise<NotificationTemplateEntity>;
  updateTemplate(
    id: string,
    data: UpdateTemplateData,
  ): Promise<NotificationTemplateEntity>;
  deleteTemplate(id: string): Promise<{ success: boolean }>;
  getActiveTemplateByType(
    type: TemplateType,
  ): Promise<NotificationTemplateEntity | null>;
  sendByTemplateType(
    type: TemplateType,
    templateData: Record<string, any>,
    channels: SendByTemplateTypeOptions,
  ): Promise<void>;

  // 批量操作
  findBatches(filters?: BatchFilters): Promise<NotificationBatchEntity[]>;
  findBatchById(id: string): Promise<NotificationBatchEntity>;
  getBatchNotifications(batchId: string): Promise<NotificationEntity[]>;

  // 统计和分析
  getNotificationStats(period: string): Promise<NotificationStatsEntity>;
  getDeliveryReport(startDate: Date, endDate: Date): Promise<any>;

  // 提供商管理
  getProviders(): Promise<NotificationProvider[]>;
  updateProviderConfig(
    providerName: string,
    config: Record<string, any>,
  ): Promise<NotificationProvider>;

  // 实用方法
  validateTemplate(
    templateId: string,
    data: Record<string, any>,
  ): Promise<{ isValid: boolean; errors?: string[] }>;
  renderTemplate(
    templateId: string,
    data: Record<string, any>,
  ): Promise<{ subject?: string; content: string }>;
}
