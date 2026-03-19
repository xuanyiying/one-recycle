import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  Min,
} from 'class-validator';
import { ProductType, ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsInt()
  @Min(1)
  points: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsObject()
  extraData?: Record<string, any>;
}
