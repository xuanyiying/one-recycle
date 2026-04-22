import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

/**
 * OneRecycle 主应用入口
 *
 * 一站式旧物回收平台后端服务，提供：
 * - 用户认证与授权
 * - 订单管理与状态流转
 * - 支付与结算处理
 * - 库存与仓储管理
 * - 通知与消息推送
 * - AI 智能分类
 */

// 解决 BigInt 序列化问题 - BigInt转为字符串以便JSON传输
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * 应用启动引导函数
 * 初始化NestJS应用并配置中间件、管道、过滤器等
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);

  // 安全头中间件 - Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );

  // 全局路由前缀 - 所有API添加/api前缀
  app.setGlobalPrefix('api');

  // CORS配置 - 允许跨域请求
  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [];
  const normalizedOrigins = corsOrigins
    .map((origin) => origin.trim())
    .filter(Boolean);
  const isDevelopment =
    (process.env.NODE_ENV || 'development') === 'development';
  const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      if (normalizedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (isDevelopment && localhostPattern.test(origin)) {
        return callback(null, true);
      }
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
      'X-CSRF-Token',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range', 'X-Request-ID'],
    credentials: true,
    maxAge: 3600,
    optionsSuccessStatus: 204,
  });

  // 全局验证管道 - 自动验证请求数据
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 移除不在DTO中的属性
      forbidNonWhitelisted: true, // 拒绝包含未定义属性的请求
      transform: true, // 自动类型转换
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器 - 统一异常处理
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局拦截器 - 日志记录和响应包装
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Swagger API文档配置
  const config = new DocumentBuilder()
    .setTitle('OneRecycle API')
    .setDescription('OneRecycle 多平台旧物回收 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '输入 JWT Token',
      },
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
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 启动应用
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
