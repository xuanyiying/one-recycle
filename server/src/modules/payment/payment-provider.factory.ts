import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';
import { IPaymentProvider } from './interfaces/payment-provider.interface';
import { PaymentConfigService } from './payment-config.service';
import { AlipayProvider } from './providers/alipay.provider';
import { WeChatPayProvider } from './providers/wechat-pay.provider';

@Injectable()
export class PaymentProviderFactory {
  private readonly logger = new Logger(PaymentProviderFactory.name);

  constructor(
    private readonly wechatPayProvider: WeChatPayProvider,
    private readonly alipayProvider: AlipayProvider,
    private readonly paymentConfigService: PaymentConfigService,
    private readonly configService: ConfigService,
  ) {}

  getProvider(provider: PaymentProvider): IPaymentProvider {
    switch (provider) {
      case PaymentProvider.WECHAT:
        return this.wechatPayProvider;

      case PaymentProvider.ALIPAY:
        return this.alipayProvider;

      default:
        throw new BadRequestException(
          `Unsupported payment provider: ${provider}`,
        );
    }
  }

  async getProviderWithDbConfig(
    provider: PaymentProvider,
  ): Promise<IPaymentProvider> {
    try {
      const dbConfig =
        await this.paymentConfigService.getActiveConfig(provider);
      this.logger.log(
        `Using database config for provider ${provider}: ${dbConfig.name}`,
      );

      if (provider === PaymentProvider.WECHAT) {
        return WeChatPayProvider.withConfig(
          {
            appId: dbConfig.appId ?? undefined,
            merchantId: dbConfig.merchantId ?? undefined,
            apiKey: dbConfig.appSecret ?? undefined,
            apiUrl: dbConfig.apiUrl ?? undefined,
            certPath: dbConfig.certPath ?? undefined,
            keyPath: dbConfig.keyPath ?? undefined,
            callbackUrl: dbConfig.callbackUrl ?? undefined,
          },
          this.configService,
        );
      } else if (provider === PaymentProvider.ALIPAY) {
        return AlipayProvider.withConfig(
          {
            appId: dbConfig.appId ?? undefined,
            privateKey: dbConfig.privateKey ?? undefined,
            alipayPublicKey: dbConfig.publicKey ?? undefined,
            apiUrl: dbConfig.apiUrl ?? undefined,
            callbackUrl: dbConfig.callbackUrl ?? undefined,
          },
          this.configService,
        );
      }
    } catch (error: any) {
      this.logger.warn(
        `No database config found for provider ${provider}, using environment variables: ${error.message}`,
      );
    }

    return this.getProvider(provider);
  }
}
