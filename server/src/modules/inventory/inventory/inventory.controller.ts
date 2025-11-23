import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { InventoryStatus, ItemType, ItemCondition } from './entities/inventory.entity';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Post('items')
    async createInventoryItem(@Body() createInventoryItemDto: CreateInventoryItemDto): Promise<any> {
        return this.inventoryService.createInventoryItem(createInventoryItemDto);
    }

    @Get('items')
    async findAllInventoryItems(
        @Query('status') status?: string,
        @Query('itemType') itemType?: string,
        @Query('condition') condition?: string,
        @Query('location') location?: string,
        @Query('categoryId') categoryId?: string,
    ): Promise<any> {
        const filters = {
            status: status as InventoryStatus,
            itemType: itemType as ItemType,
            condition: condition as ItemCondition,
            location,
            categoryId: categoryId ? BigInt(categoryId) : undefined,
        };
        return this.inventoryService.getInventoryItems(filters);
    }

    @Get('items/:id')
    async findInventoryItemById(@Param('id') id: string): Promise<any> {
        return this.inventoryService.getInventoryItemById(BigInt(id));
    }

    @Patch('items/:id')
    async updateInventoryItem(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto): Promise<any> {
        return this.inventoryService.updateInventoryItem(BigInt(id), updateInventoryItemDto);
    }

    @Delete('items/:id')
    async removeInventoryItem(@Param('id') id: string): Promise<any> {
        return this.inventoryService.deleteInventoryItem(BigInt(id));
    }

    @Post('transactions')
    async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<any> {
        return this.inventoryService.createTransaction(createTransactionDto);
    }

    @Post('quality-checks')
    async createQualityCheck(@Body() createQualityCheckDto: CreateQualityCheckDto): Promise<any> {
        return this.inventoryService.createQualityCheck(createQualityCheckDto);
    }

    @Post('reservations')
    async createReservation(@Body() createReservationDto: CreateReservationDto): Promise<any> {
        return this.inventoryService.createReservation(createReservationDto);
    }

    @Get('stats')
    async getInventoryStats(): Promise<any> {
        return this.inventoryService.getInventoryStats();
    }

    @Post('warehouses')
    async createWarehouse(@Body() createWarehouseDto: any): Promise<any> {
        return this.inventoryService.createWarehouse(createWarehouseDto);
    }
}