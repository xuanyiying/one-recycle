import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { TimeSlotController } from './time-slot.controller';
import { OrderGrpcController } from './order.grpc.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { InventoryModule } from '../inventory/inventory.module';
import { AccountModule } from '../account/account.module';
import { PaymentModule } from '../payment/payment.module';
import { CategoryWarehouseModule } from '../category-warehouse/category-warehouse.module';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    forwardRef(() => QueueModule),
    InventoryModule,
    AccountModule,
    PaymentModule,
    CategoryWarehouseModule,
  ],
  controllers: [OrderController, TimeSlotController, OrderGrpcController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
