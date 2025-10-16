import { IsEnum, IsObject, IsOptional, IsString, IsDateString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

export class RecipientDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  deviceToken?: string;

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class NotificationContentDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>;
}

export class DeliveryOptionsDto {
  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @IsOptional()
  @IsNumber()
  maxRetries?: number;

  @IsOptional()
  @IsNumber()
  retryDelay?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsDateString()
  scheduleAt?: string;

  @IsOptional()
  @IsString()
  batchId?: string;
}

export class SendNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @ValidateNested()
  @Type(() => RecipientDto)
  recipient: RecipientDto;

  @ValidateNested()
  @Type(() => NotificationContentDto)
  content: NotificationContentDto;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryOptionsDto)
  deliveryOptions?: DeliveryOptionsDto;
}