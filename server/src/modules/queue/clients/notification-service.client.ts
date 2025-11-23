import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationServiceClient {
  async sendNotification(data: any): Promise<void> {
    // 在单体应用中，这将直接调用NotificationService
    console.log(`Sending notification:`, data);
  }
}