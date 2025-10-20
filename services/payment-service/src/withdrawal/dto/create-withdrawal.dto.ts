import { IsNumber, IsEnum, IsObject, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProvider } from '@prisma/client';

export class WithdrawalAccountInfo {
  // WeChat
  openid?: string;
  realName?: string;
  
  // Alipay
  alipayAccount?: string;
  alipayName?: string;
}

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(10, { message: '最低提现金额为10元' })
  amount!: number;

  @IsEnum(PaymentProvider, { message: '无效的支付方式' })
  provider!: PaymentProvider;

  @IsObject()
  @ValidateNested()
  @Type(() => WithdrawalAccountInfo)
  accountInfo!: WithdrawalAccountInfo;
}
