import { registerAs } from '@nestjs/config';

export interface PaymentConfig {
  mockPayBaseUrl: string;
  alipayGatewayUrl: string;
  wechatPayGatewayUrl: string;
  callbackBaseUrl: string;
}

export default registerAs(
  'payment',
  (): PaymentConfig => ({
    mockPayBaseUrl: process.env.MOCK_PAY_URL || 'https://mock-pay.com/pay',
    alipayGatewayUrl:
      process.env.ALIPAY_GATEWAY_URL || 'https://openapi.alipay.com/gateway.do',
    wechatPayGatewayUrl:
      process.env.WECHAT_PAY_GATEWAY_URL || 'https://api.mch.weixin.qq.com',
    callbackBaseUrl:
      process.env.PAYMENT_CALLBACK_URL || 'http://localhost:3001',
  }),
);
