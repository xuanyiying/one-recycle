import { Module } from '@nestjs/common';
import { DispatchModule } from './dispatch/dispatch.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DispatchModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }