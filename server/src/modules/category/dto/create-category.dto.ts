import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum CategoryType {
  RECYCLE = 'recycle',
  SALE = 'sale',
  BOTH = 'both'
}

export enum PriceType {
  FIXED = 'fixed',
  RANGE = 'range',
  NEGOTIABLE = 'negotiable'
}

export class PriceInfoDto {
  @IsEnum(PriceType)
  type!: PriceType;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @IsString()
  unit!: string;

  @IsString()
  currency!: string;
}

export class SeoInfoDto {
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @IsString()
  slug!: string;
}

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CategoryType)
  type!: CategoryType;

  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ValidateNested()
  @Type(() => PriceInfoDto)
  priceInfo!: PriceInfoDto;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ValidateNested()
  @Type(() => SeoInfoDto)
  seo!: SeoInfoDto;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;
}