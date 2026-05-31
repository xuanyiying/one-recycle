import { apiClient, PaginatedResponse } from './apiClient';

export interface NotificationProviderConfig {
  id: number;
  name: string;
  type: string;
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  config?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationProviderConfigRequest {
  name: string;
  type: string;
  provider: string;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateNotificationProviderConfigRequest {
  name?: string;
  type?: string;
  provider?: string;
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface NotificationProviderConfigQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: string;
  provider?: string;
}

export interface NotificationProviderConfigListResponse extends PaginatedResponse<NotificationProviderConfig> {}

export interface NotificationTypeOption {
  value: string;
  label: string;
  providers: Array<{ value: string; label: string }>;
}

export const NOTIFICATION_TYPES: NotificationTypeOption[] = [
  {
    value: 'SMS',
    label: '短信',
    providers: [
      { value: 'aliyun-sms', label: '阿里云短信' },
      { value: 'tencent-sms', label: '腾讯云短信' },
      { value: 'generic-sms', label: '通用短信' },
    ],
  },
  {
    value: 'EMAIL',
    label: '邮件',
    providers: [
      { value: 'sendgrid-email', label: 'SendGrid' },
      { value: 'aws-ses', label: 'AWS SES' },
      { value: 'smtp-email', label: 'SMTP' },
      { value: 'generic-email', label: '通用邮件' },
    ],
  },
  {
    value: 'PUSH',
    label: '推送',
    providers: [
      { value: 'firebase-fcm', label: 'Firebase FCM' },
      { value: 'jpush', label: '极光推送' },
      { value: 'apns', label: 'APNs' },
      { value: 'generic-push', label: '通用推送' },
    ],
  },
  {
    value: 'WEBHOOK',
    label: 'Webhook',
    providers: [
      { value: 'webhook', label: 'Webhook' },
    ],
  },
];

class NotificationProviderConfigService {
  private readonly baseUrl = '/notification-provider-config';

  async getConfigs(params?: NotificationProviderConfigQueryParams): Promise<NotificationProviderConfigListResponse> {
    return apiClient.get<NotificationProviderConfigListResponse>(this.baseUrl, params);
  }

  async getConfigById(id: number): Promise<NotificationProviderConfig> {
    return apiClient.get<NotificationProviderConfig>(`${this.baseUrl}/${id}`);
  }

  async createConfig(data: CreateNotificationProviderConfigRequest): Promise<NotificationProviderConfig> {
    return apiClient.post<NotificationProviderConfig>(this.baseUrl, data, {
      showSuccess: true,
      successMessage: '通知服务商添加成功',
    });
  }

  async updateConfig(id: number, data: UpdateNotificationProviderConfigRequest): Promise<NotificationProviderConfig> {
    return apiClient.patch<NotificationProviderConfig>(`${this.baseUrl}/${id}`, data, {
      showSuccess: true,
      successMessage: '通知服务商更新成功',
    });
  }

  async deleteConfig(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`, {
      showSuccess: true,
      successMessage: '通知服务商删除成功',
    });
  }

  async toggleStatus(id: number, isActive: boolean): Promise<NotificationProviderConfig> {
    return apiClient.patch<NotificationProviderConfig>(`${this.baseUrl}/${id}/status`, { isActive }, {
      showSuccess: true,
      successMessage: isActive ? '通知服务商已启用' : '通知服务商已禁用',
    });
  }
}

export const notificationProviderConfigService = new NotificationProviderConfigService();
