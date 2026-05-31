import { apiClient, PaginatedResponse } from './apiClient';

export interface PaymentProviderConfig {
  id: number;
  name: string;
  code: string;
  provider: string;
  apiUrl?: string;
  appId?: string;
  appSecret?: string;
  merchantId?: string;
  privateKey?: string;
  publicKey?: string;
  certPath?: string;
  keyPath?: string;
  callbackUrl?: string;
  config?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentConfigRequest {
  name: string;
  code: string;
  provider: string;
  apiUrl?: string;
  appId?: string;
  appSecret?: string;
  merchantId?: string;
  privateKey?: string;
  publicKey?: string;
  certPath?: string;
  keyPath?: string;
  callbackUrl?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdatePaymentConfigRequest {
  name?: string;
  provider?: string;
  apiUrl?: string;
  appId?: string;
  appSecret?: string;
  merchantId?: string;
  privateKey?: string;
  publicKey?: string;
  certPath?: string;
  keyPath?: string;
  callbackUrl?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface PaymentConfigQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  provider?: string;
}

export interface PaymentConfigListResponse extends PaginatedResponse<PaymentProviderConfig> {}

export interface PaymentProviderOption {
  code: string;
  name: string;
  provider: string;
  description: string;
}

export const PAYMENT_PROVIDERS: PaymentProviderOption[] = [
  { code: 'wechat_pay', name: '微信支付', provider: 'WECHAT', description: '微信支付企业付款到零钱' },
  { code: 'alipay', name: '支付宝', provider: 'ALIPAY', description: '支付宝转账到账户' },
];

class PaymentConfigService {
  private readonly baseUrl = '/payment-config';

  async getConfigs(params?: PaymentConfigQueryParams): Promise<PaymentConfigListResponse> {
    return apiClient.get<PaymentConfigListResponse>(this.baseUrl, params);
  }

  async getConfigById(id: number): Promise<PaymentProviderConfig> {
    return apiClient.get<PaymentProviderConfig>(`${this.baseUrl}/${id}`);
  }

  async createConfig(data: CreatePaymentConfigRequest): Promise<PaymentProviderConfig> {
    return apiClient.post<PaymentProviderConfig>(this.baseUrl, data, {
      showSuccess: true,
      successMessage: '支付渠道添加成功',
    });
  }

  async updateConfig(id: number, data: UpdatePaymentConfigRequest): Promise<PaymentProviderConfig> {
    return apiClient.patch<PaymentProviderConfig>(`${this.baseUrl}/${id}`, data, {
      showSuccess: true,
      successMessage: '支付渠道更新成功',
    });
  }

  async deleteConfig(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`, {
      showSuccess: true,
      successMessage: '支付渠道删除成功',
    });
  }

  async toggleStatus(id: number, isActive: boolean): Promise<PaymentProviderConfig> {
    return apiClient.patch<PaymentProviderConfig>(`${this.baseUrl}/${id}/status`, { isActive }, {
      showSuccess: true,
      successMessage: isActive ? '支付渠道已启用' : '支付渠道已禁用',
    });
  }

  async testConnection(id: number): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.baseUrl}/${id}/test`);
  }

  async getPaymentProviders(): Promise<PaymentProviderOption[]> {
    return PAYMENT_PROVIDERS;
  }
}

export const paymentConfigService = new PaymentConfigService();
