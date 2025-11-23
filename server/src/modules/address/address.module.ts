import { Module } from '@nestjs/common';
import { AddressService } from './services/address.service';
import { AddressController } from './controllers/address.controller';
import { AddressGrpcController } from './controllers/address.grpc.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AddressController, AddressGrpcController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule { }