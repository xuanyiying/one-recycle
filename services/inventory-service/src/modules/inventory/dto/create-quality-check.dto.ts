import { IsEnum, IsOptional, IsString, IsNumber, IsArray, IsDateString } from 'class-validator';

export class CreateQualityCheckDto {
  @IsNumber()
  itemId: number;
  
  @IsNumber()
  checkerId: number;
  
  @IsEnum(['INITIAL', 'DETAILED', 'FINAL', 'RANDOM'])
  checkType: 'INITIAL' | 'DETAILED' | 'FINAL' | 'RANDOM';
  
  @IsEnum(['PASSED', 'FAILED', 'CONDITIONAL'])
  result: 'PASSED' | 'FAILED' | 'CONDITIONAL';
  
  @IsNumber()
  @IsOptional()
  score?: number; // 1-100
  
  @IsString()
  @IsOptional()
  notes?: string;
  
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
  
  @IsDateString()
  checkedAt: string;
}