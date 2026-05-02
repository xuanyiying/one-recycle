import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailNotificationsDto {
  @ApiProperty({ description: '订单更新通知' })
  orderUpdates: boolean;

  @ApiProperty({ description: '用户注册通知' })
  userRegistrations: boolean;

  @ApiProperty({ description: '系统警报通知' })
  systemAlerts: boolean;

  @ApiProperty({ description: '库存警报通知' })
  inventoryAlerts: boolean;

  @ApiProperty({ description: '支付通知' })
  paymentNotifications: boolean;

  @ApiProperty({ description: '营销邮件' })
  marketingEmails: boolean;
}

export class SmsNotificationsDto {
  @ApiProperty({ description: '订单更新通知' })
  orderUpdates: boolean;

  @ApiProperty({ description: '系统警报通知' })
  systemAlerts: boolean;

  @ApiProperty({ description: '安全警报通知' })
  securityAlerts: boolean;

  @ApiProperty({ description: '紧急警报通知' })
  emergencyAlerts: boolean;
}

export class PushNotificationsDto {
  @ApiProperty({ description: '订单更新通知' })
  orderUpdates: boolean;

  @ApiProperty({ description: '用户活动通知' })
  userActivities: boolean;

  @ApiProperty({ description: '系统警报通知' })
  systemAlerts: boolean;

  @ApiProperty({ description: '促销通知' })
  promotions: boolean;
}

export class QuietHoursDto {
  @ApiProperty({ description: '是否启用免打扰时段' })
  enabled: boolean;

  @ApiProperty({ description: '开始时间 (HH:mm)' })
  startTime: string;

  @ApiProperty({ description: '结束时间 (HH:mm)' })
  endTime: string;
}

export class NotificationSettingsDto {
  @ApiProperty({ type: EmailNotificationsDto })
  emailNotifications: EmailNotificationsDto;

  @ApiProperty({ type: SmsNotificationsDto })
  smsNotifications: SmsNotificationsDto;

  @ApiProperty({ type: PushNotificationsDto })
  pushNotifications: PushNotificationsDto;

  @ApiProperty({
    description: '通知频率',
    enum: ['immediate', 'hourly', 'daily', 'weekly'],
  })
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';

  @ApiProperty({ type: QuietHoursDto })
  quietHours: QuietHoursDto;
}

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional({ type: EmailNotificationsDto })
  emailNotifications?: Partial<EmailNotificationsDto>;

  @ApiPropertyOptional({ type: SmsNotificationsDto })
  smsNotifications?: Partial<SmsNotificationsDto>;

  @ApiPropertyOptional({ type: PushNotificationsDto })
  pushNotifications?: Partial<PushNotificationsDto>;

  @ApiPropertyOptional({
    description: '通知频率',
    enum: ['immediate', 'hourly', 'daily', 'weekly'],
  })
  notificationFrequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';

  @ApiPropertyOptional({ type: QuietHoursDto })
  quietHours?: Partial<QuietHoursDto>;
}
