import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3007', 10),
  grpcPort: parseInt(process.env.GRPC_PORT || '50007', 10),
  environment: process.env.NODE_ENV || 'development',
  globalPrefix: process.env.GLOBAL_PREFIX || 'api',
}));