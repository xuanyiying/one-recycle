import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressGrpcController } from './address.grpc.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@/common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AddressController, AddressGrpcController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
