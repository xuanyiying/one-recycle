import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global configuration
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // gRPC microservice
  const grpcPort = parseInt(process.env.GRPC_PORT || '50054', 10);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'courier',
      protoPath: join(__dirname, 'proto/courier.proto'),
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  // Start all microservices
  await app.startAllMicroservices();

  // Start HTTP server
  const port = parseInt(process.env.PORT || '3004', 10);
  await app.listen(port);

  const environment = process.env.NODE_ENV || 'development';
  console.log(`🚀 Courier Service is running on: http://localhost:${port} [${environment}]`);
  console.log(`🔗 gRPC Server is running on: localhost:${grpcPort}`);
}

bootstrap();