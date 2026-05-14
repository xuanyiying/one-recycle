import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { SendBatchNotificationDto } from '../dto/send-batch-notification.dto';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';
import {
  NotificationEntity,
  NotificationTemplateEntity,
  NotificationBatchEntity,
  NotificationStatsEntity,
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  TemplateType,
} from '../entities/notification.entity';
import {
  NotificationFilters,
  TemplateFilters,
  BatchFilters,
  NotificationProvider,
} from '../interfaces/notification.interface';

@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendNotification(
    @Body() sendNotificationDto: SendNotificationDto,
  ): Promise<NotificationEntity> {
    this.logger.log(`Sending notification: ${sendNotificationDto.type}`);

    // 转换DTO到service数据格式
    const notificationData = {
      type: sendNotificationDto.type,
      recipient: {
        userId: sendNotificationDto.recipient.userId,
        phoneNumber: sendNotificationDto.recipient.phoneNumber,
        email: sendNotificationDto.recipient.email,
        deviceToken: sendNotificationDto.recipient.deviceToken,
        webhookUrl: sendNotificationDto.recipient.webhookUrl,
        name: sendNotificationDto.recipient.name,
      },
      content: {
        title: sendNotificationDto.content.title,
        body: sendNotificationDto.content.body,
        data: sendNotificationDto.content.data,
        imageUrl: sendNotificationDto.content.imageUrl,
        actionUrl: sendNotificationDto.content.actionUrl,
        templateId: sendNotificationDto.content.templateId,
        templateData: sendNotificationDto.content.templateData,
      },
      priority: sendNotificationDto.priority,
      deliveryOptions: sendNotificationDto.deliveryOptions
        ? {
            retryCount: sendNotificationDto.deliveryOptions.retryCount,
            maxRetries: sendNotificationDto.deliveryOptions.maxRetries,
            retryDelay: sendNotificationDto.deliveryOptions.retryDelay,
            expiresAt: sendNotificationDto.deliveryOptions.expiresAt
              ? new Date(sendNotificationDto.deliveryOptions.expiresAt)
              : undefined,
            scheduleAt: sendNotificationDto.deliveryOptions.scheduleAt
              ? new Date(sendNotificationDto.deliveryOptions.scheduleAt)
              : undefined,
            batchId: sendNotificationDto.deliveryOptions.batchId,
          }
        : undefined,
    };

    return this.notificationService.sendNotification(notificationData);
  }

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  async sendBatchNotifications(
    @Body() sendBatchDto: SendBatchNotificationDto,
  ): Promise<NotificationBatchEntity> {
    this.logger.log(`Sending batch notifications: ${sendBatchDto.batchName}`);

    // 转换DTO到service数据格式
    const batchData = {
      batchName: sendBatchDto.batchName,
      description: sendBatchDto.description,
      notifications: sendBatchDto.notifications.map((dto) => ({
        type: dto.type,
        recipient: {
          userId: dto.recipient.userId,
          phoneNumber: dto.recipient.phoneNumber,
          email: dto.recipient.email,
          deviceToken: dto.recipient.deviceToken,
          webhookUrl: dto.recipient.webhookUrl,
          name: dto.recipient.name,
        },
        content: {
          title: dto.content.title,
          body: dto.content.body,
          data: dto.content.data,
          imageUrl: dto.content.imageUrl,
          actionUrl: dto.content.actionUrl,
          templateId: dto.content.templateId,
          templateData: dto.content.templateData,
        },
        priority: dto.priority,
        deliveryOptions: dto.deliveryOptions
          ? {
              retryCount: dto.deliveryOptions.retryCount,
              maxRetries: dto.deliveryOptions.maxRetries,
              retryDelay: dto.deliveryOptions.retryDelay,
              expiresAt: dto.deliveryOptions.expiresAt
                ? new Date(dto.deliveryOptions.expiresAt)
                : undefined,
              scheduleAt: dto.deliveryOptions.scheduleAt
                ? new Date(dto.deliveryOptions.scheduleAt)
                : undefined,
              batchId: dto.deliveryOptions.batchId,
            }
          : undefined,
      })),
    };

    return this.notificationService.sendBatchNotifications(batchData);
  }

  @Get()
  async findNotifications(
    @Query('type') type?: NotificationType,
    @Query('status') status?: NotificationStatus,
    @Query('priority') priority?: NotificationPriority,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('batchId') batchId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<{
    data: NotificationEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const filters: NotificationFilters = {
      type,
      status,
      priority,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      batchId,
    };

    const allNotifications =
      await this.notificationService.findNotifications(filters);

    // 分页处理
    const total = allNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allNotifications.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  @Get(':id')
  async findNotificationById(
    @Param('id') id: string,
  ): Promise<NotificationEntity> {
    return this.notificationService.findNotificationById(id);
  }

  @Put(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body() data: any,
  ): Promise<NotificationEntity> {
    this.logger.log(`Updating notification: ${id}`);
    return this.notificationService.updateNotification(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    this.logger.log(`Deleting notification: ${id}`);
    return this.notificationService.deleteNotification(id);
  }

  @Get(':id/history')
  async getNotificationHistory(@Param('id') id: string): Promise<any[]> {
    this.logger.log(`Getting notification history: ${id}`);
    return this.notificationService.getNotificationHistory(id);
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  async retryNotification(
    @Param('id') id: string,
  ): Promise<NotificationEntity> {
    this.logger.log(`Retrying notification: ${id}`);
    return this.notificationService.retryNotification(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelNotification(
    @Param('id') id: string,
  ): Promise<NotificationEntity> {
    this.logger.log(`Cancelling notification: ${id}`);
    return this.notificationService.cancelNotification(id);
  }

  @Post('batch-send')
  @HttpCode(HttpStatus.CREATED)
  async batchSendNotifications(@Body() data: any): Promise<any> {
    this.logger.log(`Batch sending notifications`);
    return this.notificationService.batchSendNotifications(data);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.OK)
  async deleteBatchNotifications(
    @Body() body: { ids: string[] },
  ): Promise<{ success: boolean }> {
    this.logger.log(`Batch deleting notifications: ${body.ids.length} items`);
    return this.notificationService.deleteBatchNotifications(body.ids);
  }

  @Get('export')
  async exportNotifications(@Query() query: any): Promise<any[]> {
    this.logger.log(`Exporting notifications`);
    const filters: NotificationFilters = {
      type: query.type,
      status: query.status,
      priority: query.priority,
      userId: query.userId,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };
    return this.notificationService.findNotifications(filters);
  }

  @Post('upload-image')
  uploadImage(@Body() _data: { file: string }): { url: string } {
    this.logger.log(`Uploading notification image`);
    return { url: '' };
  }

  @Post('preview')
  previewNotification(@Body() _data: any): { html: string } {
    this.logger.log(`Previewing notification`);
    return { html: '' };
  }

  @Post('test-send')
  @HttpCode(HttpStatus.OK)
  async testSendNotification(@Body() data: any): Promise<void> {
    this.logger.log(`Test sending notification`);
    await this.notificationService.testSendNotification(data);
  }

  @Get('stats')
  async getNotificationStatsSimple(): Promise<NotificationStatsEntity> {
    return this.notificationService.getNotificationStats('7d');
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  async createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
  ): Promise<NotificationTemplateEntity> {
    this.logger.log(`Creating template: ${createTemplateDto.name}`);
    return this.notificationService.createTemplate(createTemplateDto);
  }

  @Get('templates')
  async findTemplates(
    @Query('type') type?: TemplateType,
    @Query('isActive') isActive?: boolean,
    @Query('name') name?: string,
  ): Promise<NotificationTemplateEntity[]> {
    const filters: TemplateFilters = {
      type,
      isActive: isActive !== undefined ? isActive === true : undefined,
      name,
    };

    return this.notificationService.findTemplates(filters);
  }

  @Get('templates/:id')
  async findTemplateById(
    @Param('id') id: string,
  ): Promise<NotificationTemplateEntity> {
    return this.notificationService.findTemplateById(id);
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ): Promise<NotificationTemplateEntity> {
    this.logger.log(`Updating template: ${id}`);
    return this.notificationService.updateTemplate(id, updateTemplateDto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.OK)
  async deleteTemplate(@Param('id') id: string): Promise<{ success: boolean }> {
    this.logger.log(`Deleting template: ${id}`);
    return this.notificationService.deleteTemplate(id);
  }

  @Post('templates/:id/validate')
  @HttpCode(HttpStatus.OK)
  async validateTemplate(
    @Param('id') id: string,
    @Body() data: Record<string, any>,
  ): Promise<{ isValid: boolean; errors?: string[] }> {
    return this.notificationService.validateTemplate(id, data);
  }

  @Post('templates/:id/render')
  @HttpCode(HttpStatus.OK)
  async renderTemplate(
    @Param('id') id: string,
    @Body() data: Record<string, any>,
  ): Promise<{ subject?: string; content: string }> {
    return this.notificationService.renderTemplate(id, data);
  }

  @Get('batches')
  async findBatches(
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<NotificationBatchEntity[]> {
    const filters: BatchFilters = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    return this.notificationService.findBatches(filters);
  }

  @Get('batches/:id')
  async findBatchById(
    @Param('id') id: string,
  ): Promise<NotificationBatchEntity> {
    return this.notificationService.findBatchById(id);
  }

  @Get('batches/:id/notifications')
  async getBatchNotifications(
    @Param('id') id: string,
  ): Promise<NotificationEntity[]> {
    return this.notificationService.getBatchNotifications(id);
  }

  @Get('stats/:period')
  async getNotificationStats(
    @Param('period') period: string,
  ): Promise<NotificationStatsEntity> {
    return this.notificationService.getNotificationStats(period);
  }

  @Get('reports/delivery')
  async getDeliveryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.notificationService.getDeliveryReport(start, end);
  }

  @Get('providers')
  async getProviders(): Promise<NotificationProvider[]> {
    return this.notificationService.getProviders();
  }

  @Put('providers/:name/config')
  async updateProviderConfig(
    @Param('name') name: string,
    @Body() config: Record<string, any>,
  ): Promise<NotificationProvider> {
    this.logger.log(`Updating provider config: ${name}`);
    return this.notificationService.updateProviderConfig(name, config);
  }
  // 健康检查端点
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    providers: any;
  }> {
    const providers = await this.notificationService.getProviders();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      providers: providers.map((p) => ({
        name: p.name,
        type: p.type,
        enabled: p.isEnabled,
      })),
    };
  }
}
