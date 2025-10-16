import { SendNotificationDto } from './send-notification.dto';

export class SendBatchNotificationDto {
  batchName: string;
  description?: string;
  notifications: SendNotificationDto[];
}