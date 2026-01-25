import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsNumber()
  userId!: number;

  @IsString()
  name!: string;

  @IsString()
  mobile!: string;

  @IsString()
  province!: string;

  @IsString()
  city!: string;

  @IsString()
  district!: string;

  @IsString()
  town!: string;

  @IsString()
  street!: string;

  @IsString()
  zipCode!: string;

  @IsString()
  detail!: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
