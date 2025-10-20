import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  // Create HTTP application
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix(configService.get('app.globalPrefix') || 'api');

  // Apply global filters and pipes
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Setup gRPC microservice
  const grpcPort = configService.get('app.grpcPort');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'payment',
      protoPath: join(__dirname, 'proto/payment.proto'),
      url: `0.0.0.0:${grpcPort}`,
    },
  });

  // Start all microservices
  await app.startAllMicroservices();

  // Start HTTP server
  const port = configService.get('app.port');
  await app.listen(port);

  console.log(`Payment Service HTTP server running on: http://localhost:${port}`);
  console.log(`Payment Service gRPC server running on: localhost:${grpcPort}`);
}

bootstrap().catch((error) => {
  console.error('Error starting Payment Service:', error);
  process.exit(1);
});