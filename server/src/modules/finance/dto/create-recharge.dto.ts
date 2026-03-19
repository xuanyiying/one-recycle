import {
  IsNumber,
  IsString,
  IsNotEmpty,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class CreateRechargeDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['ALIPAY', 'WECHAT'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tenantId?: string;
}
