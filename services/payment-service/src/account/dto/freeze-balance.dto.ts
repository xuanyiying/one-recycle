import { IsNumber, IsPositive, IsString } from 'class-validator';

export class FreezeBalanceDto {
  @IsNumber()
  @IsPositive()
  userId!: number;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  withdrawalId!: string;
}
