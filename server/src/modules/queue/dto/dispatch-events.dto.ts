import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class AutoDispatchEventDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsObject()
  @IsOptional()
  criteria?: {
    maxDistance?: number;
    minRating?: number;
    preferredCouriers?: string[];
  };
}

export class ManualDispatchEventDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  courierId: string;

  @IsString()
  @IsNotEmpty()
  assignedBy: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class ReassignCourierEventDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  oldCourierId: string;

  @IsString()
  @IsNotEmpty()
  newCourierId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  reassignedBy: string;
}