import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WithdrawalNotifyDto {
  @IsString()
  @IsNotEmpty()
  outTradeNo: string;

  @IsEnum(['SUCCESS', 'FAILED', 'TIMEOUT'] as const)
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';

  @IsOptional()
  @IsString()
  providerTxnNo?: string;

  @IsOptional()
  raw?: any;

  @IsOptional()
  @IsString()
  sign?: string;

  @IsOptional()
  @IsString()
  signType?: string;

  @IsOptional()
  @IsString()
  rawData?: string;
}
