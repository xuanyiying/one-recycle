import { QUEUE_NAMES } from '@/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PaymentConfigController } from './payment-config.controller';
import { PaymentConfigService } from './payment-config.service';
import { PaymentProviderModule } from './payment-provider.module';
import { PaymentTimeoutProcessor } from './payment-timeout.processor';
import { PaymentController } from './payment.controller';
import { PaymentGrpcController } from './payment.grpc.controller';
import { PaymentService } from './payment.service';
import { WithdrawalController } from './withdrawal.controller';
import WithdrawalService from './withdrawal.service';

@Module({
  imports: [
    PrismaModule,
    PaymentProviderModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.PAYMENT_TIMEOUT }),
  ],
  controllers: [
    PaymentController,
    PaymentGrpcController,
    WithdrawalController,
    PaymentConfigController,
  ],
  providers: [
    PaymentService,
    WithdrawalService,
    PaymentConfigService,
    PaymentTimeoutProcessor,
  ],
  exports: [PaymentService, WithdrawalService, PaymentConfigService],
})
export class PaymentModule {}
