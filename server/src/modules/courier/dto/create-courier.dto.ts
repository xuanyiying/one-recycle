import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateCourierDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  workingHours?: { startTime: string; endTime: string; workingDays: number[] };

  @IsOptional()
  @IsArray()
  serviceAreas?: string[];
}

