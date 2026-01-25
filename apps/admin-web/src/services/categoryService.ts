import apiClient from './apiClient';

// 分类类型枚举
export enum CategoryType {
  RECYCLE = 'recycle', // 回收分类
  SALE = 'sale', // 销售分类
  BOTH = 'both', // 既可回收又可销售
}

// 分类状态枚举
export enum CategoryStatus {
  ACTIVE = 'active', // 活跃
  INACTIVE = 'inactive', // 非活跃
  ARCHIVED = 'archived', // 已归档
}

// 价格类型枚举
export enum PriceType {
  FIXED = 'fixed', // 固定价格
  RANGE = 'range', // 价格区间
  NEGOTIABLE = 'negotiable', // 面议
}

// 分类图标信息接口
export interface CategoryIcon {
  url: string;
  filename: string;
  size?: number;
  mimeType?: string;
  uploadedAt: string;
}

// 分类价格信息接口
export interface CategoryPrice {
  type: PriceType;
  unitPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  unit: string; // 计价单位：kg, 个, 台等
  currency: string; // 货币类型
}

// 分类SEO信息接口
export interface CategorySeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug: string; // URL友好的标识符
}

// 分类统计信息接口
export interface CategoryStats {
  totalItems: number; // 该分类下的物品总数
  totalOrders: number; // 该分类的订单总数
  totalRevenue: number; // 该分类的总收入
  averagePrice: number; // 平均价格
  lastOrderDate?: string; // 日期字符串
}

// 分类实体接口
export interface Category {
  id: number;
  name: string;
  description?: string;
  type: CategoryType;
  status: CategoryStatus;

  // 价格信息
  priceInfo: CategoryPrice;

  // 图标信息
  icon?: CategoryIcon;

  // 层级关系
  parentId?: number;
  parent?: Category;
  children?: Category[];
  level: number; // 层级深度
  path: string; // 层级路径，如 "1/2/3"

  // 排序和显示
  sortOrder: number;
  isVisible: boolean; // 是否在前端显示
  isFeatured: boolean; // 是否为推荐分类

  // SEO信息
  seo: CategorySeo;

  // 统计信息
  stats?: CategoryStats;

  // 扩展属性
  attributes?: Record<string, any>;

  // 时间戳
  createdAt: string; // 日期字符串
  updatedAt: string; // 日期字符串
  deletedAt?: string; // 日期字符串
}

// 创建分类请求接口
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  type: CategoryType;
  status: CategoryStatus;

  // 价格信息
  priceInfo: CategoryPrice;

  // 图标信息
  icon?: CategoryIcon;

  // 层级关系
  parentId?: number;

  // 排序和显示
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;

  // SEO信息
  seo: CategorySeo;

  // 扩展属性
  attributes?: Record<string, any>;
}

// 更新分类请求接口
export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number;
}

// 分类列表响应接口
export interface CategoryListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

// 分类查询参数接口
export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CategoryType;
  status?: CategoryStatus;
  parentId?: number;
  isVisible?: boolean;
  isFeatured?: boolean;
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
  async getCategoryById(id: number): Promise<Category> {
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
  async updateCategory(id: number, data: Partial<CreateCategoryRequest>): Promise<Category> {
    try {
      const response = await apiClient.put(`/api/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw new Error('更新分类失败');
    }
  },

  // 删除分类
  async deleteCategory(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/categories/${id}`);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw new Error('删除分类失败');
    }
  },

  // 批量操作分类
  async batchUpdateCategories(ids: number[], operation: string, data?: any): Promise<any> {
    try {
      const response = await apiClient.post('/api/categories/batch', { ids, operation, data });
      return response.data;
    } catch (error) {
      console.error('Failed to batch update categories:', error);
      throw new Error('批量操作分类失败');
    }
  },

  // 获取分类树
  async getCategoryTree(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/api/categories/tree');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      throw new Error('获取分类树失败');
    }
  },

  // 上传图标
  async uploadIcon(file: File): Promise<CategoryIcon> {
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
