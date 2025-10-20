import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3003', 10),
  environment: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // gRPC 配置
  grpc: {
    port: parseInt(process.env.GRPC_PORT || '50003', 10),
    package: 'order',
    protoPath: 'proto/order.proto',
  },
  
  // Redis 配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // 外部服务配置
  services: {
    dispatch: {
      host: process.env.DISPATCH_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.DISPATCH_SERVICE_PORT || '50006', 10),
    },
    inventory: {
      host: process.env.INVENTORY_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.INVENTORY_SERVICE_PORT || '50005', 10),
    },
    payment: {
      host: process.env.PAYMENT_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.PAYMENT_SERVICE_PORT || '50004', 10),
    },
  },
  
  // 业务配置
  business: {
    orderNoLength: 20,
    defaultPageSize: 20,
    maxPageSize: 100,
    orderTimeout: {
      accept: 30 * 60 * 1000, // 30分钟
      pickup: 2 * 60 * 60 * 1000, // 2小时
      processing: 4 * 60 * 60 * 1000, // 4小时
    },
  },
}));