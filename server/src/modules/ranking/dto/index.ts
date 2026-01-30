import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RankingResponseDto {
  @ApiProperty()
  rank: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  score: number;

  @ApiProperty()
  trend: 'up' | 'down' | 'same';
}

export class RankingQueryDto {
  @ApiProperty({ required: false, enum: ['total', 'week', 'month'] })
  @IsOptional()
  @IsEnum(['total', 'week', 'month'])
  type?: 'total' | 'week' | 'month';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
