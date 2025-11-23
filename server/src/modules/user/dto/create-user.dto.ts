import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { UserRole } from '@one-recycle/shared';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  mobile?: string;

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