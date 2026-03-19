import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CustomerUserQueryDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CustomerUserListItemDto {
  id: string;
  mobile: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  status: string;
  points: number;
  createdAt: string;
  orderCount: number;
  totalOrderAmount: number;
}

export class CustomerUserListResponseDto {
  items: CustomerUserListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CustomerUserDetailDto {
  id: string;
  mobile: string | null;
  nickname: string | null;
  realName: string | null;
  avatarUrl: string | null;
  gender: string | null;
  birthday: string | null;
  status: string;
  points: number;
  balance: number;
  createdAt: string;
  lastLogin: string | null;
  orderStats: {
    totalOrders: number;
    completedOrders: number;
    totalAmount: number;
  };
  inviteStats: {
    invitedCount: number;
    totalRewardPoints: number;
    totalOrderRewards: number;
  } | null;
  inviterInfo: {
    id: string;
    nickname: string | null;
    mobile: string | null;
  } | null;
}

export class CustomerPointsRecordDto {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  sourceType: string | null;
  sourceId: string | null;
  description: string;
  createdAt: string;
}

export class CustomerPointsRecordResponseDto {
  items: CustomerPointsRecordDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CustomerOrderDto {
  id: string;
  orderNo: string;
  status: string;
  settlementAmount: number;
  itemCount: number;
  createdAt: string;
  completedAt: string | null;
}

export class CustomerOrderResponseDto {
  items: CustomerOrderDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
