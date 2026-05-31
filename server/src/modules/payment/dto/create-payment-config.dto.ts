import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum PaymentProviderType {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
  UNIONPAY = 'UNIONPAY',
}

export class CreatePaymentConfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(PaymentProviderType)
  provider: PaymentProviderType;

  @IsString()
  @IsOptional()
  apiUrl?: string;

  @IsString()
  @IsOptional()
  appId?: string;

  @IsString()
  @IsOptional()
  appSecret?: string;

  @IsString()
  @IsOptional()
  merchantId?: string;

  @IsString()
  @IsOptional()
  privateKey?: string;

  @IsString()
  @IsOptional()
  publicKey?: string;

  @IsString()
  @IsOptional()
  certPath?: string;

  @IsString()
  @IsOptional()
  keyPath?: string;

  @IsString()
  @IsOptional()
  callbackUrl?: string;

  @IsOptional()
  config?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
