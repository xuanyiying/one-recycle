import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { PaginationParams } from '../../../common/types/common.types';

export class QueryUserDto implements PaginationParams {
  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

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
