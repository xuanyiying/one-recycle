/**
 * 微服务入口 - 根据 SERVICE_NAME 环境变量启动不同的微服务
 *
 * 支持的服务:
 * - api-gateway: API 网关 (HTTP), 路由请求到各微服务
 * - account-service: 账户服务 (gRPC), 用户/地址/账户
 * - order-service: 订单服务 (gRPC), 订单/支付/物流
 * - notification-service: 通知服务 (gRPC), 短信/邮件/推送
 * - inventory-service: 库存服务 (gRPC), 库存/仓储
 * - category-service: 分类服务 (gRPC), 分类/定价
 *
 * 默认(不设置 SERVICE_NAME): 单体模式, 启动所有模块
 */

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

// BigInt 序列化
BigInt.prototype.toJSON = function () {
  return this.toString();
};

type ServiceConfig = {
  module: any;
  transport: 'http' | 'grpc';
  grpcPackage?: string;
  protoPath?: string;
};

const SERVICE_REGISTRY: Record<string, ServiceConfig> = {
  'account-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'account',
    protoPath: 'proto/account.proto',
  },
  'order-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'order',
    protoPath: 'proto/order.proto',
  },
  'notification-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'notification',
    protoPath: 'proto/notification.proto',
  },
  'inventory-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'inventory',
    protoPath: 'proto/inventory.proto',
  },
  'category-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'category',
    protoPath: 'proto/category.proto',
  },
  'user-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'user',
    protoPath: 'proto/user.proto',
  },
  'dispatch-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'dispatch',
    protoPath: 'proto/dispatch.proto',
  },
  'payment-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'payment',
    protoPath: 'proto/payment.proto',
  },
  'queue-service': {
    module: AppModule,
    transport: 'grpc',
    grpcPackage: 'queue',
    protoPath: 'proto/queue.proto',
  },
};

async function bootstrapGateway() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('ApiGateway');
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // CORS
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [];
  const normalizedOrigins = corsOrigins.map((o) => o.trim()).filter(Boolean);
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      if (normalizedOrigins.includes(origin)) return callback(null, true);
      if (isDev && localhostPattern.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-Request-ID',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Request-ID'],
    credentials: true,
    maxAge: 3600,
    optionsSuccessStatus: 204,
  });

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('OneRecycle API')
    .setDescription('OneRecycle 多平台旧物回收 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('auth', '认证相关接口')
    .addTag('users', '用户管理接口')
    .addTag('orders', '订单管理接口')
    .addTag('categories', '分类管理接口')
    .addTag('payments', '支付相关接口')
    .addTag('addresses', '地址管理接口')
    .addTag('health', '健康检查接口')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;
  await app.listen(port);
  logger.log(`API Gateway running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

async function bootstrapGrpcService(
  serviceName: string,
  config: ServiceConfig,
) {
  const logger = new Logger(serviceName);
  const grpcPort = process.env.PORT ? parseInt(process.env.PORT) : 50051;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    config.module,
    {
      transport: Transport.GRPC,
      options: {
        package: config.grpcPackage!,
        protoPath: join(__dirname, config.protoPath!),
        url: `0.0.0.0:${grpcPort}`,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen();
  logger.log(
    `gRPC service running on: 0.0.0.0:${grpcPort} (package: ${config.grpcPackage})`,
  );
}

async function bootstrapMonolith() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Monolith');
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // CORS (same as gateway)
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [];
  const normalizedOrigins = corsOrigins.map((o) => o.trim()).filter(Boolean);
  const isDev = (process.env.NODE_ENV || 'development') === 'development';
  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      if (normalizedOrigins.includes(origin)) return callback(null, true);
      if (isDev && localhostPattern.test(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
    maxAge: 3600,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  const config = new DocumentBuilder()
    .setTitle('OneRecycle API')
    .setDescription('OneRecycle API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
  logger.log(`Monolith running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

async function bootstrap() {
  const serviceName = process.env.SERVICE_NAME;

  if (!serviceName) {
    // 单体模式 - 开发/小规模部署
    await bootstrapMonolith();
    return;
  }

  if (serviceName === 'api-gateway') {
    await bootstrapGateway();
    return;
  }

  const serviceConfig = SERVICE_REGISTRY[serviceName];
  if (!serviceConfig) {
    throw new Error(
      `Unknown SERVICE_NAME: ${serviceName}. Available: api-gateway, ${Object.keys(SERVICE_REGISTRY).join(', ')}`,
    );
  }

  await bootstrapGrpcService(serviceName, serviceConfig);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
