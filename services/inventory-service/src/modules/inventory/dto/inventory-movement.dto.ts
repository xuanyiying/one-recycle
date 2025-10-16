import { IsNotEmpty, IsOptional, IsEnum, IsString, IsNumber, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

// 枚举定义
export enum MovementType {
  PURCHASE = 'PURCHASE',
  RECYCLE_IN = 'RECYCLE_IN',
  SALE_OUT = 'SALE_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUST_IN = 'ADJUST_IN',
  ADJUST_OUT = 'ADJUST_OUT',
  DAMAGE_OUT = 'DAMAGE_OUT',
  RETURN_IN = 'RETURN_IN',
  RETURN_OUT = 'RETURN_OUT',
}

export enum MovementDirection {
  IN = 'IN',
  OUT = 'OUT',
}

export class InventoryMovementDto {
  @IsNotEmpty()
  @Type(() => BigInt)
  itemId: bigint;

  @IsNotEmpty()
  @Type(() => BigInt)
  warehouseId: bigint;

  @IsNotEmpty()
  @Type(() => BigInt)
  categoryId: bigint;

  @IsNotEmpty()
  @IsEnum(MovementType)
  movementType: MovementType;

  @IsNotEmpty()
  @IsEnum(MovementDirection)
  direction: MovementDirection;

  @IsNotEmpty()
  @Type(() => Decimal)
  quantity: Decimal;

  @IsOptional()
  @Type(() => Decimal)
  unitPrice?: Decimal;

  @IsOptional()
  @Type(() => Decimal)
  totalAmount?: Decimal;

  @IsNotEmpty()
  @Type(() => Decimal)
  beforeQty: Decimal;

  @IsNotEmpty()
  @Type(() => Decimal)
  afterQty: Decimal;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @Type(() => BigInt)
  referenceId?: bigint;

  @IsOptional()
  @IsString()
  referenceNo?: string;

  @IsOptional()
  @Type(() => BigInt)
  operatorId?: bigint;

  @IsOptional()
  @IsString()
  operatorName?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}