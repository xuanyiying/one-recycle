import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import {
  SystemSettingsDto,
  UpdateSystemSettingsDto,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
  SecuritySettingsDto,
  UpdateSecuritySettingsDto,
} from './dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('system')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取系统设置' })
  @ApiResponse({ status: 200, type: SystemSettingsDto })
  async getSystemSettings(): Promise<SystemSettingsDto> {
    return this.settingsService.getSystemSettings();
  }

  @Put('system')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新系统设置' })
  @ApiResponse({ status: 200, type: SystemSettingsDto })
  async updateSystemSettings(
    @Body() data: UpdateSystemSettingsDto,
  ): Promise<SystemSettingsDto> {
    return this.settingsService.updateSystemSettings(data);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取通知设置' })
  @ApiResponse({ status: 200, type: NotificationSettingsDto })
  async getNotificationSettings(): Promise<NotificationSettingsDto> {
    return this.settingsService.getNotificationSettings();
  }

  @Put('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新通知设置' })
  @ApiResponse({ status: 200, type: NotificationSettingsDto })
  async updateNotificationSettings(
    @Body() data: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    return this.settingsService.updateNotificationSettings(data);
  }

  @Get('security')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取安全设置' })
  @ApiResponse({ status: 200, type: SecuritySettingsDto })
  async getSecuritySettings(): Promise<SecuritySettingsDto> {
    return this.settingsService.getSecuritySettings();
  }

  @Put('security')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '更新安全设置' })
  @ApiResponse({ status: 200, type: SecuritySettingsDto })
  async updateSecuritySettings(
    @Body() data: UpdateSecuritySettingsDto,
  ): Promise<SecuritySettingsDto> {
    return this.settingsService.updateSecuritySettings(data);
  }
}
