import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  try {
    // 创建 HTTP 应用程序
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 启用 CORS
    app.enableCors();

    // 设置全局前缀
    app.setGlobalPrefix(configService.get('app.globalPrefix') || 'api');

    // 应用全局过滤器
    app.useGlobalFilters(new GlobalExceptionFilter());

    // 应用全局管道
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // 设置 gRPC 微服务
    const grpcPort = configService.get<number>('app.grpcPort') || 50057;
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: 'dispatch',
        protoPath: join(__dirname, '../proto/dispatch.proto'),
        url: `0.0.0.0:${grpcPort}`,
      },
    });

    // 启动所有微服务
    await app.startAllMicroservices();

    // 启动 HTTP 服务器
    const httpPort = configService.get<number>('app.httpPort') || 3007;
    await app.listen(httpPort);

    console.log(`Dispatch service HTTP is running on: http://localhost:${httpPort}`);
    console.log(`Dispatch service gRPC is running on: localhost:${grpcPort}`);
  } catch (error) {
    console.error('Failed to start dispatch service:', error);
    process.exit(1);
  }
}

bootstrap();