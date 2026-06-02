import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import {
  InventoryStatus,
  ItemType,
  ItemCondition,
} from './entities/inventory.entity';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  async createInventoryItem(
    @Body() createInventoryItemDto: CreateInventoryItemDto,
  ): Promise<any> {
    return this.inventoryService.createInventoryItem(createInventoryItemDto);
  }

  @Get()
  async findAllInventoryItems(
    @Query('status') status?: string,
    @Query('itemType') itemType?: string,
    @Query('condition') condition?: string,
    @Query('location') location?: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<any> {
    const filters = {
      status: status as InventoryStatus,
      itemType: itemType as ItemType,
      condition: condition as ItemCondition,
      location,
      categoryId: categoryId ? BigInt(categoryId) : undefined,
    };
    const pagination = {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 10,
    };
    return this.inventoryService.getInventoryItems(
      filters,
      undefined,
      pagination,
    );
  }

  @Get('items')
  async findAllInventoryItemsLegacy(
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
  async updateInventoryItem(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
  ): Promise<any> {
    return this.inventoryService.updateInventoryItem(
      BigInt(id),
      updateInventoryItemDto,
    );
  }

  @Delete('items/:id')
  async removeInventoryItem(@Param('id') id: string): Promise<any> {
    return this.inventoryService.deleteInventoryItem(BigInt(id));
  }

  @Post('transactions')
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<any> {
    return this.inventoryService.createTransaction(createTransactionDto);
  }

  @Post('quality-checks')
  async createQualityCheck(
    @Body() createQualityCheckDto: CreateQualityCheckDto,
  ): Promise<any> {
    return this.inventoryService.createQualityCheck(createQualityCheckDto);
  }

  @Post('reservations')
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<any> {
    return this.inventoryService.createReservation(createReservationDto);
  }

  @Post('reservations/:id/confirm')
  async confirmReservation(@Param('id') id: string): Promise<any> {
    return this.inventoryService.confirmReservation(BigInt(id));
  }

  @Post('reservations/:id/cancel')
  async cancelReservation(@Param('id') id: string): Promise<any> {
    return this.inventoryService.cancelReservation(BigInt(id));
  }

  @Post('reservations/expire')
  async expireReservations(): Promise<any> {
    return this.inventoryService.expireReservations();
  }

  @Get('alerts')
  async getAlerts(): Promise<any[]> {
    return this.inventoryService.getAlerts();
  }

  @Get('stats')
  async getInventoryStats(): Promise<any> {
    return this.inventoryService.getInventoryStats();
  }

  @Get('warehouses')
  async findAllWarehouses(): Promise<any[]> {
    return this.inventoryService.getWarehouses();
  }

  @Post('warehouses')
  async createWarehouse(@Body() createWarehouseDto: any): Promise<any> {
    return this.inventoryService.createWarehouse(createWarehouseDto);
  }

  @Get('export')
  exportInventory(@Query() query: any): any[] {
    return this.inventoryService.exportInventory(query);
  }

  @Post('batch-delete')
  batchDelete(@Body() body: { ids: string[] }): void {
    this.inventoryService.batchDelete(body.ids);
  }

  @Post(':id/adjust')
  adjustInventory(
    @Param('id') id: string,
    @Body() data: { type: string; quantity: number; reason: string },
  ): any {
    return this.inventoryService.adjustInventory(BigInt(id), data);
  }

  @Get(':id/adjustments')
  getAdjustments(@Param('id') id: string): any[] {
    return this.inventoryService.getAdjustments(BigInt(id));
  }

  @Put('alerts/:id/read')
  markAlertAsRead(@Param('id') id: string): void {
    this.inventoryService.markAlertAsRead(BigInt(id));
  }

  @Post('alerts/batch-read')
  batchMarkAlertsAsRead(@Body() body: { ids: string[] }): void {
    this.inventoryService.batchMarkAlertsAsRead(body.ids);
  }

  @Get('value-trend')
  async getValueTrend(@Query('days') days?: number): Promise<any[]> {
    return this.inventoryService.getValueTrend(days || 30);
  }

  @Get('turnover')
  getTurnover(): any[] {
    return this.inventoryService.getTurnover();
  }
}
