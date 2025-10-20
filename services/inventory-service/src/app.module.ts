import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InventoryModule } from './modules/inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    PrismaModule,
    InventoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}