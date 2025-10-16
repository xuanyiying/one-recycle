import { ContactEntity, GoodsEntity, NotificationPriority } from '../entities/courier.entity';

export class CreatePickupNotificationDto {
  taskId: string;
  orderId: string;
  orderNo: string;
  courierId: string;
  waybillNo?: string;
  pickupCode?: string;
  scheduledPickupTime?: Date;
  senderInfo: ContactEntity;
  receiverInfo: ContactEntity;
  goodsInfo: GoodsEntity[];
  specialInstructions?: string;
  priority: NotificationPriority;
}