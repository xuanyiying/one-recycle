import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Configure gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'inventory',
      protoPath: join(__dirname, 'proto/inventory.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || '50005'}`,
    },
  });

  // Start all microservices
  await app.startAllMicroservices();

  // Start HTTP server
  const port = parseInt(process.env.PORT || '3005', 10);
  await app.listen(port);
  console.log(`Inventory Service is running on: http://localhost:${port}`);
  console.log(`Inventory gRPC Service is running on: localhost:${process.env.GRPC_PORT || '50005'}`);
}

bootstrap();