import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';

// Existing payment event DTOs
export class PaymentCallbackEventDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsOptional()
  callbackData?: any;

  @IsOptional()
  rawData?: any;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class PaymentSuccessEventDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsDateString()
  paidAt: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class PaymentFailedEventDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsDateString()
  failedAt: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

export class RefundEventDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  requestedBy?: string;

  @IsDateString()
  requestedAt: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;
}

// Withdrawal event DTOs
export enum WithdrawalProvider {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
}

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

export class WithdrawalCreatedEventDto {
  @IsString()
  @IsNotEmpty()
  withdrawalId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsEnum(WithdrawalProvider)
  provider: WithdrawalProvider;

  @IsString()
  @IsNotEmpty()
  outTradeNo: string;

  @IsDateString()
  createdAt: string;
}

export class WithdrawalCompletedEventDto {
  @IsString()
  @IsNotEmpty()
  withdrawalId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  amount: number;

  @IsEnum(WithdrawalStatus)
  status: WithdrawalStatus;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  rejectedReason?: string;

  @IsDateString()
  completedAt: string;
}
