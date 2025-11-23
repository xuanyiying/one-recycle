import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '@one-recycle/shared';
import { PaginationParams } from '@one-recycle/shared';

export class QueryUserDto implements PaginationParams {
  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(UserRole)
  status?: UserRole;

  @IsOptional()
  @IsEnum(['id', 'mobile', 'nickname', 'createdAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 10;
}