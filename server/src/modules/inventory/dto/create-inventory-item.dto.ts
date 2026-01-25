import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import {
  ItemCondition,
  ItemType,
  ProcessingStatus,
} from '@prisma/client';

export class CreateInventoryItemDto {
  @IsNotEmpty()
  warehouseId: bigint;

  @IsNotEmpty()
  categoryId: bigint;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNotEmpty()
  @IsEnum(ItemType)
  itemType: ItemType;

  @IsNotEmpty()
  @IsEnum(ItemCondition)
  condition: ItemCondition;

  @IsOptional()
  @IsString()
  sourceOrderId?: string;

  @IsOptional()
  @IsString()
  qualityGrade?: string;

  @IsNotEmpty()
  @IsEnum(ProcessingStatus)
  processingStatus: ProcessingStatus;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  batchNumber?: string;
}
