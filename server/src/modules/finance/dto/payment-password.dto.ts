import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SetPaymentPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
