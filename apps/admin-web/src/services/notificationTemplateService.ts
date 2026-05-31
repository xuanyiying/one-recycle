import { apiClient } from './apiClient';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface TemplateQueryParams {
  type?: string;
  isActive?: boolean;
  name?: string;
}

export const TEMPLATE_TYPES = [
  { value: 'ORDER_CONFIRMATION', label: '订单确认', category: '订单' },
  { value: 'PAYMENT_SUCCESS', label: '支付成功', category: '订单' },
  { value: 'PICKUP_REMINDER', label: '上门提醒', category: '订单' },
  { value: 'DELIVERY_UPDATE', label: '物流更新', category: '订单' },
  { value: 'ACCOUNT_VERIFICATION', label: '验证码', category: '账户' },
  { value: 'PASSWORD_RESET', label: '密码重置', category: '账户' },
  { value: 'POINTS_CREDIT', label: '积分到账', category: '积分' },
  { value: 'POINTS_DEBIT', label: '积分扣除', category: '积分' },
  { value: 'SETTLEMENT_NOTICE', label: '结算通知', category: '财务' },
  { value: 'WITHDRAWAL_RESULT', label: '提现结果', category: '财务' },
  { value: 'INVITE_REWARD', label: '邀请奖励', category: '积分' },
  { value: 'SIGN_IN_REWARD', label: '签到奖励', category: '积分' },
  { value: 'PROMOTIONAL', label: '营销推广', category: '营销' },
  { value: 'SYSTEM_ALERT', label: '系统告警', category: '系统' },
  { value: 'CUSTOM', label: '自定义', category: '其他' },
];

class NotificationTemplateService {
  private readonly baseUrl = '/notifications/templates';

  async getTemplates(params?: TemplateQueryParams): Promise<NotificationTemplate[]> {
    return apiClient.get<NotificationTemplate[]>(this.baseUrl, params);
  }

  async getTemplate(id: string): Promise<NotificationTemplate> {
    return apiClient.get<NotificationTemplate>(`${this.baseUrl}/${id}`);
  }

  async createTemplate(data: CreateTemplateRequest): Promise<NotificationTemplate> {
    return apiClient.post<NotificationTemplate>(this.baseUrl, data, {
      showSuccess: true,
      successMessage: '模板创建成功',
    });
  }

  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<NotificationTemplate> {
    return apiClient.put<NotificationTemplate>(`${this.baseUrl}/${id}`, data, {
      showSuccess: true,
      successMessage: '模板更新成功',
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`, {
      showSuccess: true,
      successMessage: '模板删除成功',
    });
  }

  async validateTemplate(id: string, data: Record<string, any>): Promise<{ isValid: boolean; errors?: string[] }> {
    return apiClient.post(`${this.baseUrl}/${id}/validate`, data);
  }

  async renderTemplate(id: string, data: Record<string, any>): Promise<{ subject?: string; content: string }> {
    return apiClient.post(`${this.baseUrl}/${id}/render`, data);
  }
}

export const notificationTemplateService = new NotificationTemplateService();
