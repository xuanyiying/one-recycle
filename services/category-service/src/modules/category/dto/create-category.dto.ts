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
import { CategoryType, PriceType } from '../entities/category.entity';

/**
 * 价格信息DTO
 */
export class PriceInfoDto {
  @IsEnum(PriceType)
  type: PriceType;

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

  @IsString()
  @MaxLength(20)
  unit: string;

  @IsString()
  @MaxLength(10)
  currency: string = 'CNY';
}

/**
 * 图标信息DTO
 */
export class IconInfoDto {
  @IsUrl()
  url: string;

  @IsString()
  @MaxLength(255)
  filename: string;

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
 * SEO信息DTO
 */
export class SeoInfoDto {
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

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug只能包含小写字母、数字和连字符' })
  slug: string;
}

/**
 * 创建分类DTO
 */
export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEnum(CategoryType)
  type: CategoryType;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  parentId?: number;

  @ValidateNested()
  @Type(() => PriceInfoDto)
  priceInfo: PriceInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => IconInfoDto)
  icon?: IconInfoDto;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(9999)
  sortOrder?: number = 0;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isVisible?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  isFeatured?: boolean = false;

  @ValidateNested()
  @Type(() => SeoInfoDto)
  seo: SeoInfoDto;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}