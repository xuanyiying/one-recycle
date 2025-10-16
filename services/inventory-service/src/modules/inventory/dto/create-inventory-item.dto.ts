import { IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateInventoryItemDto {
  @IsNumber()
  warehouseId: number;

  @IsNumber()
  categoryId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  unit: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  location?: string;
  
  @IsEnum(['RECYCLED', 'PURCHASED', 'RETURNED'])
  @IsOptional()
  itemType?: 'RECYCLED' | 'PURCHASED' | 'RETURNED';
  
  @IsEnum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'])
  @IsOptional()
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  
  @IsString()
  @IsOptional()
  sourceOrderId?: string;
  
  @IsString()
  @IsOptional()
  qualityGrade?: string;
  
  @IsEnum(['RECEIVED', 'INSPECTING', 'PROCESSING', 'CLEANED', 'REPAIRED', 'READY', 'REJECTED'])
  @IsOptional()
  processingStatus?: 'RECEIVED' | 'INSPECTING' | 'PROCESSING' | 'CLEANED' | 'REPAIRED' | 'READY' | 'REJECTED';
  
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
  
  @IsString()
  @IsOptional()
  batchNumber?: string;
}