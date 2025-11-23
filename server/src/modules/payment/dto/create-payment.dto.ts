import { IsInt, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
  BANK_CARD = 'BANK_CARD'
}

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  provider!: string;

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  outTradeNo?: string;
}