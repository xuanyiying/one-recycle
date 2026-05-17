import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProvider } from '@prisma/client';

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
