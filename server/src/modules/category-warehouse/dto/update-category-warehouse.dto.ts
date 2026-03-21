import { IsInt, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryWarehouseDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  warehouseId?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
