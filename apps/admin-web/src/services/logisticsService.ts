import { apiClient } from './apiClient';

export interface LogisticsProvider {
  id: number;
  name: string;
  code: string;
  apiKey?: string;
  apiUrl?: string;
  tenantId?: string;
  appId?: string;
  appSecret?: string;
  isActive: boolean;
  createdAt: string;
}

export const logisticsService = {
  getProviders: async () => {
    const response = await apiClient.get('/logistics/providers');
    return response.data;
  },

  createProvider: async (data: Partial<LogisticsProvider>) => {
    const response = await apiClient.post('/logistics/providers', data);
    return response.data;
  },

  updateProvider: async (id: number, data: Partial<LogisticsProvider>) => {
    const response = await apiClient.put(`/logistics/providers/${id}`, data);
    return response.data;
  },

  deleteProvider: async (id: number) => {
    const response = await apiClient.delete(`/logistics/providers/${id}`);
    return response.data;
  },
};
