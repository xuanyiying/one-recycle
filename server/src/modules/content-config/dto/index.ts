import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FAQCategory, RecycleRuleCategory } from '@prisma/client';

export class CreateFAQDto {
  @ApiProperty({ description: '问题' })
  @IsString()
  question: string;

  @ApiProperty({ description: '答案' })
  @IsString()
  answer: string;

  @ApiPropertyOptional({
    description: '分类',
    enum: FAQCategory,
    default: FAQCategory.GENERAL,
  })
  @IsEnum(FAQCategory)
  @IsOptional()
  category?: FAQCategory;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFAQDto {
  @ApiPropertyOptional({ description: '问题' })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiPropertyOptional({ description: '答案' })
  @IsString()
  @IsOptional()
  answer?: string;

  @ApiPropertyOptional({ description: '分类', enum: FAQCategory })
  @IsEnum(FAQCategory)
  @IsOptional()
  category?: FAQCategory;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryFAQDto {
  @ApiPropertyOptional({ description: '分类', enum: FAQCategory })
  @IsEnum(FAQCategory)
  @IsOptional()
  category?: FAQCategory;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number;
}

export class CreateRecycleRuleDto {
  @ApiProperty({ description: '分类', enum: RecycleRuleCategory })
  @IsEnum(RecycleRuleCategory)
  category: RecycleRuleCategory;

  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '扩展字段' })
  @IsOptional()
  extra?: Record<string, any>;
}

export class UpdateRecycleRuleDto {
  @ApiPropertyOptional({ description: '分类', enum: RecycleRuleCategory })
  @IsEnum(RecycleRuleCategory)
  @IsOptional()
  category?: RecycleRuleCategory;

  @ApiPropertyOptional({ description: '标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '内容' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: '图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '排序' })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '扩展字段' })
  @IsOptional()
  extra?: Record<string, any>;
}

export class QueryRecycleRuleDto {
  @ApiPropertyOptional({ description: '分类', enum: RecycleRuleCategory })
  @IsEnum(RecycleRuleCategory)
  @IsOptional()
  category?: RecycleRuleCategory;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number;
}
