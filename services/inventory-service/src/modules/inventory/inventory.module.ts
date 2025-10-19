import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { PrismaService } from '../../prisma.service';
import { InventoryService } from './services/inventory.service';

@Module({
    controllers: [InventoryController],
    providers: [InventoryService, PrismaService],
    exports: [InventoryService],
})
export class InventoryModule { }