import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  estimatedPrice: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @IsOptional()
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class OrderCreatedEventDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsDateString()
  scheduledTime: string;

  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @IsDateString()
  @IsOptional()
  createdAt?: string;
}

export class OrderStatusChangedEventDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  oldStatus: string;

  @IsString()
  @IsNotEmpty()
  newStatus: string;

  @IsString()
  @IsNotEmpty()
  updatedBy: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  timestamp: string;
}

export class OrderCancelledEventDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  cancelledBy: string;

  @IsDateString()
  timestamp: string;
}

export class OrderCompletedEventDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  settlementAmount: number;

  @IsDateString()
  completedAt: string;

  @IsString()
  @IsOptional()
  courierId?: string;
}
