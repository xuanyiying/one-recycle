import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsBoolean,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ChatSessionType,
  ChatSessionStatus,
  ChatMessageType,
  TicketType,
  TicketPriority,
  TicketStatus,
  KnowledgeCategory,
} from '@prisma/client';

export class CreateSessionDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '会话类型', enum: ChatSessionType })
  @IsOptional()
  @IsEnum(ChatSessionType)
  type?: ChatSessionType;

  @ApiPropertyOptional({ description: '会话主题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  @ApiPropertyOptional({ description: '上下文信息' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class UpdateSessionDto {
  @ApiPropertyOptional({ description: '会话状态', enum: ChatSessionStatus })
  @IsOptional()
  @IsEnum(ChatSessionStatus)
  status?: ChatSessionStatus;

  @ApiPropertyOptional({ description: '会话主题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  @ApiPropertyOptional({ description: '上下文信息' })
  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

export class TransferToAgentDto {
  @ApiPropertyOptional({ description: '转接原因' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SubmitSatisfactionDto {
  @ApiProperty({ description: '满意度评分 1-5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  satisfactionRating: number;

  @ApiPropertyOptional({ description: '反馈内容' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedback?: string;
}

export class SendMessageDto {
  @ApiProperty({ description: '会话ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: '消息类型', enum: ChatMessageType })
  @IsOptional()
  @IsEnum(ChatMessageType)
  messageType?: ChatMessageType;

  @ApiPropertyOptional({ description: '消息内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '媒体URL' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: '额外数据' })
  @IsOptional()
  @IsObject()
  extraData?: Record<string, any>;
}

export class GetMessagesDto {
  @ApiProperty({ description: '会话ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: '起始消息ID，用于分页' })
  @IsOptional()
  @IsString()
  before?: string;

  @ApiPropertyOptional({ description: '数量限制', default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class MarkAsReadDto {
  @ApiProperty({ description: '消息ID列表' })
  @IsArray()
  @IsString({ each: true })
  messageIds: string[];
}

export class CreateTicketDto {
  @ApiPropertyOptional({ description: '会话ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: '订单ID' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiProperty({ description: '工单类型', enum: TicketType })
  @IsEnum(TicketType)
  type: TicketType;

  @ApiPropertyOptional({ description: '优先级', enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({ description: '工单标题' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: '问题描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '附件列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class UpdateTicketDto {
  @ApiPropertyOptional({ description: '优先级', enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: '工单状态', enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ description: '问题描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '附件列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class AssignTicketDto {
  @ApiProperty({ description: '分配给的客服ID' })
  @IsString()
  agentId: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ResolveTicketDto {
  @ApiProperty({ description: '解决方案' })
  @IsString()
  resolution: string;
}

export class AddTicketCommentDto {
  @ApiProperty({ description: '处理备注' })
  @IsString()
  comment: string;
}

export class CreateKnowledgeDto {
  @ApiProperty({ description: '分类', enum: KnowledgeCategory })
  @IsEnum(KnowledgeCategory)
  category: KnowledgeCategory;

  @ApiProperty({ description: '问题' })
  @IsString()
  question: string;

  @ApiProperty({ description: '答案' })
  @IsString()
  answer: string;

  @ApiPropertyOptional({ description: '关键词列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: '意图标签' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  intent?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class UpdateKnowledgeDto {
  @ApiPropertyOptional({ description: '分类', enum: KnowledgeCategory })
  @IsOptional()
  @IsEnum(KnowledgeCategory)
  category?: KnowledgeCategory;

  @ApiPropertyOptional({ description: '问题' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ description: '答案' })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({ description: '关键词列表' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ description: '意图标签' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  intent?: string;

  @ApiPropertyOptional({ description: '优先级' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryKnowledgeDto {
  @ApiPropertyOptional({ description: '分类', enum: KnowledgeCategory })
  @IsOptional()
  @IsEnum(KnowledgeCategory)
  category?: KnowledgeCategory;

  @ApiPropertyOptional({ description: '关键词搜索' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '意图标签' })
  @IsOptional()
  @IsString()
  intent?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;
}

export class QueryTicketDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '订单ID' })
  @IsOptional()
  @IsString()
  orderId?: string;

  @ApiPropertyOptional({ description: '工单类型', enum: TicketType })
  @IsOptional()
  @IsEnum(TicketType)
  type?: TicketType;

  @ApiPropertyOptional({ description: '工单状态', enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ description: '优先级', enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({ description: '分配给的客服ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;
}
