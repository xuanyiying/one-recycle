import { apiClient } from './apiClient';
import { cacheService, CACHE_KEYS } from './cacheService';

// 个人资料接口
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

// 更新个人资料请求
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  position?: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 系统设置接口
export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maxFileSize: number; // MB
  allowedFileTypes: string[];
  emailEnabled: boolean;
  smsEnabled: boolean;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
}

// 更新系统设置请求
export interface UpdateSystemSettingsRequest {
  siteName?: string;
  siteDescription?: string;
  logo?: string;
  favicon?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  backupEnabled?: boolean;
  backupFrequency?: 'daily' | 'weekly' | 'monthly';
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  sessionTimeout?: number;
  maxLoginAttempts?: number;
  lockoutDuration?: number;
}

// 通知设置接口
export interface NotificationSettings {
  emailNotifications: {
    orderUpdates: boolean;
    userRegistrations: boolean;
    systemAlerts: boolean;
    inventoryAlerts: boolean;
    paymentNotifications: boolean;
    marketingEmails: boolean;
  };
  smsNotifications: {
    orderUpdates: boolean;
    systemAlerts: boolean;
    securityAlerts: boolean;
    emergencyAlerts: boolean;
  };
  pushNotifications: {
    orderUpdates: boolean;
    userActivities: boolean;
    systemAlerts: boolean;
    promotions: boolean;
  };
  notificationFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
}

// 更新通知设置请求
export interface UpdateNotificationSettingsRequest {
  emailNotifications?: Partial<NotificationSettings['emailNotifications']>;
  smsNotifications?: Partial<NotificationSettings['smsNotifications']>;
  pushNotifications?: Partial<NotificationSettings['pushNotifications']>;
  notificationFrequency?: NotificationSettings['notificationFrequency'];
  quietHours?: Partial<NotificationSettings['quietHours']>;
}

// 安全设置接口
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sessionManagement: {
    maxSessions: number;
    sessionTimeout: number;
    rememberMeDuration: number; // days
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number; // days, 0 = never
  };
  ipWhitelist: string[];
  apiRateLimit: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
}

// 更新安全设置请求
export interface UpdateSecuritySettingsRequest {
  twoFactorEnabled?: boolean;
  loginNotifications?: boolean;
  maxLoginAttempts?: number;
  lockoutDuration?: number;
  sessionManagement?: Partial<SecuritySettings['sessionManagement']>;
  passwordPolicy?: Partial<SecuritySettings['passwordPolicy']>;
  ipWhitelist?: string[];
  apiRateLimit?: Partial<SecuritySettings['apiRateLimit']>;
}

// 备份设置接口
export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string; // HH:mm
  retentionPeriod: number; // days
  backupLocation: 'local' | 'cloud' | 'both';
  cloudProvider?: 'aws' | 'gcp' | 'azure';
  encryptBackups: boolean;
  includeUploads: boolean;
  includeDatabase: boolean;
  includeLogs: boolean;
}

// 备份记录接口
export interface BackupRecord {
  id: string;
  filename: string;
  size: number; // bytes
  type: 'manual' | 'automatic';
  status: 'completed' | 'failed' | 'in_progress';
  createdAt: string;
  completedAt?: string;
  error?: string;
}

// 备份查询参数
export interface BackupQueryParams {
  page?: number;
  pageSize?: number;
  type?: 'manual' | 'automatic';
  status?: 'completed' | 'failed' | 'in_progress';
  startDate?: string;
  endDate?: string;
}

// 备份列表响应
export interface BackupListResponse {
  data: BackupRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 文件上传响应
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
}

class SettingsService {
  // 个人资料管理
  async getUserProfile(useCache: boolean = true): Promise<UserProfile> {
    if (useCache) {
      return cacheService.withCache(
        CACHE_KEYS.USER_PROFILE,
        () => this.fetchUserProfile(),
        5 * 60 * 1000, // 5分钟缓存
      );
    }
    return this.fetchUserProfile();
  }

  private async fetchUserProfile(): Promise<UserProfile> {
    const response: UserProfile = await apiClient.get('/profile');
    return response;
  }

  async updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response: UserProfile = await apiClient.put('/profile', data);
    // 清除用户资料缓存
    cacheService.delete(CACHE_KEYS.USER_PROFILE);
    return response;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/profile/change-password', data);
  }

  async uploadAvatar(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response: FileUploadResponse = await apiClient.post('/profile/avatar', formData);
    return response;
  }

  // 系统设置管理
  async getSystemSettings(useCache: boolean = true): Promise<SystemSettings> {
    if (useCache) {
      return cacheService.withCache(
        CACHE_KEYS.SYSTEM_SETTINGS,
        () => this.fetchSystemSettings(),
        10 * 60 * 1000, // 10分钟缓存
      );
    }
    return this.fetchSystemSettings();
  }

  private async fetchSystemSettings(): Promise<SystemSettings> {
    return await apiClient.get('/settings/system');
  }

  async updateSystemSettings(data: UpdateSystemSettingsRequest): Promise<SystemSettings> {
    const response: SystemSettings = await apiClient.put('/settings/system', data);
    // 清除系统设置缓存
    cacheService.delete(CACHE_KEYS.SYSTEM_SETTINGS);
    return response;
  }

  // 通知设置管理
  async getNotificationSettings(useCache: boolean = true): Promise<NotificationSettings> {
    if (useCache) {
      return cacheService.withCache(
        CACHE_KEYS.NOTIFICATION_SETTINGS,
        () => this.fetchNotificationSettings(),
        5 * 60 * 1000, // 5分钟缓存
      );
    }
    return this.fetchNotificationSettings();
  }

  private async fetchNotificationSettings(): Promise<NotificationSettings> {
    return await apiClient.get('/settings/notifications');
  }

  async updateNotificationSettings(
    data: UpdateNotificationSettingsRequest,
  ): Promise<NotificationSettings> {
    const response: NotificationSettings = await apiClient.put('/settings/notifications', data);
    // 清除通知设置缓存
    cacheService.delete(CACHE_KEYS.NOTIFICATION_SETTINGS);
    return response;
  }

  // 安全设置管理
  async getSecuritySettings(): Promise<SecuritySettings> {
    return await apiClient.get('/settings/security');
  }

  async updateSecuritySettings(data: UpdateSecuritySettingsRequest): Promise<SecuritySettings> {
    const response: SecuritySettings = await apiClient.put('/settings/security', data);
    return response;
  }

  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    const response: { qrCode: string; secret: string } = await apiClient.post(
      '/settings/security/2fa/enable',
    );
    return response;
  }

  async verifyTwoFactor(code: string): Promise<void> {
    await apiClient.post('/settings/security/2fa/verify', { code });
  }

  async disableTwoFactor(code: string): Promise<void> {
    await apiClient.post('/settings/security/2fa/disable', { code });
  }

  // 文件上传
  async uploadFile(file: File, type: 'logo' | 'favicon' | 'other'): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiClient.post('/upload', formData);
  }

  // 系统信息
  async getSystemInfo(): Promise<{
    version: string;
    environment: string;
    uptime: number;
    memoryUsage: number;
    diskUsage: number;
    cpuUsage: number;
  }> {
    return await apiClient.get('/system/info');
  }

  // 清理缓存
  async clearCache(): Promise<void> {
    await apiClient.post('/system/clear-cache');
  }

  // 重启系统
  async restartSystem(): Promise<void> {
    await apiClient.post('/system/restart');
  }
}

// 导出单例实例
export const settingsService = new SettingsService();
export default settingsService;
