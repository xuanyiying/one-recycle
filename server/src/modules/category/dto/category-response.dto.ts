import { CategoryType } from './create-category.dto';

export interface CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  parentId?: number;
  priceInfo: any;
  iconUrl?: string;
  sortOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  level: number;
  path: string;
  seo: any;
  attributes?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListResponseDto {
  items: CategoryResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}