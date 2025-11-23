import { IsString, IsOptional, IsArray, IsEmail, IsNumber } from 'class-validator';

export class UpdateCourierDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  workingHours?: { startTime: string; endTime: string; workingDays: number[] };

  @IsOptional()
  @IsArray()
  serviceAreas?: string[];

  @IsOptional()
  @IsNumber()
  rating?: number;
}

