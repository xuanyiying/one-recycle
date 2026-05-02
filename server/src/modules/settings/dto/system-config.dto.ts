import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SystemSettingsDto {
  @ApiProperty({ description: '站点名称' })
  siteName: string;

  @ApiProperty({ description: '站点描述' })
  siteDescription: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  logo?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  favicon?: string;

  @ApiProperty({ description: '时区' })
  timezone: string;

  @ApiProperty({ description: '语言' })
  language: string;

  @ApiProperty({ description: '货币' })
  currency: string;

  @ApiProperty({ description: '日期格式' })
  dateFormat: string;

  @ApiProperty({ description: '时间格式' })
  timeFormat: string;

  @ApiProperty({ description: '维护模式' })
  maintenanceMode: boolean;

  @ApiPropertyOptional({ description: '维护消息' })
  maintenanceMessage?: string;

  @ApiProperty({ description: '最大文件大小(MB)' })
  maxFileSize: number;

  @ApiProperty({ description: '允许的文件类型', type: [String] })
  allowedFileTypes: string[];

  @ApiProperty({ description: '邮件启用' })
  emailEnabled: boolean;

  @ApiProperty({ description: '短信启用' })
  smsEnabled: boolean;

  @ApiProperty({ description: '备份启用' })
  backupEnabled: boolean;

  @ApiProperty({
    description: '备份频率',
    enum: ['daily', 'weekly', 'monthly'],
  })
  backupFrequency: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({
    description: '日志级别',
    enum: ['debug', 'info', 'warn', 'error'],
  })
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  @ApiProperty({ description: '会话超时(分钟)' })
  sessionTimeout: number;

  @ApiProperty({ description: '最大登录尝试次数' })
  maxLoginAttempts: number;

  @ApiProperty({ description: '锁定时长(分钟)' })
  lockoutDuration: number;
}

export class UpdateSystemSettingsDto {
  @ApiPropertyOptional({ description: '站点名称' })
  siteName?: string;

  @ApiPropertyOptional({ description: '站点描述' })
  siteDescription?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  logo?: string;

  @ApiPropertyOptional({ description: 'Favicon URL' })
  favicon?: string;

  @ApiPropertyOptional({ description: '时区' })
  timezone?: string;

  @ApiPropertyOptional({ description: '语言' })
  language?: string;

  @ApiPropertyOptional({ description: '货币' })
  currency?: string;

  @ApiPropertyOptional({ description: '日期格式' })
  dateFormat?: string;

  @ApiPropertyOptional({ description: '时间格式' })
  timeFormat?: string;

  @ApiPropertyOptional({ description: '维护模式' })
  maintenanceMode?: boolean;

  @ApiPropertyOptional({ description: '维护消息' })
  maintenanceMessage?: string;

  @ApiPropertyOptional({ description: '最大文件大小(MB)' })
  maxFileSize?: number;

  @ApiPropertyOptional({ description: '允许的文件类型', type: [String] })
  allowedFileTypes?: string[];

  @ApiPropertyOptional({ description: '邮件启用' })
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: '短信启用' })
  smsEnabled?: boolean;

  @ApiPropertyOptional({ description: '备份启用' })
  backupEnabled?: boolean;

  @ApiPropertyOptional({
    description: '备份频率',
    enum: ['daily', 'weekly', 'monthly'],
  })
  backupFrequency?: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({
    description: '日志级别',
    enum: ['debug', 'info', 'warn', 'error'],
  })
  logLevel?: 'debug' | 'info' | 'warn' | 'error';

  @ApiPropertyOptional({ description: '会话超时(分钟)' })
  sessionTimeout?: number;

  @ApiPropertyOptional({ description: '最大登录尝试次数' })
  maxLoginAttempts?: number;

  @ApiPropertyOptional({ description: '锁定时长(分钟)' })
  lockoutDuration?: number;
}
