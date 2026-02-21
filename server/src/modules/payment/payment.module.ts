import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentGrpcController } from './payment.grpc.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PaymentService } from './payment.service';
import { PaymentLogRepository } from './payment-log.repository';
import { PaymentProviderModule } from './payment-provider.module';
import WithdrawalService from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';

@Module({
  imports: [PrismaModule, PaymentProviderModule],
  controllers: [PaymentController, PaymentGrpcController, WithdrawalController],
  providers: [PaymentService, PaymentLogRepository, WithdrawalService],
  exports: [PaymentService, WithdrawalService],
})
export class PaymentModule {}
