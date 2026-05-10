import { apiClient } from './apiClient';
import { cacheService, CACHE_KEYS } from './cacheService';

// 通知类型枚举
export enum NotificationType {
  SYSTEM = 'system',
  ORDER = 'order',
  PROMOTION = 'promotion',
  MAINTENANCE = 'maintenance',
}

// 通知状态枚举
export enum NotificationStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  FAILED = 'failed',
}

// 通知优先级枚举
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// 通知接收者类型枚举
export enum RecipientType {
  ALL_USERS = 'all_users',
  SPECIFIC_USERS = 'specific_users',
  USER_GROUP = 'user_group',
  COURIERS = 'couriers',
}

// 通知接口
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  recipientType: RecipientType;
  recipientIds?: string[];
  scheduledTime?: string;
  sentTime?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  readCount: number;
  totalRecipients: number;
  clickCount: number;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
}

// 通知统计接口
export interface NotificationStats {
  totalNotifications: number;
  sentNotifications: number;
  scheduledNotifications: number;
  draftNotifications: number;
  failedNotifications: number;
  totalReads: number;
  totalClicks: number;
  averageReadRate: number;
  averageClickRate: number;
}

// 通知查询参数接口
export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  recipientType?: RecipientType;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 通知列表响应接口
export interface NotificationListResponse {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

// 创建通知请求接口
export interface CreateNotificationRequest {
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipientType: RecipientType;
  recipientIds?: string[];
  scheduledTime?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
}

// 更新通知请求接口
export interface UpdateNotificationRequest {
  title?: string;
  content?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  recipientType?: RecipientType;
  recipientIds?: string[];
  scheduledTime?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
}

// 发送通知请求接口
export interface SendNotificationRequest {
  notificationId: string;
  sendNow?: boolean;
  scheduledTime?: string;
}

// 通知模板接口
export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

// 通知模板查询参数接口
export interface TemplateQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: NotificationType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 通知模板列表响应接口
export interface TemplateListResponse {
  data: NotificationTemplate[];
  total: number;
  page: number;
  pageSize: number;
}

// 创建通知模板请求接口
export interface CreateTemplateRequest {
  name: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
}

// 更新通知模板请求接口
export interface UpdateTemplateRequest {
  name?: string;
  title?: string;
  content?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
}

// 通知服务类
export class NotificationService {
  // 获取通知列表
  async getNotifications(
    params: NotificationQueryParams = {},
    useCache: boolean = true,
  ): Promise<NotificationListResponse> {
    const cacheKey = `${CACHE_KEYS.NOTIFICATIONS_LIST}:${JSON.stringify(params)}`;
    if (useCache) {
      return cacheService.withCache(
        cacheKey,
        () => this.fetchNotifications(params),
        1 * 60 * 1000, // 1分钟缓存
      );
    }
    return this.fetchNotifications(params);
  }

  private async fetchNotifications(
    params: NotificationQueryParams,
  ): Promise<NotificationListResponse> {
    return apiClient.get('/notifications', params);
  }

  // 获取通知详情
  async getNotification(id: string): Promise<Notification> {
    return apiClient.get(`/notifications/${id}`);
  }

  // 创建通知
  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    return apiClient.post('/notifications', data);
  }

  // 更新通知
  async updateNotification(id: string, data: UpdateNotificationRequest): Promise<Notification> {
    return apiClient.put(`/notifications/${id}`, data);
  }

  // 删除通知
  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete(`/notifications/${id}`);
  }

  // 发送通知
  async sendNotification(data: SendNotificationRequest): Promise<void> {
    return apiClient.post('/notifications/send', data);
  }

  // 取消发送通知
  async cancelNotification(id: string): Promise<void> {
    return apiClient.post(`/notifications/${id}/cancel`);
  }

  // 获取通知统计
  async getNotificationStats(useCache: boolean = true): Promise<NotificationStats> {
    if (useCache) {
      return cacheService.withCache(
        CACHE_KEYS.NOTIFICATION_STATS,
        () => this.fetchNotificationStats(),
        2 * 60 * 1000, // 2分钟缓存
      );
    }
    return this.fetchNotificationStats();
  }

  private async fetchNotificationStats(): Promise<NotificationStats> {
    return apiClient.get('/notifications/stats');
  }

  // 获取通知模板列表
  async getTemplates(params: TemplateQueryParams = {}): Promise<TemplateListResponse> {
    return apiClient.get('/notifications/templates', params);
  }

  // 获取通知模板详情
  async getTemplate(id: string): Promise<NotificationTemplate> {
    return apiClient.get(`/notifications/templates/${id}`);
  }

  // 创建通知模板
  async createTemplate(data: CreateTemplateRequest): Promise<NotificationTemplate> {
    return apiClient.post('/notifications/templates', data);
  }

  // 更新通知模板
  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<NotificationTemplate> {
    return apiClient.put(`/notifications/templates/${id}`, data);
  }

  // 删除通知模板
  async deleteTemplate(id: string): Promise<void> {
    return apiClient.delete(`/notifications/templates/${id}`);
  }

  // 从模板创建通知
  async createFromTemplate(
    templateId: string,
    data: Partial<CreateNotificationRequest>,
  ): Promise<Notification> {
    return apiClient.post(`/notifications/templates/${templateId}/create`, data);
  }

  // 批量发送通知
  async batchSendNotifications(notificationIds: string[]): Promise<void> {
    return apiClient.post('/notifications/batch-send', { notificationIds });
  }

  // 批量删除通知
  async batchDeleteNotifications(notificationIds: string[]): Promise<void> {
    return apiClient.delete('/notifications/batch', { notificationIds });
  }

  // 获取通知发送历史
  async getNotificationHistory(id: string): Promise<any[]> {
    return apiClient.get(`/notifications/${id}/history`);
  }

  // 重新发送失败的通知
  async resendFailedNotification(id: string): Promise<void> {
    return apiClient.post(`/notifications/${id}/resend`);
  }

  // 导出通知数据
  async exportNotifications(params: NotificationQueryParams = {}): Promise<Blob> {
    const response = await apiClient.getInstance().get('/notifications/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // 上传通知图片
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.upload('/notifications/upload-image', formData);
  }

  // 预览通知
  async previewNotification(data: CreateNotificationRequest): Promise<{ html: string }> {
    return apiClient.post('/notifications/preview', data);
  }

  // 测试发送通知
  async testSendNotification(
    data: CreateNotificationRequest,
    testRecipients: string[],
  ): Promise<void> {
    return apiClient.post('/notifications/test-send', {
      ...data,
      testRecipients,
    });
  }
}

// 导出服务实例
export const notificationService = new NotificationService();
