import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsNotEmpty } from 'class-validator';
import { ReservationStatus } from '../entities/inventory.entity';

export class CreateReservationDto {
  @IsNotEmpty()
  itemId: bigint;
  
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  
  @IsNotEmpty()
  @IsString()
  orderId: string;
  
  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;
  
  @IsDateString()
  @IsNotEmpty()
  expiresAt: Date;
  
  @IsString()
  @IsOptional()
  notes?: string;
}