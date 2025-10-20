import { UserRole } from '@shared/types/auth.types';
import { PaginationParams } from '@shared/types/common.types';

export interface QueryUserDto extends PaginationParams {
  mobile?: string;
  nickname?: string;
  role?: UserRole;
  status?: string;
  provider?: string;
}