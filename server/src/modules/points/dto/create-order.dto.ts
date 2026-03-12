import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateOrderDto {
  @Transform(({ value }) => BigInt(value))
  productId: bigint;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @Transform(({ value }) => (value ? BigInt(value) : undefined))
  addressId?: bigint;

  @IsOptional()
  @IsString()
  remark?: string;
}
