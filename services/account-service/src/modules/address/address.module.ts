import { Module } from '@nestjs/common';
import { AddressService } from './services/address.service';
import { AddressController } from './controllers/address.controller';
import { AddressGrpcController } from './controllers/address.grpc.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AddressController, AddressGrpcController],
  providers: [AddressService, PrismaService],
  exports: [AddressService],
})
export class AddressModule { }