import { apiClient } from './apiClient';

// 分类仓库配置接口
export interface CategoryWarehouseConfig {
  id: number;
  categoryId: number;
  categoryName: string;
  warehouseId: number;
  warehouseName: string;
  warehouseAddress: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建配置请求接口
export interface CreateCategoryWarehouseRequest {
  categoryId: number;
  warehouseId: number;
  isActive?: boolean;
}

// 更新配置请求接口
export interface UpdateCategoryWarehouseRequest {
  warehouseId?: number;
  isActive?: boolean;
}

// 分类仓库配置API服务
export const categoryWarehouseService = {
  // 获取所有配置
  async getConfigs(): Promise<CategoryWarehouseConfig[]> {
    try {
      return await apiClient.get('/category-warehouse');
    } catch (error) {
      console.error('Failed to fetch category warehouse configs:', error);
      throw new Error('获取分类仓库配置列表失败');
    }
  },

  // 根据分类ID获取配置
  async getConfigByCategoryId(categoryId: number): Promise<CategoryWarehouseConfig | null> {
    try {
      return await apiClient.get(`/category-warehouse/by-category/${categoryId}`);
    } catch (error) {
      console.error('Failed to fetch config by category:', error);
      return null;
    }
  },

  // 创建配置
  async createConfig(data: CreateCategoryWarehouseRequest): Promise<CategoryWarehouseConfig> {
    try {
      return await apiClient.post('/category-warehouse', data);
    } catch (error) {
      console.error('Failed to create config:', error);
      throw new Error('创建分类仓库配置失败');
    }
  },

  // 更新配置
  async updateConfig(id: number, data: UpdateCategoryWarehouseRequest): Promise<CategoryWarehouseConfig> {
    try {
      return await apiClient.put(`/category-warehouse/${id}`, data);
    } catch (error) {
      console.error('Failed to update config:', error);
      throw new Error('更新分类仓库配置失败');
    }
  },

  // 删除配置
  async deleteConfig(id: number): Promise<void> {
    try {
      await apiClient.delete(`/category-warehouse/${id}`);
    } catch (error) {
      console.error('Failed to delete config:', error);
      throw new Error('删除分类仓库配置失败');
    }
  },
};

export default categoryWarehouseService;
