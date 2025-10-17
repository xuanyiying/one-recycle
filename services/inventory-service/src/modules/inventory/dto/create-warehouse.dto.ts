import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum WarehouseType {
  MAIN = 'MAIN',
  BRANCH = 'BRANCH',
  TRANSIT = 'TRANSIT',
  RETURN = 'RETURN',
}

export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateWarehouseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(WarehouseType)
  type: WarehouseType;

  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus = WarehouseStatus.ACTIVE;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @Type(() => BigInt)
  managerId?: bigint;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @Type(() => Number)
  area?: number;

  @IsOptional()
  @IsBoolean()
  temperatureControlled?: boolean = false;

  @IsOptional()
  @IsBoolean()
  humidityControlled?: boolean = false;

  @IsOptional()
  @IsString()
  operatingHours?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}