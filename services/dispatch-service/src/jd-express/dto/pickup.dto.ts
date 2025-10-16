import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '../interfaces/jd-express.interface';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  postcode?: string;
}

export class GoodsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  @IsOptional()
  volume?: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePickupDto {
  @IsString()
  @IsNotEmpty()
  orderNo: string;

  @ValidateNested()
  @Type(() => AddressDto)
  sender: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  receiver: AddressDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsDto)
  goods: GoodsDto[];

  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsNumber()
  payType: number;

  @IsString()
  @IsOptional()
  expectPickupTime?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsBoolean()
  @IsOptional()
  insured?: boolean;

  @IsNumber()
  @IsOptional()
  insuredValue?: number;
}

export class CancelPickupDto {
  @IsString()
  @IsNotEmpty()
  orderNo: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class QueryWaybillDto {
  @IsString()
  @IsNotEmpty()
  waybillNo: string;
}