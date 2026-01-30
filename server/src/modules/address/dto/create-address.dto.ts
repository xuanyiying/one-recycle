import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  userId!: string;

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
  @IsOptional()
  town?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  detail!: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
