import { IsNumber, IsPositive, IsString } from 'class-validator';

export class UnfreezeBalanceDto {
  @IsNumber()
  @IsPositive()
  userId!: number;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  withdrawalId!: string;
}
