import { IsNumber, IsPositive, IsString } from 'class-validator';

export class DeductFrozenBalanceDto {
  @IsNumber()
  @IsPositive()
  userId!: number;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  withdrawalId!: string;
}
