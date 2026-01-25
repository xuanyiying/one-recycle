import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';

export enum NotificationPriority {
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export class SmsNotificationEventDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsObject()
  params: Record<string, any>;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;
}

export class PushNotificationEventDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;
}

export class EmailNotificationEventDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  template?: string;

  @IsObject()
  @IsOptional()
  params?: Record<string, any>;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;
}

export class BatchNotificationEventDto {
  @IsString()
  @IsNotEmpty()
  type: 'sms' | 'push' | 'email';

  @IsObject({ each: true })
  notifications: Array<
    | SmsNotificationEventDto
    | PushNotificationEventDto
    | EmailNotificationEventDto
  >;
}
