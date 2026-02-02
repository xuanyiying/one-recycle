import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateLogisticsProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  apiUrl?: string;

  @IsString()
  @IsOptional()
  tenantId?: string;

  @IsString()
  @IsOptional()
  appId?: string;

  @IsString()
  @IsOptional()
  appSecret?: string;

  @IsOptional()
  config?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
