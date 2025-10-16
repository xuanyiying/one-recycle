import { IsNumber, IsPositive } from 'class-validator';

export class CreateAccountDto {
  @IsNumber()
  @IsPositive()
  userId: number;
}
