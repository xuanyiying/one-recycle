import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * Base Response for ECAP APIs
 */
export class EcapResponse<T = any> {
  @IsString()
  code: string;

  @IsString()
  message: string;

  @IsOptional()
  data?: T;

  @IsOptional()
  @IsString()
  traceId?: string;
}

/**
 * 1. Pre-check API (/ecap/v1/orders/precheck)
 */
export class PrecheckDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string; // Tenant Code

  @IsNotEmpty()
  @IsString()
  pickupAddress: string; // Full address string

  @IsOptional()
  @IsString()
  pickupProvince?: string;

  @IsOptional()
  @IsString()
  pickupCity?: string;

  @IsOptional()
  @IsString()
  pickupCounty?: string;

  @IsNotEmpty()
  @IsString()
  deliveryAddress: string; // Receiver address
}

export class PrecheckResult {
  @IsString()
  pickupStartTime: string;

  @IsString()
  pickupEndTime: string;

  @IsNumber()
  estimatedFreight: number;

  @IsString()
  promiseTime: string; // Estimated delivery time
}

/**
 * 2. Create Order API (/ecap/v1/orders/create)
 */
export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  orderId: string; // Business Order ID (Unique)

  @IsNotEmpty()
  @IsString()
  senderName: string;

  @IsNotEmpty()
  @IsString()
  senderMobile: string;

  @IsNotEmpty()
  @IsString()
  senderAddress: string;

  @IsNotEmpty()
  @IsString()
  receiverName: string;

  @IsNotEmpty()
  @IsString()
  receiverMobile: string;

  @IsNotEmpty()
  @IsString()
  receiverAddress: string;

  @IsNotEmpty()
  @IsNumber()
  packageCount: number;

  @IsNotEmpty()
  @IsNumber()
  weight: number;

  @IsOptional()
  @IsString()
  goodsName?: string;

  @IsOptional()
  @IsString()
  pickupTime?: string;
}

export class CreateOrderResult {
  @IsString()
  waybillCode: string; // JD Waybill Number

  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  estimatedPickupTime?: string;

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string;
}

/**
 * 3. Subscribe Trace API (/ecap/v1/orders/trace/subscribe)
 */
export class SubscribeTraceDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  waybillCode: string;
}

/**
 * 4. Query Trace API (/ecap/v1/orders/trace/query)
 */
export class QueryTraceDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  waybillCode: string;
}

export class TraceItem {
  @IsString()
  time: string;

  @IsString()
  context: string;

  @IsOptional()
  @IsString()
  operator?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class QueryTraceResult {
  @IsString()
  waybillCode: string;

  @IsString()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TraceItem)
  traces: TraceItem[];
}

/**
 * 5. Modify Order API (/ecap/v1/orders/modify)
 */
export class ModifyOrderDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  waybillCode: string;

  @IsOptional()
  @IsString()
  receiverName?: string;

  @IsOptional()
  @IsString()
  receiverMobile?: string;

  @IsOptional()
  @IsString()
  receiverAddress?: string;
}

/**
 * 6. Cancel Order API (/ecap/v1/orders/cancel)
 */
export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  waybillCode: string;

  @IsNotEmpty()
  @IsString()
  cancelReason: string;
}

/**
 * 7. Query Status API (/ecap/v1/orders/status/get)
 */
export class QueryStatusDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  waybillCode: string;
}

export class QueryStatusResult {
  @IsString()
  waybillCode: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  statusDesc?: string;

  @IsOptional()
  @IsString()
  pickupTime?: string;

  @IsOptional()
  @IsString()
  deliveryTime?: string;
}

/**
 * 8. Query Fee API (/ecap/v1/orders/actualfee/query)
 */
export class QueryFeeDto {
  @IsNotEmpty()
  @IsString()
  customerCode: string;

  @IsNotEmpty()
  @IsString()
  waybillCode: string;
}

export class QueryFeeResult {
  @IsString()
  waybillCode: string;

  @IsNumber()
  totalFee: number;

  @IsOptional()
  @IsNumber()
  freight?: number;

  @IsOptional()
  @IsNumber()
  insuranceFee?: number;

  @IsOptional()
  @IsNumber()
  pickupFee?: number;

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  otherFee?: number;
}
