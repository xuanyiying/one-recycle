import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsEnum, 
  IsArray, 
  IsDateString,
  ValidateNested,
  Min,
  Max,
  MaxLength
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CategoryType, CategoryStatus } from '../entities/category.entity';

/**
 * 价格范围查询DTO
 */
export class PriceRangeDto {
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  min?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  max?: number;
}

/**
 * 分类查询DTO
 */
export class QueryCategoryDto {
  @IsOptional()
  @IsEnum(CategoryType)
  type?: CategoryType;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  parentId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  level?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PriceRangeDto)
  priceRange?: PriceRangeDto;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @IsOptional()
  @IsDateString()
  updatedAfter?: string;

  @IsOptional()
  @IsDateString()
  updatedBefore?: string;

  // 分页参数
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  // 排序参数
  @IsOptional()
  @IsEnum(['name', 'sortOrder', 'createdAt', 'updatedAt', 'level', 'totalOrders'])
  sortField?: string = 'sortOrder';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc' = 'asc';
}

/**
 * 分类树查询DTO
 */
export class CategoryTreeDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(10)
  maxDepth?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  includeStats?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  includeInactive?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  rootId?: number;
}

/**
 * 批量操作DTO
 */
export class BatchOperationDto {
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(id => parseInt(id));
    }
    return [];
  })
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  ids: number[];

  @IsEnum(['activate', 'deactivate', 'archive', 'delete', 'updateParent', 'updateSort'])
  operation: string;

  @IsOptional()
  data?: any;
}