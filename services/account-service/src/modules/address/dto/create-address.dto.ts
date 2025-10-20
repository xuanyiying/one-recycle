import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNumber()
  userId!: number;

  @IsString()
  consignee!: string;

  @IsString()
  mobile!: string;

  @IsString()
  province!: string;

  @IsString()
  city!: string;

  @IsString()
  district!: string;

  @IsString()
  detail!: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}