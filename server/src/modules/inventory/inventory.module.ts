import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
