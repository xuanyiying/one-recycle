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
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:8081', // React Native / Expo default
    ],
  }),
);
