import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentGrpcController } from './payment.grpc.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController, PaymentGrpcController],
  providers: [PaymentService, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule {}