import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { WithdrawalStatus } from '@prisma/client';

export class WithdrawalFiltersDto {
  @IsOptional()
  @IsEnum(WithdrawalStatus)
  status?: WithdrawalStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
