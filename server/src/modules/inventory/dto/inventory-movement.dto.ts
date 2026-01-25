import { IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsString()
  quantity: string;

  @IsOptional()
  @IsString()
  unitPrice?: string;

  @IsOptional()
  @IsString()
  totalAmount?: string;

  @IsNotEmpty()
  @IsString()
  beforeQty: string;

  @IsNotEmpty()
  @IsString()
  afterQty: string;

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
