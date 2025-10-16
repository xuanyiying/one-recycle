import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeChatPayProvider } from './providers/wechat-pay.provider';
import { AlipayProvider } from './providers/alipay.provider';
import { PaymentProviderFactory } from './payment-provider.factory';

@Module({
  imports: [ConfigModule],
  providers: [WeChatPayProvider, AlipayProvider, PaymentProviderFactory],
  exports: [PaymentProviderFactory],
})
export class PaymentProviderModule {}
