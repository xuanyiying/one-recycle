import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@/common';

export class UserResponseDto {
  @ApiProperty({ description: '用户ID', example: '123456789' })
  id!: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  mobile?: string;

  @ApiPropertyOptional({ description: '昵称', example: '张三' })
  nickname?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiPropertyOptional({ description: '用户角色', enum: UserRole, example: UserRole.USER })
  role?: UserRole;

  @ApiPropertyOptional({ description: '用户状态', example: 'ACTIVE' })
  status?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt!: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt!: string;
}

export class UserListResponseDto {
  @ApiProperty({ description: '用户列表', type: [UserResponseDto] })
  items!: UserResponseDto[];

  @ApiProperty({ description: '总数', example: 100 })
  total!: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page!: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit!: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages!: number;
}
