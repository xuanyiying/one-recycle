import apiClient from "./apiClient";


export interface Category {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  unitPrice: number;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

export interface CategoryListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分类API服务
export const categoryService = {
  // 获取分类列表
  async getCategories(params?: CategoryQueryParams): Promise<CategoryListResponse> {
    try {
      const response = await apiClient.get('/api/categories', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw new Error('获取分类列表失败');
    }
  },

  // 根据ID获取分类详情
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await apiClient.get(`/api/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch category:', error);
      throw new Error('获取分类详情失败');
    }
  },

  // 创建分类
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await apiClient.post('/api/categories', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw new Error('创建分类失败');
    }
  },

  // 更新分类
  async updateCategory(id: string, data: Partial<CreateCategoryRequest>): Promise<Category> {
    try {
      const response = await apiClient.put(`/api/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw new Error('更新分类失败');
    }
  },

  // 删除分类
  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/categories/${id}`);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw new Error('删除分类失败');
    }
  },

  // 上传图标
  async uploadIcon(file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('icon', file);
      
      const response = await apiClient.post('/api/categories/upload-icon', formData);
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload icon:', error);
      throw new Error('图标上传失败');
    }
  },
};

export default categoryService;