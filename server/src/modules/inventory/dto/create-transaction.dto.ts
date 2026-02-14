import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { InventoryTxnType } from '@prisma/client';

export class CreateTransactionDto {
  @IsNotEmpty()
  itemId: bigint;

  @IsNotEmpty()
  @IsEnum(InventoryTxnType)
  type: InventoryTxnType;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
