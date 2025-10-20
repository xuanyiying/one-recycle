import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DispatchModule } from './dispatch/dispatch.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig } from './config/app.config';
import { dispatchConfig } from './config/dispatch.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dispatchConfig],
    }),
    DispatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}