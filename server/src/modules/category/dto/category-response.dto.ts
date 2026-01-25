import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryType } from './create-category.dto';

export class CategoryPriceDto {
  @ApiProperty({ description: '价格类型', example: 'fixed' })
  type: string;
  
  @ApiPropertyOptional({ description: '单价', example: 10.5 })
  unitPrice?: number;
  
  @ApiProperty({ description: '单位', example: 'kg' })
  unit: string;
  
  @ApiProperty({ description: '货币', example: 'CNY' })
  currency: string;
}

export class CategorySeoDto {
  @ApiPropertyOptional({ description: 'Meta标题' })
  metaTitle?: string;
  
  @ApiPropertyOptional({ description: 'Meta描述' })
  metaDescription?: string;
  
  @ApiProperty({ description: 'URL标识符', example: 'waste-paper' })
  slug: string;
}

export class CategoryResponseDto {
  @ApiProperty({ description: '分类ID', example: 1 })
  id: number; // Changed from string to number

  @ApiProperty({ description: '分类名称', example: '废纸' })
  name: string;

  @ApiPropertyOptional({ description: '描述' })
  description?: string;

  @ApiProperty({ description: '分类类型', enum: CategoryType })
  type: CategoryType;

  @ApiPropertyOptional({ description: '父分类ID', example: 0 })
  parentId?: number;

  @ApiProperty({ description: '价格信息', type: CategoryPriceDto })
  priceInfo: CategoryPriceDto;

  @ApiPropertyOptional({ description: '图标URL' })
  iconUrl?: string;

  @ApiProperty({ description: '排序', example: 0 })
  sortOrder: number;

  @ApiProperty({ description: '是否可见' })
  isVisible: boolean;

  @ApiProperty({ description: '是否推荐' })
  isFeatured: boolean;

  @ApiProperty({ description: '层级', example: 0 })
  level: number;

  @ApiProperty({ description: '路径', example: '0/1' })
  path: string;

  @ApiProperty({ description: 'SEO信息', type: CategorySeoDto })
  seo: CategorySeoDto;

  @ApiPropertyOptional({ description: '扩展属性' })
  attributes?: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class CategoryListResponseDto {
  @ApiProperty({ description: '分类列表', type: [CategoryResponseDto] })
  items: CategoryResponseDto[];

  @ApiProperty({ description: '总数' })
  total: number;

  @ApiProperty({ description: '当前页' })
  page: number;

  @ApiProperty({ description: '每页数量' })
  limit: number;

  @ApiProperty({ description: '总页数' })
  totalPages: number;
}
