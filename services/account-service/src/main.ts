import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // 获取配置
    const port = configService.get<number>('app.port', 3001);
    const grpcPort = configService.get<number>('app.grpcPort', 50051);
    const environment = configService.get<string>('app.environment', 'development');

    // 启用全局验证管道
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    // 启用CORS
    app.enableCors({
      origin: configService.get<string[]>('app.corsOrigins', ['http://localhost:3000']),
      credentials: true,
    });

    // 连接gRPC微服务
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: 'account',
        protoPath: join(__dirname, 'proto/account.proto'),
        url: `0.0.0.0:${grpcPort}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      },
    });

    // 启动所有微服务
    await app.startAllMicroservices();
    
    // 启动HTTP服务器
    await app.listen(port);
    
    logger.log(`🚀 Account service is running on: ${await app.getUrl()}`);
    logger.log(`🔧 gRPC service is running on: 0.0.0.0:${grpcPort}`);
    logger.log(`🌍 Environment: ${environment}`);
  } catch (error) {
    logger.error('❌ Error starting application', error);
    process.exit(1);
  }
}

bootstrap();