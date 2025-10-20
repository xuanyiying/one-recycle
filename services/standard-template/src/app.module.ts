import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExampleModule } from './modules/example/example.module';
import { PrismaModule } from './prisma/prisma.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, databaseConfig],
        }),
        PrismaModule,
        ExampleModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }