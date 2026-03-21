import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, OrderPriority } from '@/common';

export class UpdateOrderItemDto {
  @ApiPropertyOptional({ description: '商品ID' })
  @IsInt()
  id!: number;

  @ApiPropertyOptional({ description: '数量' })
  @IsInt()
  @Min(0)
  quantity!: number;
}

export class UpdateOrderDto extends OmitType(PartialType(CreateOrderDto), [
  'items',
] as const) {
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

  @ApiPropertyOptional({
    description: '订单项更新列表',
    type: [UpdateOrderItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}
