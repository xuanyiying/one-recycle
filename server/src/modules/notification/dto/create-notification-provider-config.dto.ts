import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum NotificationProviderType {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
}

export enum SmsProvider {
  ALIYUN = 'aliyun-sms',
  TENCENT = 'tencent-sms',
  GENERIC = 'generic-sms',
}

export enum EmailProvider {
  SENDGRID = 'sendgrid-email',
  SES = 'aws-ses',
  SMTP = 'smtp-email',
  GENERIC = 'generic-email',
}

export enum PushProvider {
  FCM = 'firebase-fcm',
  JPUSH = 'jpush',
  APNS = 'apns',
  GENERIC = 'generic-push',
}

export class CreateNotificationProviderConfigDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(NotificationProviderType)
  type: NotificationProviderType;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  apiSecret?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsOptional()
  config?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
