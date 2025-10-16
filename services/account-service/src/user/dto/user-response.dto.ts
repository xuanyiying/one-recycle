import { UserRole } from '@shared/types/auth.types';
import { BaseEntity, PaginatedResponse } from '@shared/types/common.types';

export interface UserResponseDto extends BaseEntity {
  mobile: string;
  nickname?: string;
  avatarUrl?: string;
  role: UserRole;
  status: string;
}

export interface UserListResponseDto extends PaginatedResponse<UserResponseDto> {}