/**
 * 分类类型枚举
 */
export enum CategoryType {
  RECYCLE = 'recycle',    // 回收分类
  SALE = 'sale',          // 销售分类
  BOTH = 'both'           // 既可回收又可销售
}

/**
 * 分类状态枚举
 */
export enum CategoryStatus {
  ACTIVE = 'active',      // 活跃
  INACTIVE = 'inactive',  // 非活跃
  ARCHIVED = 'archived'   // 已归档
}

/**
 * 价格类型枚举
 */
export enum PriceType {
  FIXED = 'fixed',        // 固定价格
  RANGE = 'range',        // 价格区间
  NEGOTIABLE = 'negotiable' // 面议
}

/**
 * 分类图标信息接口
 */
export interface CategoryIconEntity {
  url: string;
  filename: string;
  size?: number;
  mimeType?: string;
  uploadedAt: Date;
}

/**
 * 分类价格信息接口
 */
export interface CategoryPriceEntity {
  type: PriceType;
  unitPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  unit: string;           // 计价单位：kg, 个, 台等
  currency: string;       // 货币类型
}

/**
 * 分类统计信息接口
 */
export interface CategoryStatsEntity {
  totalItems: number;     // 该分类下的物品总数
  totalOrders: number;    // 该分类的订单总数
  totalRevenue: number;   // 该分类的总收入
  averagePrice: number;   // 平均价格
  lastOrderDate?: Date;   // 最后一次订单日期
}

/**
 * 分类SEO信息接口
 */
export interface CategorySeoEntity {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug: string;           // URL友好的标识符
}

/**
 * 分类实体类
 */
export class CategoryEntity {
  id: number;
  name: string;
  description?: string;
  type: CategoryType;
  status: CategoryStatus;
  
  // 价格信息
  priceInfo: CategoryPriceEntity;
  
  // 图标信息
  icon?: CategoryIconEntity;
  
  // 层级关系
  parentId?: number;
  parent?: CategoryEntity;
  children?: CategoryEntity[];
  level: number;          // 层级深度
  path: string;           // 层级路径，如 "1/2/3"
  
  // 排序和显示
  sortOrder: number;
  isVisible: boolean;     // 是否在前端显示
  isFeatured: boolean;    // 是否为推荐分类
  
  // SEO信息
  seo: CategorySeoEntity;
  
  // 统计信息
  stats?: CategoryStatsEntity;
  
  // 扩展属性
  attributes?: Record<string, any>;
  
  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  constructor(data: Partial<CategoryEntity>) {
    Object.assign(this, data);
    this.level = this.level || 0;
    this.sortOrder = this.sortOrder || 0;
    this.isVisible = this.isVisible ?? true;
    this.isFeatured = this.isFeatured ?? false;
    this.status = this.status || CategoryStatus.ACTIVE;
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = this.updatedAt || new Date();
  }
}

/**
 * 分类树节点实体
 */
export class CategoryTreeEntity extends CategoryEntity {
  children: CategoryTreeEntity[];
  
  constructor(data: Partial<CategoryTreeEntity>) {
    super(data);
    this.children = this.children || [];
  }
}

/**
 * 分类搜索结果实体
 */
export class CategorySearchResultEntity {
  categories: CategoryEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  
  constructor(data: Partial<CategorySearchResultEntity>) {
    Object.assign(this, data);
    this.totalPages = Math.ceil(this.total / this.pageSize);
    this.hasNext = this.page < this.totalPages;
    this.hasPrev = this.page > 1;
  }
}

/**
 * 分类批量操作结果实体
 */
export class CategoryBatchResultEntity {
  successCount: number;
  failureCount: number;
  errors: Array<{
    id: number;
    error: string;
  }>;
  processedIds: number[];
  
  constructor(data: Partial<CategoryBatchResultEntity>) {
    Object.assign(this, data);
    this.successCount = this.successCount || 0;
    this.failureCount = this.failureCount || 0;
    this.errors = this.errors || [];
    this.processedIds = this.processedIds || [];
  }
}