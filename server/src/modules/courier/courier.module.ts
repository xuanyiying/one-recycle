import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { CourierService } from './courier.service';
import { CourierController } from './courier.controller';
import { RedisModule } from '@/common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [CourierController],
  providers: [CourierService],
  exports: [CourierService],
})
export class CourierModule {}
