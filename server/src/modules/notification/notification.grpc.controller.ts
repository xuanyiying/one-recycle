import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { NotificationService } from './notification/services/notification.service';
import {
  SendNotificationRequest,
  SendNotificationResponse,
  SendBatchRequest,
  SendBatchResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  GetTemplateRequest,
  TemplateResponse,
  ListTemplatesRequest,
  ListTemplatesResponse,
  CallbackStatusRequest,
  CallbackStatusResponse,
} from '../../proto/notification.pb';

@Controller()
export class NotificationGrpcController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod('NotificationService', 'SendNotification')
  async sendNotification(data: SendNotificationRequest): Promise<SendNotificationResponse> {
    const created = await this.notificationService.sendNotification({
      type: data.type as any,
      recipient: data.recipient as any,
      content: data.content.body,
    } as any);
    return { id: created.id, success: true };
  }

  @GrpcMethod('NotificationService', 'SendBatch')
  async sendBatch(data: SendBatchRequest): Promise<SendBatchResponse> {
    const res = await this.notificationService.sendBatch(data.type, data.notifications as any);
    return { successCount: res.successCount, failedCount: res.failedCount };
  }

  @GrpcMethod('NotificationService', 'CreateTemplate')
  async createTemplate(data: CreateTemplateRequest): Promise<TemplateResponse> {
    const t = await this.notificationService.createTemplate(data as any);
    return { id: t.id, name: t.name, type: String(t.type), subject: t.subject || '', content: t.content, variables: t.variables };
  }

  @GrpcMethod('NotificationService', 'UpdateTemplate')
  async updateTemplate(data: UpdateTemplateRequest): Promise<TemplateResponse> {
    const t = await this.notificationService.updateTemplate(data.id, data as any);
    return { id: t.id, name: t.name, type: String(t.type), subject: t.subject || '', content: t.content, variables: t.variables };
  }

  @GrpcMethod('NotificationService', 'GetTemplate')
  async getTemplate(data: GetTemplateRequest): Promise<TemplateResponse> {
    const t = await this.notificationService.findTemplateById(data.id);
    return { id: t.id, name: t.name, type: String(t.type), subject: t.subject || '', content: t.content, variables: t.variables };
  }

  @GrpcMethod('NotificationService', 'ListTemplates')
  async listTemplates(data: ListTemplatesRequest): Promise<ListTemplatesResponse> {
    const templates = await this.notificationService.findTemplates({ type: data.type } as any);
    return { templates: templates.map(t => ({ id: t.id, name: t.name, type: String(t.type), subject: t.subject || '', content: t.content, variables: t.variables })) };
  }

  @GrpcMethod('NotificationService', 'CallbackStatus')
  async callbackStatus(data: CallbackStatusRequest): Promise<CallbackStatusResponse> {
    // 简化：仅记录回调
    await this.notificationService.retryNotification(data.id);
    return { success: true };
  }
}
