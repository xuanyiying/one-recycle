import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);

    // 获取配置
    const port = parseInt(process.env.PORT) || 3009;
    const grpcPort = parseInt(process.env.GRPC_PORT) || 50059;
    const environment = process.env.NODE_ENV || 'development';

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
      origin: ['http://localhost:3000'],
      credentials: true,
    });

    // 连接gRPC微服务
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join(__dirname, '../proto/order.proto'),
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
    
    logger.log(`🚀 Order service is running on: http://localhost:${port}`);
    logger.log(`🔧 gRPC service is running on: 0.0.0.0:${grpcPort}`);
    logger.log(`🌍 Environment: ${environment}`);
  } catch (error) {
    logger.error('❌ Error starting application', error);
    process.exit(1);
  }
}

bootstrap();