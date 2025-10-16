import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AccountModule } from '../account/account.module';
import { PaymentProviderModule } from '../payment-provider';
import { MessageQueueClient } from '../common/message-queue.client';

@Module({
  imports: [AccountModule, PaymentProviderModule],
  controllers: [WithdrawalController],
  providers: [WithdrawalService, PrismaService, MessageQueueClient],
  exports: [WithdrawalService],
})
export class WithdrawalModule {}
