import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@/common/types/auth.types';

export class CreateUserDto {
  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiPropertyOptional({ description: '昵称', example: '张三' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: '用户角色', enum: UserRole, default: UserRole.USER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ description: '第三方登录提供商', example: 'wechat' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: '第三方OpenID', example: 'openid_123456' })
  @IsString()
  @IsOptional()
  openid?: string;

  @ApiPropertyOptional({ description: '应用ID', example: 'wx123456789' })
  @IsString()
  @IsOptional()
  appId?: string;

  @ApiPropertyOptional({ description: '第三方UnionID', example: 'unionid_123456' })
  @IsString()
  @IsOptional()
  unionid?: string;
}
