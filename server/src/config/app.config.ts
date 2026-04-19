import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  grpcPort: number;
  environment: string;
  logLevel: string;
  corsOrigins: string[];
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT || '3001', 10),
    grpcPort: parseInt(process.env.GRPC_PORT || '50051', 10),
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
      'https://backbuy.cn',
      'https://www.backbuy.cn',
      'https://admin.backbuy.cn',
      'https://api.backbuy.cn',
    ],
  }),
);
