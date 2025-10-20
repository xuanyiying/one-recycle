import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  httpPort: parseInt(process.env.HTTP_PORT || '3007', 10),
  grpcPort: parseInt(process.env.GRPC_PORT || '50057', 10),
  environment: process.env.NODE_ENV || 'development',
  globalPrefix: process.env.GLOBAL_PREFIX || 'api',
}));