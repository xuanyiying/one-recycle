import {
  IsInt,
  IsNumber,
  IsString,
  Min,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: '分类ID', example: 1 })
  @IsOptional()
  categoryId!: number | string;

  @ApiPropertyOptional({ description: '分类名称' })
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional({ description: '预估重量', example: 5.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedWeight?: number;

  @ApiPropertyOptional({ description: '重量', example: 5.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: '单价', example: 1.2 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @ApiProperty({ description: '数量', example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ description: '品牌型号' })
  @IsString()
  @IsOptional()
  brandModel?: string;

  @ApiPropertyOptional({ description: '成色' })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ description: '照片列表' })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: '预估价格范围' })
  @IsOptional()
  estimatedPrice?: any;
}
