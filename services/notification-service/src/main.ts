import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix('api');

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'notification',
      protoPath: join(__dirname, 'proto/notification.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || '50007'}`,
    },
  });

  // Start all microservices
  await app.startAllMicroservices();

  // Start HTTP server
  const port = process.env.PORT || 3007;
  await app.listen(port);

  console.log(`Notification service is running on: http://localhost:${port}`);
  console.log(`gRPC service is running on: 0.0.0.0:${process.env.GRPC_PORT || '50007'}`);
}

bootstrap();