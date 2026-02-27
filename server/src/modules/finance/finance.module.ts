import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { PrismaService } from '@/prisma/prisma.service';
import paymentConfig from '@/config/payment.config';

@Module({
  imports: [ConfigModule.forFeature(paymentConfig)],
  controllers: [FinanceController],
  providers: [FinanceService, PrismaService],
  exports: [FinanceService],
})
export class FinanceModule {}
