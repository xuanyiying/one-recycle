import { apiClient } from './apiClient';

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
// 分类价格信息接口
export interface CategoryPrice {
  type: PriceType;
  unitPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  unit: string; // 计价单位：kg, 个, 台等
  currency: string; // 货币类型
}

export interface PricingRule {
  id?: number;
  tenantId?: number;
  basePrice: number;
  minWeight?: number;
  maxWeight?: number;
  ruleJson?: Record<string, any>;
  isActive: boolean;
}

export interface UploadedIcon {
  url: string;
  id?: string;
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

  // 价格信息
  priceInfo: CategoryPrice;

  // 图标信息
  iconUrl?: string;

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

  pricingRule?: PricingRule;

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

  // 价格信息
  priceInfo: CategoryPrice;

  // 图标信息
  iconUrl?: string;

  // 层级关系
  parentId?: number;

  // 排序和显示
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;

  // SEO信息
  seo: CategorySeo;

  pricingRule?: PricingRule;

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
    return apiClient.get('/category/categories', params);
  },

  async getCategoryById(id: number): Promise<Category> {
    return apiClient.get(`/category/categories/${id}`);
  },

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return apiClient.post('/category/categories', data);
  },

  async updateCategory(id: number, data: Partial<CreateCategoryRequest>): Promise<Category> {
    return apiClient.put(`/category/categories/${id}`, data);
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/category/categories/${id}`);
  },

  async batchUpdateCategories(ids: number[], operation: string, data?: any): Promise<any> {
    return apiClient.post('/category/categories/batch', { ids, operation, data });
  },

  async getCategoryTree(): Promise<Category[]> {
    return apiClient.get('/category/categories/tree');
  },

  // 上传图标
  async uploadIcon(file: File): Promise<UploadedIcon> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'IMAGE');
      formData.append('category', 'CATEGORY_ICON');

      // API 返回 { id, filename, fileUrl, ... }，需要提取 fileUrl 字段
      const response = await apiClient.upload<{
        id: string;
        fileUrl: string;
        filename: string;
      }>('/storage/upload', formData);

      return {
        url: response.fileUrl || '',
        id: response.id
      };
    } catch (error) {
      console.error('Failed to upload icon:', error);
      throw new Error('图标上传失败');
    }
  },
};

export default categoryService;
