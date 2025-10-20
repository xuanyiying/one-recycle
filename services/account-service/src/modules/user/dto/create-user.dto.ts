import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { IsMobilePhone } from '@shared/decorators/validation.decorator';
import { UserRole } from '@shared/types/auth.types';

export class CreateUserDto {
  @IsMobilePhone()
  mobile!: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  provider?: string;

  @IsString()
  @IsOptional()
  openid?: string;

  @IsString()
  @IsOptional()
  appId?: string;

  @IsString()
  @IsOptional()
  unionid?: string;
}