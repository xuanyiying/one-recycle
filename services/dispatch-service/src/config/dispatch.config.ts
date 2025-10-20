import { registerAs } from '@nestjs/config';

export const dispatchConfig = registerAs('dispatch', () => ({
  // 京东快递配置
  jdExpress: {
    appKey: process.env.JD_EXPRESS_APP_KEY || '',
    appSecret: process.env.JD_EXPRESS_APP_SECRET || '',
    apiUrl: process.env.JD_EXPRESS_API_URL || 'https://api.jd.com',
    timeout: parseInt(process.env.JD_EXPRESS_TIMEOUT || '30000', 10),
  },
  
  // 顺丰快递配置
  sfExpress: {
    appKey: process.env.SF_EXPRESS_APP_KEY || '',
    appSecret: process.env.SF_EXPRESS_APP_SECRET || '',
    apiUrl: process.env.SF_EXPRESS_API_URL || 'https://bsp-oisp.sf-express.com',
    timeout: parseInt(process.env.SF_EXPRESS_TIMEOUT || '30000', 10),
  },
  
  // 圆通快递配置
  ytoExpress: {
    appKey: process.env.YTO_EXPRESS_APP_KEY || '',
    appSecret: process.env.YTO_EXPRESS_APP_SECRET || '',
    apiUrl: process.env.YTO_EXPRESS_API_URL || 'https://open.yto.net.cn',
    timeout: parseInt(process.env.YTO_EXPRESS_TIMEOUT || '30000', 10),
  },
  
  // 通用配置
  defaultProvider: process.env.DEFAULT_DISPATCH_PROVIDER || 'jd',
  retryAttempts: parseInt(process.env.DISPATCH_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.DISPATCH_RETRY_DELAY || '1000', 10),
  trackingUpdateInterval: parseInt(process.env.TRACKING_UPDATE_INTERVAL || '3600000', 10), // 1小时
}));