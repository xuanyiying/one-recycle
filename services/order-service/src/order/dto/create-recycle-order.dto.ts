import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RecycleOrderItemDto {
  @IsNumber()
  categoryId: number;
  
  @IsString()
  name: string;
  
  @IsString()
  @IsOptional()
  description?: string;
  
  @IsNumber()
  estimatedQuantity: number;
  
  @IsString()
  unit: string;
  
  @IsNumber()
  @IsOptional()
  estimatedPrice?: number;
  
  @IsEnum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'])
  @IsOptional()
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateRecycleOrderDto {
  @IsNumber()
  userId: number;
  
  @IsNumber()
  addressId: number;
  
  @IsDateString()
  expectPickupTime: string;
  
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
  @Type(() => RecycleOrderItemDto)
  items: RecycleOrderItemDto[];
}