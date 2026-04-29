import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  SystemSettingsDto,
  UpdateSystemSettingsDto,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
  SecuritySettingsDto,
  UpdateSecuritySettingsDto,
} from './dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemSettings(): Promise<SystemSettingsDto> {
    const configs = await this.prisma.systemConfig.findMany({
      where: { isActive: true },
    });

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      siteName: configMap['siteName'] || 'One Recycle',
      siteDescription: configMap['siteDescription'] || '回收平台',
      logo: configMap['logo'],
      favicon: configMap['favicon'],
      timezone: configMap['timezone'] || 'Asia/Shanghai',
      language: configMap['language'] || 'zh-CN',
      currency: configMap['currency'] || 'CNY',
      dateFormat: configMap['dateFormat'] || 'YYYY-MM-DD',
      timeFormat: configMap['timeFormat'] || 'HH:mm:ss',
      maintenanceMode: configMap['maintenanceMode'] === 'true',
      maintenanceMessage: configMap['maintenanceMessage'],
      maxFileSize: parseInt(configMap['maxFileSize'] || '10', 10),
      allowedFileTypes: configMap['allowedFileTypes']?.split(',') || [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'pdf',
        'doc',
        'docx',
      ],
      emailEnabled: configMap['emailEnabled'] === 'true',
      smsEnabled: configMap['smsEnabled'] === 'true',
      backupEnabled: configMap['backupEnabled'] === 'true',
      backupFrequency: (configMap['backupFrequency'] as 'daily' | 'weekly' | 'monthly') || 'daily',
      logLevel: (configMap['logLevel'] as 'debug' | 'info' | 'warn' | 'error') || 'info',
      sessionTimeout: parseInt(configMap['sessionTimeout'] || '30', 10),
      maxLoginAttempts: parseInt(configMap['maxLoginAttempts'] || '5', 10),
      lockoutDuration: parseInt(configMap['lockoutDuration'] || '15', 10),
    };
  }

  async updateSystemSettings(data: UpdateSystemSettingsDto): Promise<SystemSettingsDto> {
    const updates = Object.entries(data).map(([key, value]) => {
      const stringValue = Array.isArray(value) ? value.join(',') : String(value);
      return this.prisma.systemConfig.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue, description: key },
      });
    });

    await Promise.all(updates);
    return this.getSystemSettings();
  }

  async getNotificationSettings(): Promise<NotificationSettingsDto> {
    const configs = await this.prisma.systemConfig.findMany({
      where: { isActive: true },
    });

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      emailNotifications: {
        orderUpdates: configMap['email_orderUpdates'] === 'true',
        userRegistrations: configMap['email_userRegistrations'] === 'true',
        systemAlerts: configMap['email_systemAlerts'] === 'true',
        inventoryAlerts: configMap['email_inventoryAlerts'] === 'true',
        paymentNotifications: configMap['email_paymentNotifications'] === 'true',
        marketingEmails: configMap['email_marketingEmails'] === 'true',
      },
      smsNotifications: {
        orderUpdates: configMap['sms_orderUpdates'] === 'true',
        systemAlerts: configMap['sms_systemAlerts'] === 'true',
        securityAlerts: configMap['sms_securityAlerts'] === 'true',
        emergencyAlerts: configMap['sms_emergencyAlerts'] === 'true',
      },
      pushNotifications: {
        orderUpdates: configMap['push_orderUpdates'] === 'true',
        userActivities: configMap['push_userActivities'] === 'true',
        systemAlerts: configMap['push_systemAlerts'] === 'true',
        promotions: configMap['push_promotions'] === 'true',
      },
      notificationFrequency: (configMap['notificationFrequency'] as 'immediate' | 'hourly' | 'daily' | 'weekly') || 'immediate',
      quietHours: {
        enabled: configMap['quietHours_enabled'] === 'true',
        startTime: configMap['quietHours_startTime'] || '22:00',
        endTime: configMap['quietHours_endTime'] || '08:00',
      },
    };
  }

  async updateNotificationSettings(data: UpdateNotificationSettingsDto): Promise<NotificationSettingsDto> {
    const updates: Promise<any>[] = [];

    if (data.emailNotifications) {
      Object.entries(data.emailNotifications).forEach(([key, value]) => {
        updates.push(
          this.prisma.systemConfig.upsert({
            where: { key: `email_${key}` },
            update: { value: String(value) },
            create: { key: `email_${key}`, value: String(value), description: `Email notification: ${key}` },
          }),
        );
      });
    }

    if (data.smsNotifications) {
      Object.entries(data.smsNotifications).forEach(([key, value]) => {
        updates.push(
          this.prisma.systemConfig.upsert({
            where: { key: `sms_${key}` },
            update: { value: String(value) },
            create: { key: `sms_${key}`, value: String(value), description: `SMS notification: ${key}` },
          }),
        );
      });
    }

    if (data.pushNotifications) {
      Object.entries(data.pushNotifications).forEach(([key, value]) => {
        updates.push(
          this.prisma.systemConfig.upsert({
            where: { key: `push_${key}` },
            update: { value: String(value) },
            create: { key: `push_${key}`, value: String(value), description: `Push notification: ${key}` },
          }),
        );
      });
    }

    if (data.notificationFrequency) {
      updates.push(
        this.prisma.systemConfig.upsert({
          where: { key: 'notificationFrequency' },
          update: { value: data.notificationFrequency },
          create: { key: 'notificationFrequency', value: data.notificationFrequency, description: 'Notification frequency' },
        }),
      );
    }

    if (data.quietHours) {
      Object.entries(data.quietHours).forEach(([key, value]) => {
        updates.push(
          this.prisma.systemConfig.upsert({
            where: { key: `quietHours_${key}` },
            update: { value: String(value) },
            create: { key: `quietHours_${key}`, value: String(value), description: `Quiet hours: ${key}` },
          }),
        );
      });
    }

    await Promise.all(updates);
    return this.getNotificationSettings();
  }

  async getSecuritySettings(): Promise<SecuritySettingsDto> {
    const configs = await this.prisma.systemConfig.findMany({
      where: { isActive: true },
    });

    const configMap = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      twoFactorEnabled: configMap['twoFactorEnabled'] === 'true',
      loginNotifications: configMap['loginNotifications'] === 'true',
      maxLoginAttempts: parseInt(configMap['maxLoginAttempts'] || '5', 10),
      lockoutDuration: parseInt(configMap['lockoutDuration'] || '15', 10),
      sessionManagement: {
        maxSessions: parseInt(configMap['session_maxSessions'] || '5', 10),
        sessionTimeout: parseInt(configMap['session_sessionTimeout'] || '30', 10),
        rememberMeDuration: parseInt(configMap['session_rememberMeDuration'] || '7', 10),
      },
      passwordPolicy: {
        minLength: parseInt(configMap['password_minLength'] || '8', 10),
        requireUppercase: configMap['password_requireUppercase'] === 'true',
        requireLowercase: configMap['password_requireLowercase'] === 'true',
        requireNumbers: configMap['password_requireNumbers'] === 'true',
        requireSpecialChars: configMap['password_requireSpecialChars'] === 'true',
        passwordExpiry: parseInt(configMap['password_passwordExpiry'] || '0', 10),
      },
      ipWhitelist: configMap['ipWhitelist']?.split(',').filter(Boolean) || [],
      apiRateLimit: {
        enabled: configMap['apiRateLimit_enabled'] === 'true',
        requestsPerMinute: parseInt(configMap['apiRateLimit_requestsPerMinute'] || '100', 10),
        burstLimit: parseInt(configMap['apiRateLimit_burstLimit'] || '20', 10),
      },
    };
  }

  async updateSecuritySettings(data: UpdateSecuritySettingsDto): Promise<SecuritySettingsDto> {
    const updates: Promise<any>[] = [];

    if (data.twoFactorEnabled !== undefined) {
      updates.push(
        this.prisma.systemConfig.upsert({
          where: { key: 'twoFactorEnabled' },
          update: { value: String(data.twoFactorEnabled) },
          create: { key: 'twoFactorEnabled', value: String(data.twoFactorEnabled), description: 'Two factor authentication enabled' },
        }),
      );
    }

    if (data.loginNotifications !== undefined) {
      updates.push(
        this.prisma.systemConfig.upsert({
          where: { key: 'loginNotifications' },
          update: { value: String(data.loginNotifications) },
          create: { key: 'loginNotifications', value: String(data.loginNotifications), description: 'Login notifications' },
        }),
      );
    }

    if (data.maxLoginAttempts !== undefined) {
      updates.push(
        this.prisma.systemConfig.upsert({
          where: { key: 'maxLoginAttempts' },
          update: { value: String(data.maxLoginAttempts) },
          create: { key: 'maxLoginAttempts', value: String(data.maxLoginAttempts), description: 'Max login attempts' },
        }),
      );
    }

    if (data.lockoutDuration !== undefined) {
      updates.push(
        this.prisma.systemConfig.upsert({
          where: { key: 'lockoutDuration' },
          update: { value: String(data.lockoutDuration) },
          create: { key: 'lockoutDuration', value: String(data.lockoutDuration), description: 'Lockout duration' },
        }),
      );
    }

    if (data.sessionManagement) {
      Object.entries(data.sessionManagement).forEach(([key, value]) => {
        updates.push(
          this.prisma.systemConfig.upsert({
            where: { key: `session_${key}` },
            update: { value: String(value) },
            create: { key: `session_${key}`, value: String(value), description: `Session management: ${key}` },
          }),
        );
      });
    }

    if (data.passwordPolicy) {
      Object.entries(data.passwordPolicy).forEach(([key, value]) => {
        updates.push(
          this.prisma.systemConfig.upsert({
            where: { key: `password_${key}` },
            update: { value: String(value) },
            create: { key: `password_${key}`, value: String(value), description: `Password policy: ${key}` },
          }),
        );
      });
    }

    if (data.ipWhitelist !== undefined) {
      updates.push(
        this.prisma.systemConfig.upsert({
          where: { key: 'ipWhitelist' },
          update: { value: data.ipWhitelist.join(',') },
          create: { key: 'ipWhitelist', value: data.ipWhitelist.join(','), description: 'IP whitelist' },
        }),
      );
    }

    if (data.apiRateLimit) {
      Object.entries(data.apiRateLimit).forEach(([key, value]) => {
        updates.push(
          this.prisma.systemConfig.upsert({
            where: { key: `apiRateLimit_${key}` },
            update: { value: String(value) },
            create: { key: `apiRateLimit_${key}`, value: String(value), description: `API rate limit: ${key}` },
          }),
        );
      });
    }

    await Promise.all(updates);
    return this.getSecuritySettings();
  }
}
