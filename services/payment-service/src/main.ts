import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'payment',
        protoPath: join(__dirname, 'proto/payment.proto'),
        url: '0.0.0.0:50060',
      },
    },
  );
  await app.listen();
}
bootstrap();