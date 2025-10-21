// 分类相关类型定义

export interface Category {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 后端返回的原始分类数据（包含BigInt）
export interface CategoryRaw {
  id: number;
  name: string;
  description?: string;
  unitPrice: number;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 转换函数：将后端数据转换为前端可用格式
export const transformCategory = (raw: CategoryRaw): Category => {
  return {
    id: Number(raw.id),
    name: raw.name,
    description: raw.description,
    unitPrice: Number(raw.unitPrice),
    icon: raw.icon,
    sortOrder: raw.sortOrder,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

// 批量转换函数
export const transformCategories = (rawCategories: CategoryRaw[]): Category[] => {
  return rawCategories?.map(transformCategory) || [];
};