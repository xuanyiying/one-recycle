import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaymentProvider } from './interfaces/payment-provider.interface';
import { WeChatPayProvider } from './providers/wechat-pay.provider';
import { AlipayProvider } from './providers/alipay.provider';
import { PaymentProvider } from '@prisma/client';
/**
 * 支付提供商工厂
 * 根据支付方式返回对应的支付提供商实例
 */
@Injectable()
export class PaymentProviderFactory {
  constructor(
    private readonly wechatPayProvider: WeChatPayProvider,
    private readonly alipayProvider: AlipayProvider,
  ) {}

  /**
   * 获取支付提供商实例
   * @param provider 支付方式
   */
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

  /**
   * 根据字符串获取支付提供商
   * 用于处理回调路由参数
   */
  getProviderByString(providerStr: string): IPaymentProvider {
    const provider = providerStr.toUpperCase() as PaymentProvider;

    if (!Object.values(PaymentProvider).includes(provider)) {
      throw new BadRequestException(`Invalid payment provider: ${providerStr}`);
    }

    return this.getProvider(provider);
  }
}
