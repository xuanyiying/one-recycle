import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { AddressGrpcController } from './address.grpc.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AddressController, AddressGrpcController],
  providers: [AddressService, PrismaService],
  exports: [AddressService],
})
export class AddressModule {}