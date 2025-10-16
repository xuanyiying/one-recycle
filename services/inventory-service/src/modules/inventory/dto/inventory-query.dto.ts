import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class InventoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @Type(() => BigInt)
  warehouseId?: bigint;

  @IsOptional()
  @Type(() => BigInt)
  categoryId?: bigint;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  lowStock?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}