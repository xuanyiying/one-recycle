export enum NotificationType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  WEBHOOK = 'WEBHOOK'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TemplateType {
  ORDER_CONFIRMATION = 'ORDER_CONFIRMATION',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PICKUP_REMINDER = 'PICKUP_REMINDER',
  DELIVERY_UPDATE = 'DELIVERY_UPDATE',
  ACCOUNT_VERIFICATION = 'ACCOUNT_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PROMOTIONAL = 'PROMOTIONAL',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export interface RecipientEntity {
  userId?: string;
  phoneNumber?: string;
  email?: string;
  deviceToken?: string;
  webhookUrl?: string;
  name?: string;
}

export interface NotificationContentEntity {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface DeliveryOptionsEntity {
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number;
  expiresAt?: Date;
  scheduleAt?: Date;
  batchId?: string;
}

export interface NotificationResultEntity {
  messageId: string;
  externalId?: string;
  deliveredAt?: Date;
  failureReason?: string;
  cost?: number;
  metadata?: Record<string, any>;
}

export class NotificationEntity {
  id!: string;
  type!: NotificationType;
  status!: NotificationStatus;
  priority!: NotificationPriority;
  recipient!: RecipientEntity;
  content!: NotificationContentEntity;
  deliveryOptions?: DeliveryOptionsEntity;
  result?: NotificationResultEntity;
  createdAt!: Date;
  updatedAt!: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
}

export class NotificationTemplateEntity {
  id!: string;
  name!: string;
  type!: TemplateType;
  subject?: string;
  content!: string;
  variables!: string[];
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class NotificationBatchEntity {
  id!: string;
  name!: string;
  description?: string;
  totalCount!: number;
  sentCount!: number;
  deliveredCount!: number;
  failedCount!: number;
  status!: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt!: Date;
  updatedAt!: Date;
  completedAt?: Date;
}

export class NotificationStatsEntity {
  totalSent!: number;
  totalDelivered!: number;
  totalFailed!: number;
  deliveryRate!: number;
  averageDeliveryTime!: number;
  costTotal!: number;
  period!: string;
  breakdown!: {
    sms: { sent: number; delivered: number; failed: number; cost: number };
    email: { sent: number; delivered: number; failed: number; cost: number };
    push: { sent: number; delivered: number; failed: number; cost: number };
    inApp: { sent: number; delivered: number; failed: number; cost: number };
    webhook: { sent: number; delivered: number; failed: number; cost: number };
  };
}