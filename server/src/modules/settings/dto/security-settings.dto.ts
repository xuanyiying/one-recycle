import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SessionManagementDto {
  @ApiProperty({ description: '最大会话数' })
  maxSessions: number;

  @ApiProperty({ description: '会话超时时间(分钟)' })
  sessionTimeout: number;

  @ApiProperty({ description: '记住我时长(天)' })
  rememberMeDuration: number;
}

export class PasswordPolicyDto {
  @ApiProperty({ description: '最小长度' })
  minLength: number;

  @ApiProperty({ description: '需要大写字母' })
  requireUppercase: boolean;

  @ApiProperty({ description: '需要小写字母' })
  requireLowercase: boolean;

  @ApiProperty({ description: '需要数字' })
  requireNumbers: boolean;

  @ApiProperty({ description: '需要特殊字符' })
  requireSpecialChars: boolean;

  @ApiProperty({ description: '密码过期时间(天, 0表示永不过期)' })
  passwordExpiry: number;
}

export class ApiRateLimitDto {
  @ApiProperty({ description: '是否启用' })
  enabled: boolean;

  @ApiProperty({ description: '每分钟请求数' })
  requestsPerMinute: number;

  @ApiProperty({ description: '突发限制' })
  burstLimit: number;
}

export class SecuritySettingsDto {
  @ApiProperty({ description: '是否启用双因素认证' })
  twoFactorEnabled: boolean;

  @ApiProperty({ description: '登录通知' })
  loginNotifications: boolean;

  @ApiProperty({ description: '最大登录尝试次数' })
  maxLoginAttempts: number;

  @ApiProperty({ description: '锁定时长(分钟)' })
  lockoutDuration: number;

  @ApiProperty({ type: SessionManagementDto })
  sessionManagement: SessionManagementDto;

  @ApiProperty({ type: PasswordPolicyDto })
  passwordPolicy: PasswordPolicyDto;

  @ApiProperty({ description: 'IP白名单', type: [String] })
  ipWhitelist: string[];

  @ApiProperty({ type: ApiRateLimitDto })
  apiRateLimit: ApiRateLimitDto;
}

export class UpdateSecuritySettingsDto {
  @ApiPropertyOptional({ description: '是否启用双因素认证' })
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ description: '登录通知' })
  loginNotifications?: boolean;

  @ApiPropertyOptional({ description: '最大登录尝试次数' })
  maxLoginAttempts?: number;

  @ApiPropertyOptional({ description: '锁定时长(分钟)' })
  lockoutDuration?: number;

  @ApiPropertyOptional({ type: SessionManagementDto })
  sessionManagement?: Partial<SessionManagementDto>;

  @ApiPropertyOptional({ type: PasswordPolicyDto })
  passwordPolicy?: Partial<PasswordPolicyDto>;

  @ApiPropertyOptional({ description: 'IP白名单', type: [String] })
  ipWhitelist?: string[];

  @ApiPropertyOptional({ type: ApiRateLimitDto })
  apiRateLimit?: Partial<ApiRateLimitDto>;
}
