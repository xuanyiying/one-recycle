import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { TimeSlotController } from './time-slot.controller';
import { OrderGrpcController } from './order.grpc.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [HttpModule, PrismaModule, forwardRef(() => QueueModule)],
  controllers: [OrderController, TimeSlotController, OrderGrpcController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
