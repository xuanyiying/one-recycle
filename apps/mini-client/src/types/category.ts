// 分类类型枚举
export enum CategoryType {
  RECYCLE = 'recycle',    // 回收分类
  SALE = 'sale',          // 销售分类
  BOTH = 'both'           // 既可回收又可销售
}

// 分类状态枚举
export enum CategoryStatus {
  ACTIVE = 'active',      // 活跃
  INACTIVE = 'inactive',  // 非活跃
  ARCHIVED = 'archived'   // 已归档
}

// 价格类型枚举
export enum PriceType {
  FIXED = 'fixed',        // 固定价格
  RANGE = 'range',        // 价格区间
  NEGOTIABLE = 'negotiable' // 面议
}

// 分类图标信息接口
export interface CategoryIcon {
  url: string;
  filename: string;
  size?: number;
  mimeType?: string;
  uploadedAt: string; // 日期字符串
}

// 分类价格信息接口
export interface CategoryPrice {
  type: PriceType;
  unitPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  unit: string;           // 计价单位：kg, 个, 台等
  currency: string;       // 货币类型
}

export interface CategoryPricingRule {
  id?: number;
  tenantId?: number;
  basePrice?: number;
  minWeight?: number;
  maxWeight?: number;
  ruleJson?: Record<string, any>;
  isActive?: boolean;
}

// 分类SEO信息接口
export interface CategorySeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  slug: string;           // URL友好的标识符
}

// 分类统计信息接口
export interface CategoryStats {
  totalItems: number;     // 该分类下的物品总数
  totalOrders: number;    // 该分类的订单总数
  totalRevenue: number;   // 该分类的总收入
  averagePrice: number;   // 平均价格
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

  pricingRule?: CategoryPricingRule;
  
  // 图标信息
  icon?: CategoryIcon;
  
  // 层级关系
  parentId?: number;
  parent?: Category;
  children?: Category[];
  level: number;          // 层级深度
  path: string;           // 层级路径，如 "1/2/3"
  
  // 排序和显示
  sortOrder: number;
  isVisible: boolean;     // 是否在前端显示
  isFeatured: boolean;    // 是否为推荐分类
  
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

// 后端返回的原始分类数据（包含BigInt）
export interface CategoryRaw {
  id: number;
  name: string;
  description?: string;
  type: CategoryType;
  status: CategoryStatus;
  
  // 价格信息
  priceInfo: CategoryPrice;

  pricingRule?: CategoryPricingRule;
  
  // 图标信息
  icon?: CategoryIcon;
  
  // 层级关系
  parentId?: number;
  level: number;
  path: string;
  
  // 排序和显示
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  
  // SEO信息
  seo: CategorySeo;
  
  // 统计信息
  stats?: CategoryStats;
  
  // 扩展属性
  attributes?: Record<string, any>;
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// 转换函数：将后端数据转换为前端可用格式
export const transformCategory = (raw: CategoryRaw): Category => {
  return {
    id: Number(raw.id),
    name: raw.name,
    description: raw.description,
    type: raw.type,
    status: raw.status,
    priceInfo: raw.priceInfo,
    pricingRule: raw.pricingRule,
    icon: raw.icon,
    parentId: raw.parentId,
    level: raw.level,
    path: raw.path,
    sortOrder: raw.sortOrder,
    isVisible: raw.isVisible,
    isFeatured: raw.isFeatured,
    seo: raw.seo,
    stats: raw.stats,
    attributes: raw.attributes,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    deletedAt: raw.deletedAt
  };
};

// 批量转换函数
export const transformCategories = (rawCategories: CategoryRaw[]): Category[] => {
  return rawCategories?.map(transformCategory) || [];
};
