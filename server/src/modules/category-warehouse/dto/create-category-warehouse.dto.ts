import { IsInt, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryWarehouseDto {
  @IsInt()
  @Type(() => Number)
  categoryId!: number;

  @IsInt()
  @Type(() => Number)
  warehouseId!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
