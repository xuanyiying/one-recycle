import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourierModule } from './modules/courier/courier.module';
import { PrismaModule } from './prisma/prisma.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    CourierModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}