import { IsInt, IsNumber, IsEnum, IsOptional, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';
import { OrderType, OrderStatus } from '../entities';

export class CreateOrderDto {
  @IsInt()
  userId!: number;

  @IsInt()
  addressId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsString()
  expectPickupTime!: string;

  @IsString()
  channel!: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}