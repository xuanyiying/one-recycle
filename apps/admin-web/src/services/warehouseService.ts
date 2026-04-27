import { apiClient } from './apiClient';

export interface Warehouse {
  id: string;
  name: string;
  address: string;
}

export const warehouseService = {
  async getWarehouses(): Promise<Warehouse[]> {
    try {
      return await apiClient.get('/inventory/warehouses');
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      throw new Error('获取仓库列表失败');
    }
  },
};

export default warehouseService;
