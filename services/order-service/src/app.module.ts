import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    OrderModule,
  ],
  controllers: [AppController],
})
export class AppModule {}