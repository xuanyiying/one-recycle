import { 
  CategoryEntity, 
  CategoryTreeEntity, 
  CategorySearchResultEntity, 
  CategoryBatchResultEntity,
  CategoryType,
  CategoryStatus,
  PriceType
} from '../entities/category.entity';

/**
 * 创建分类数据接口
 */
export interface CreateCategoryData {
  name: string;
  description?: string;
  type: CategoryType;
  parentId?: number;
  priceInfo: {
    type: PriceType;
    unitPrice?: number;
    minPrice?: number;
    maxPrice?: number;
    unit: string;
    currency: string;
  };
  icon?: {
    url: string;
    filename: string;
    size?: number;
    mimeType?: string;
  };
  sortOrder?: number;
  isVisible?: boolean;
  isFeatured?: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    slug: string;
  };
  attributes?: Record<string, any>;
}

/**
 * 更新分类数据接口
 */
export interface UpdateCategoryData {
  name?: string;
  description?: string;
  type?: CategoryType;
  status?: CategoryStatus;
  parentId?: number;
  priceInfo?: Partial<{
    type: PriceType;
    unitPrice: number;
    minPrice: number;
    maxPrice: number;
    unit: string;
    currency: string;
  }>;
  icon?: Partial<{
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }>;
  sortOrder?: number;
  isVisible?: boolean;
  isFeatured?: boolean;
  seo?: Partial<{
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    slug: string;
  }>;
  attributes?: Record<string, any>;
}

/**
 * 分类查询过滤器接口
 */
export interface CategoryFilters {
  type?: CategoryType;
  status?: CategoryStatus;
  parentId?: number;
  isVisible?: boolean;
  isFeatured?: boolean;
  level?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
  keyword?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}

/**
 * 分类排序选项接口
 */
export interface CategorySortOptions {
  field: 'name' | 'sortOrder' | 'createdAt' | 'updatedAt' | 'level' | 'totalOrders';
  direction: 'asc' | 'desc';
}

/**
 * 分页选项接口
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * 分类树选项接口
 */
export interface CategoryTreeOptions {
  maxDepth?: number;
  includeStats?: boolean;
  includeInactive?: boolean;
  rootId?: number;
}

/**
 * 批量操作选项接口
 */
export interface BatchOperationOptions {
  ids: number[];
  operation: 'activate' | 'deactivate' | 'archive' | 'delete' | 'updateParent' | 'updateSort';
  data?: any;
}

/**
 * 文件上传结果接口
 */
export interface FileUploadResult {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

/**
 * 分类服务接口
 */
export interface ICategoryService {
  // 基础CRUD操作
  create(data: CreateCategoryData): Promise<CategoryEntity>;
  findById(id: number): Promise<CategoryEntity | null>;
  findAll(filters?: CategoryFilters, sort?: CategorySortOptions, pagination?: PaginationOptions): Promise<CategorySearchResultEntity>;
  update(id: number, data: UpdateCategoryData): Promise<CategoryEntity>;
  delete(id: number): Promise<boolean>;
  
  // 层级操作
  getTree(options?: CategoryTreeOptions): Promise<CategoryTreeEntity[]>;
  getChildren(parentId: number, includeInactive?: boolean): Promise<CategoryEntity[]>;
  getParents(id: number): Promise<CategoryEntity[]>;
  getPath(id: number): Promise<CategoryEntity[]>;
  moveCategory(id: number, newParentId?: number, newSortOrder?: number): Promise<CategoryEntity>;
  
  // 查询操作
  findByType(type: CategoryType, includeInactive?: boolean): Promise<CategoryEntity[]>;
  findActive(): Promise<CategoryEntity[]>;
  findFeatured(): Promise<CategoryEntity[]>;
  search(keyword: string, filters?: CategoryFilters, pagination?: PaginationOptions): Promise<CategorySearchResultEntity>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  
  // 批量操作
  batchUpdate(options: BatchOperationOptions): Promise<CategoryBatchResultEntity>;
  batchDelete(ids: number[]): Promise<CategoryBatchResultEntity>;
  
  // 统计操作
  getStats(id: number): Promise<any>;
  updateStats(id: number): Promise<void>;
  getPopularCategories(limit?: number): Promise<CategoryEntity[]>;
  
  // 文件操作
  uploadIcon(file: any): Promise<FileUploadResult>;
  deleteIcon(filename: string): Promise<boolean>;
  
  // 验证操作
  validateSlug(slug: string, excludeId?: number): Promise<boolean>;
  validateHierarchy(parentId?: number, childId?: number): Promise<boolean>;
  
  // 缓存操作
  clearCache(): Promise<void>;
  refreshCache(): Promise<void>;
}