import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  accessTokenExpiresInSeconds: number;
  sessionExpiresInSeconds: number;
  refreshTokenExpiresDays: number;
  codeExpiresMinutes: number;
  codeResendIntervalSeconds: number;
  maxCodeAttempts: number;
  smsServiceUrl: string;
  wechat: {
    appId: string;
    appSecret: string;
    apiUrl: string;
  };
  alipay: {
    appId: string;
    appSecret: string;
    privateKey: string;
    publicKey: string;
    apiUrl: string;
  };
  tiktok: {
    appId: string;
    appSecret: string;
    apiUrl: string;
  };
  kuaishou: {
    appId: string;
    appSecret: string;
    apiUrl: string;
  };
}

export default registerAs('auth', (): AuthConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = process.env.JWT_SECRET;

  if (isProduction && !jwtSecret) {
    console.error('[FATAL] JWT_SECRET must be set in production environment');
    process.exit(1);
  }

  return {
    jwtSecret: jwtSecret || 'dev-only-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    accessTokenExpiresInSeconds: parseInt(
      process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS || '7200',
      10,
    ),
    sessionExpiresInSeconds: parseInt(
      process.env.SESSION_EXPIRES_IN_SECONDS || '86400',
      10,
    ),
    refreshTokenExpiresDays: parseInt(
      process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30',
      10,
    ),
    codeExpiresMinutes: parseInt(process.env.CODE_EXPIRES_MINUTES || '5', 10),
    codeResendIntervalSeconds: parseInt(
      process.env.CODE_RESEND_INTERVAL_SECONDS || '60',
      10,
    ),
    maxCodeAttempts: parseInt(process.env.MAX_CODE_ATTEMPTS || '3', 10),
    smsServiceUrl:
      process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
    wechat: {
      appId: process.env.WECHAT_APP_ID || '',
      appSecret: process.env.WECHAT_APP_SECRET || '',
      apiUrl: 'https://api.weixin.qq.com/sns/jscode2session',
    },
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      appSecret: process.env.ALIPAY_APP_SECRET || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      apiUrl: 'https://openapi.alipay.com/gateway.do',
    },
    tiktok: {
      appId: process.env.DOUYIN_APP_ID || '',
      appSecret: process.env.DOUYIN_APP_SECRET || '',
      apiUrl: 'https://developer.toutiao.com/api/apps/v2/jscode2session',
    },
    kuaishou: {
      appId: process.env.KUAISHOU_APP_ID || '',
      appSecret: process.env.KUAISHOU_APP_SECRET || '',
      apiUrl: 'https://open.kuaishou.com/oauth2/mp/code2session',
    },
  };
});
