import {
  IsInt,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderItemDto } from './order-item.dto';
import { OrderStatus } from '@/common';

export class CreateOrderDto {
  @ApiPropertyOptional({ description: '订单号', example: 'ORD202310010001' })
  @IsString()
  @IsOptional()
  orderNo?: string;

  @ApiProperty({ description: '用户ID', example: '123' })
  @IsString()
  userId!: string;

  @ApiProperty({ description: '地址ID', example: '456' })
  @IsString()
  addressId!: string;

  @ApiProperty({ description: '订单项列表', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiProperty({ description: '期望上门时间', example: '2023-10-02T10:00:00Z' })
  @IsString()
  expectPickupTime!: string;

  @ApiProperty({ description: '渠道', example: 'APP' })
  @IsString()
  channel!: string;

  @ApiPropertyOptional({ description: '来源', example: 'WeChat' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: '备注', example: '请带上打包袋' })
  @IsString()
  @IsOptional()
  remark?: string;

  @ApiPropertyOptional({ description: '总金额', example: 100.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional({ description: '预估金额', example: 90.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedAmount?: number;

  @ApiPropertyOptional({ description: '订单状态', enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
