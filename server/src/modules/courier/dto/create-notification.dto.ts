import { IsString, IsOptional } from 'class-validator';

export class CreatePickupNotificationDto {
  @IsString()
  courierId: string;

  @IsString()
  taskId: string;

  @IsString()
  orderId: string;

  @IsString()
  orderNo: string;

  @IsOptional()
  waybillNo?: string;

  @IsOptional()
  pickupCode?: string;

  senderInfo: { latitude?: number; longitude?: number; address: string };
  receiverInfo: { latitude?: number; longitude?: number; address: string };

  @IsOptional()
  priority?: string;
}
