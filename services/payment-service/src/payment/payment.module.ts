import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentGrpcController } from './payment.grpc.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentLogRepository } from './payment-log.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentController, PaymentGrpcController],
  providers: [PaymentService, PrismaService, PaymentLogRepository],
  exports: [PaymentService],
})
export class PaymentModule {}