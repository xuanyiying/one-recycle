import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3004', 10),
  grpcPort: parseInt(process.env.GRPC_PORT || '50054', 10),
  environment: process.env.NODE_ENV || 'development',
  globalPrefix: 'api',
}));