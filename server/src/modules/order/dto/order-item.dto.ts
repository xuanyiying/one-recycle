import { IsInt, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ description: '分类ID', example: 1 })
  @IsInt()
  categoryId!: number;

  @ApiProperty({ description: '预估重量', example: 5.5 })
  @IsNumber()
  @Min(0)
  estimatedWeight!: number;

  @ApiProperty({ description: '单价', example: 1.2 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ description: '数量', example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
