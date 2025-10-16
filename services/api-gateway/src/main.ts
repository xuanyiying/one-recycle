import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS配置
  app.enableCors({
    origin: configService.get<string[]>('cors.origin'),
    credentials: configService.get<boolean>('cors.credentials'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 设置全局前缀
  app.setGlobalPrefix('api');

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  
  console.log(`API Gateway is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(err => {
  console.error('Failed to start API Gateway:', err);
  process.exit(1);
});