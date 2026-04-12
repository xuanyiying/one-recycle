import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { DispatchController } from './dispatch.controller';
import { DispatchGrpcController } from './dispatch.grpc.controller';
import { DispatchService } from './dispatch.service';
import { OrderModule } from '../order/order.module';
import { CourierModule } from '../courier/courier.module';
import { RedisModule } from '@/common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule, OrderModule, CourierModule],
  controllers: [DispatchController, DispatchGrpcController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
