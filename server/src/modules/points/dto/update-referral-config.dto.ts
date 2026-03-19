import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export enum RewardType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum RewardTiming {
  FIRST_ORDER = 'FIRST_ORDER',
  EVERY_ORDER = 'EVERY_ORDER',
}

export class UpdateReferralConfigDto {
  @IsString()
  @IsOptional()
  @IsIn([RewardType.FIXED, RewardType.PERCENTAGE])
  rewardType?: string;

  @IsNumber()
  @IsOptional()
  rewardValue?: number;

  @IsString()
  @IsOptional()
  @IsIn([RewardTiming.FIRST_ORDER, RewardTiming.EVERY_ORDER])
  rewardTiming?: string;

  @IsNumber()
  @IsOptional()
  minRewardPoints?: number;
}
