import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class IncreaseBalanceDto {
  @IsNumber()
  @IsPositive()
  userId!: number;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  orderId!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
