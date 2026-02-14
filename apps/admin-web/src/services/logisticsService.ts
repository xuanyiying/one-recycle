import { apiClient, PaginatedResponse } from './apiClient';

export interface LogisticsProvider {
  id: number;
  name: string;
  code: string;
  apiUrl?: string;
  tenantId?: string;
  appId?: string;
  appSecret?: string;
  config?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogisticsProviderRequest {
  name: string;
  code: string;
  apiUrl?: string;
  tenantId?: string;
  appId?: string;
  appSecret?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateLogisticsProviderRequest {
  name?: string;
  apiUrl?: string;
  tenantId?: string;
  appId?: string;
  appSecret?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface LogisticsProviderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface LogisticsProviderListResponse extends PaginatedResponse<LogisticsProvider> {}

export interface ExpressCompany {
  code: string;
  name: string;
  logo?: string;
  supportedTypes: string[];
}

export const EXPRESS_COMPANIES: ExpressCompany[] = [
  { code: 'SF', name: '顺丰速运', supportedTypes: ['标准快递', '特快', '冷链'] },
  { code: 'JD', name: '京东物流', supportedTypes: ['标准快递', '特快', '大件'] },
  { code: 'YTO', name: '圆通速递', supportedTypes: ['标准快递', '经济件'] },
  { code: 'ZTO', name: '中通快递', supportedTypes: ['标准快递', '经济件'] },
  { code: 'STO', name: '申通快递', supportedTypes: ['标准快递', '经济件'] },
  { code: 'YD', name: '韵达快递', supportedTypes: ['标准快递', '经济件'] },
  { code: 'EMS', name: 'EMS', supportedTypes: ['标准快递', '国际件'] },
  { code: 'HTKY', name: '百世快递', supportedTypes: ['标准快递', '经济件'] },
];

class LogisticsService {
  private readonly baseUrl = '/logistics/providers';

  async getProviders(params?: LogisticsProviderQueryParams): Promise<LogisticsProviderListResponse> {
    return apiClient.get<LogisticsProviderListResponse>(this.baseUrl, params);
  }

  async getProviderById(id: number): Promise<LogisticsProvider> {
    return apiClient.get<LogisticsProvider>(`${this.baseUrl}/${id}`);
  }

  async createProvider(data: CreateLogisticsProviderRequest): Promise<LogisticsProvider> {
    return apiClient.post<LogisticsProvider>(this.baseUrl, data, {
      showSuccess: true,
      successMessage: '快递公司添加成功',
    });
  }

  async updateProvider(id: number, data: UpdateLogisticsProviderRequest): Promise<LogisticsProvider> {
    return apiClient.put<LogisticsProvider>(`${this.baseUrl}/${id}`, data, {
      showSuccess: true,
      successMessage: '快递公司更新成功',
    });
  }

  async deleteProvider(id: number): Promise<void> {
    return apiClient.delete<void>(`${this.baseUrl}/${id}`, {
      showSuccess: true,
      successMessage: '快递公司删除成功',
    });
  }

  async toggleProviderStatus(id: number, isActive: boolean): Promise<LogisticsProvider> {
    return apiClient.patch<LogisticsProvider>(`${this.baseUrl}/${id}/status`, { isActive }, {
      showSuccess: true,
      successMessage: isActive ? '快递公司已启用' : '快递公司已禁用',
    });
  }

  async testConnection(id: number): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`${this.baseUrl}/${id}/test-connection`);
  }

  async getExpressCompanies(): Promise<ExpressCompany[]> {
    return EXPRESS_COMPANIES;
  }

  async trackShipment(providerCode: string, trackingNo: string): Promise<{
    status: string;
    traces: Array<{
      time: string;
      context: string;
    }>;
  }> {
    return apiClient.get(`/logistics/track`, { providerCode, trackingNo });
  }
}

export const logisticsService = new LogisticsService();
