import { UserRole } from '@one-recycle/shared';

export class UserResponseDto {
  id!: string;
  mobile?: string;
  nickname?: string;
  avatarUrl?: string;
  role?: UserRole;
  status?: string;
  createdAt!: string;
  updatedAt!: string;
}

export class UserListResponseDto {
  items!: UserResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}