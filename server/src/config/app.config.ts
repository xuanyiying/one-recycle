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
    corsOrigins: process.env.CORS_ORIGINS?.split(',').map((origin) =>
      origin.trim(),
    ) || [
      // Default origins based on environment
      ...(process.env.NODE_ENV === 'production'
        ? [
            'https://backbuy.cn',
            'https://www.backbuy.cn',
            'https://admin.backbuy.cn',
            'https://api.backbuy.cn',
          ]
        : [
            // Development environments
            'http://localhost:3000',
            'http://localhost:3005',
            'http://localhost:3008',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3005',
            'http://127.0.0.1:3008',
          ]),
    ],
  }),
);
