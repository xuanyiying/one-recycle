import { registerAs } from '@nestjs/config';

export const paymentConfig = registerAs('payment', () => ({
  // Alipay configuration
  alipay: {
    appId: process.env.ALIPAY_APP_ID || '',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    signType: process.env.ALIPAY_SIGN_TYPE || 'RSA2',
    charset: process.env.ALIPAY_CHARSET || 'utf-8',
    version: process.env.ALIPAY_VERSION || '1.0',
    format: process.env.ALIPAY_FORMAT || 'JSON',
    sandbox: process.env.ALIPAY_SANDBOX === 'true',
  },
  
  // WeChat Pay configuration
  wechatPay: {
    appId: process.env.WECHAT_APP_ID || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    apiKey: process.env.WECHAT_API_KEY || '',
    certPath: process.env.WECHAT_CERT_PATH || '',
    keyPath: process.env.WECHAT_KEY_PATH || '',
    sandbox: process.env.WECHAT_SANDBOX === 'true',
  },
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publicKey: process.env.STRIPE_PUBLIC_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    apiVersion: process.env.STRIPE_API_VERSION || '2023-10-16',
  },
  
  // PayPal configuration
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    sandbox: process.env.PAYPAL_SANDBOX === 'true',
  },
  
  // General payment settings
  general: {
    defaultCurrency: process.env.DEFAULT_CURRENCY || 'CNY',
    timeout: parseInt(process.env.PAYMENT_TIMEOUT || '300000', 10), // 5 minutes
    retryAttempts: parseInt(process.env.PAYMENT_RETRY_ATTEMPTS || '3', 10),
    webhookRetryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || '5', 10),
  },
}));