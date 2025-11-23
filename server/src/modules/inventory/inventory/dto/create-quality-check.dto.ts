import { IsEnum, IsOptional, IsString, IsNumber, IsArray, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateQualityCheckDto {
  @IsNotEmpty()
  itemId: bigint;
  
  @IsNotEmpty()
  checkerId: bigint;
  
  @IsNotEmpty()
  @IsEnum(CheckType)
  checkType: CheckType;
  
  @IsNotEmpty()
  @IsEnum(CheckResult)
  result: CheckResult;
  
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
  checkedAt: Date;
}