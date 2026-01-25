import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsNumber()
  userId!: number;

  @IsString()
  name!: string; // 收货人

  @IsString()
  mobile!: string; // 手机号

  @IsString()
  province!: string; // 省

  @IsString()
  city!: string; // 市

  @IsString()
  district!: string; // 县

  @IsString()
  detail!: string; // 详细地址

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
