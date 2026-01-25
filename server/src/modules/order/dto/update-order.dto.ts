import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, OrderPriority } from '@/common';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({ description: '订单状态', enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: '优先级', enum: OrderPriority })
  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: '期望上门时间' })
  @IsOptional()
  @IsDateString()
  expectPickupTime?: string;

  @ApiPropertyOptional({ description: '期望送达时间' })
  @IsOptional()
  @IsDateString()
  expectDeliveryTime?: string;

  @ApiPropertyOptional({ description: '实际上门时间' })
  @IsOptional()
  @IsDateString()
  actualPickupTime?: string;

  @ApiPropertyOptional({ description: '实际送达时间' })
  @IsOptional()
  @IsDateString()
  actualDeliveryTime?: string;

  @ApiPropertyOptional({ description: '结算金额' })
  @IsOptional()
  @IsNumber()
  settlementAmount?: number;

  @ApiPropertyOptional({ description: '支付金额' })
  @IsOptional()
  @IsNumber()
  payAmount?: number;
}
