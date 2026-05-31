import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeChatPayProvider } from './providers/wechat-pay.provider';
import { AlipayProvider } from './providers/alipay.provider';
import { PaymentProviderFactory } from './payment-provider.factory';
import { PaymentConfigService } from './payment-config.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    WeChatPayProvider,
    AlipayProvider,
    PaymentProviderFactory,
    PaymentConfigService,
  ],
  exports: [PaymentProviderFactory, PaymentConfigService],
})
export class PaymentProviderModule {}
