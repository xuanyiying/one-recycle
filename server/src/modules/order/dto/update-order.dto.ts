import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { OrderStatus, OrderPriority } from '../entities/order.entity';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsDateString()
  expectPickupTime?: string;

  @IsOptional()
  @IsDateString()
  expectDeliveryTime?: string;

  @IsOptional()
  @IsDateString()
  actualPickupTime?: string;

  @IsOptional()
  @IsDateString()
  actualDeliveryTime?: string;
}