import { PaymentProvider } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  outTradeNo?: string;
}
