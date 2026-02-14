import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CreateWithdrawalDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsNotEmpty()
  accountInfo: any;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
