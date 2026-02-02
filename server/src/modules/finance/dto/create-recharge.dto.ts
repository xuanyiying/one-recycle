import { IsNumber, IsString, IsNotEmpty, Min, IsEnum } from 'class-validator';

export class CreateRechargeDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['ALIPAY', 'WECHAT'])
  paymentMethod: string;
}
