import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaleOrderItemDto {
  @IsNumber()
  inventoryItemId!: number;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateSaleOrderDto {
  @IsNumber()
  userId!: number;

  @IsNumber()
  addressId!: number;

  @IsDateString()
  @IsOptional()
  expectDeliveryTime?: string;

  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  @IsOptional()
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleOrderItemDto)
  items!: SaleOrderItemDto[];
}
