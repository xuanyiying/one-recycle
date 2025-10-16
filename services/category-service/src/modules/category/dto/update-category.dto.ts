import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsEnum, 
  IsObject, 
  IsArray, 
  ValidateNested, 
  IsUrl,
  Min,
  Max,
  MaxLength,
  MinLength,
  Matches
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CategoryType, CategoryStatus, PriceType } from '../entities/category.entity';

/**
 * 更新价格信息DTO
 */
export class UpdatePriceInfoDto {
  @IsOptional()
  @IsEnum(PriceType)
  type?: PriceType;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  unitPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;
}

/**
 * 更新图标信息DTO
 */
export class UpdateIconInfoDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;
}

/**
 * 更新SEO信息DTO
 */
export class UpdateSeoInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug只能包含小写字母、数字和连字符' })
  slug?: string;
}

/**
 * 更新分类DTO
 */
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

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
  @ValidateNested()
  @Type(() => UpdatePriceInfoDto)
  priceInfo?: UpdatePriceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateIconInfoDto)
  icon?: UpdateIconInfoDto;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

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
  @ValidateNested()
  @Type(() => UpdateSeoInfoDto)
  seo?: UpdateSeoInfoDto;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}