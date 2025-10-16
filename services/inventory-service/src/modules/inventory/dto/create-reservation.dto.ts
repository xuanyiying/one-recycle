import { IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  itemId: string;
  
  @IsNumber()
  quantity: number;
  
  @IsString()
  orderId: string;
  
  @IsEnum(['PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED'])
  @IsOptional()
  status?: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';
  
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
  
  @IsString()
  @IsOptional()
  notes?: string;
}