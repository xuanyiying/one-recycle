import { PaymentProvider } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class AccountInfoDto {
  @IsString()
  @IsNotEmpty()
  accountName!: string;

  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  branchName?: string;
}

export class CreateWithdrawalDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsNumber()
  @Min(0.01)
  @Max(50000)
  amount: number;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @ValidateNested()
  @Type(() => AccountInfoDto)
  accountInfo!: AccountInfoDto;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
