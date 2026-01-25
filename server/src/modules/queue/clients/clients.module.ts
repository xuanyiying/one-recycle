import { Module, Global } from '@nestjs/common';
import { OrderServiceClient } from './order-service.client';
import { DispatchServiceClient } from './dispatch-service.client';
import { InventoryServiceClient } from './inventory-service.client';
import { PaymentServiceClient } from './payment-service.client';
import { NotificationServiceClient } from './notification-service.client';

@Global()
@Module({
  providers: [
    OrderServiceClient,
    DispatchServiceClient,
    InventoryServiceClient,
    PaymentServiceClient,
    NotificationServiceClient,
  ],
  exports: [
    OrderServiceClient,
    DispatchServiceClient,
    InventoryServiceClient,
    PaymentServiceClient,
    NotificationServiceClient,
  ],
})
export class ClientsModule {}
