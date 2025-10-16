import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    // 库存商品管理
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
            status,
            itemType,
            condition,
            location,
            categoryId: categoryId ? parseInt(categoryId) : undefined,
        };
        return this.inventoryService.findAllInventoryItems(filters);
    }

    @Get('items/:id')
    async findInventoryItemById(@Param('id') id: string): Promise<any> {
        return this.inventoryService.findInventoryItemById(id);
    }

    @Patch('items/:id')
    async updateInventoryItem(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto): Promise<any> {
        return this.inventoryService.updateInventoryItem(id, updateInventoryItemDto);
    }

    @Delete('items/:id')
    async removeInventoryItem(@Param('id') id: string): Promise<any> {
        return this.inventoryService.removeInventoryItem(id);
    }

    // 库存事务管理
    @Post('transactions')
    async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<any> {
        return this.inventoryService.createTransaction(createTransactionDto);
    }

    @Get('items/:id/transactions')
    async getInventoryTransactions(@Param('id') id: string): Promise<any> {
        return this.inventoryService.getInventoryTransactions(id);
    }

    // 库存状态查询
    @Get('items/low-stock')
    async getLowStockItems(@Query('threshold') threshold?: string): Promise<any> {
        const thresholdNum = threshold ? parseInt(threshold) : 10;
        return this.inventoryService.getLowStockItems(thresholdNum);
    }

    @Get('items/out-of-stock')
    async getOutOfStockItems(): Promise<any> {
        return this.inventoryService.getOutOfStockItems();
    }

    // 销售记录管理
    @Post('sales')
    async recordSales(@Body() salesData: {
        itemId: string;
        quantity: number;
        unitPrice: number;
        orderId: string;
        customerId: string;
        notes?: string;
    }): Promise<any> {
        return this.inventoryService.recordSales({
            ...salesData,
            itemId: parseInt(salesData.itemId),
            customerId: parseInt(salesData.customerId)
        });
    }

    @Get('sales')
    async getSalesRecords(): Promise<any> {
        return this.inventoryService.getSalesRecords();
    }

    @Get('sales/item/:itemId')
    async getSalesRecordsByItem(@Param('itemId') itemId: string): Promise<any> {
        return this.inventoryService.getSalesRecords(itemId);
    }

    // 质量检查管理
    @Post('quality-checks')
    async createQualityCheck(@Body() createQualityCheckDto: CreateQualityCheckDto): Promise<any> {
        return this.inventoryService.createQualityCheck(createQualityCheckDto);
    }

    @Get('quality-checks/item/:itemId')
    async getQualityChecksByItemId(@Param('itemId') itemId: string): Promise<any> {
        return this.inventoryService.getQualityChecksByItemId(itemId);
    }

    // 库存预留管理
    @Post('reservations')
    async createReservation(@Body() createReservationDto: CreateReservationDto): Promise<any> {
        return this.inventoryService.createReservation(createReservationDto);
    }

    @Patch('reservations/:id/confirm')
    async confirmReservation(@Param('id') id: string): Promise<any> {
        return this.inventoryService.confirmReservation(id);
    }

    @Patch('reservations/:id/cancel')
    async cancelReservation(@Param('id') id: string): Promise<any> {
        return this.inventoryService.cancelReservation(id);
    }

    @Get('reservations/order/:orderId')
    async getReservationsByOrderId(@Param('orderId') orderId: string): Promise<any> {
        return this.inventoryService.getReservationsByOrderId(orderId);
    }

    // 库存统计
    @Get('stats')
    async getInventoryStats(): Promise<any> {
        return this.inventoryService.getInventoryStats();
    }

    // 批量操作
    @Patch('items/batch/status')
    async batchUpdateStatus(@Body() data: { itemIds: string[]; status: string }): Promise<any> {
        return this.inventoryService.batchUpdateStatus(data.itemIds, data.status);
    }

    @Patch('items/batch/location')
    async batchUpdateLocation(@Body() data: { itemIds: string[]; location: string }): Promise<any> {
        return this.inventoryService.batchUpdateLocation(data.itemIds, data.location);
    }

    // ==================== 仓库管理 ====================

    @Post('warehouses')
    async createWarehouse(@Body() createWarehouseDto: any): Promise<any> {
        return this.inventoryService.createWarehouse(createWarehouseDto);
    }

    @Get('warehouses')
    async findWarehouses(@Query() query: any): Promise<any> {
        return this.inventoryService.findWarehouses(query);
    }

    @Get('warehouses/:id')
    async findWarehouseById(@Param('id') id: string): Promise<any> {
        return this.inventoryService.findWarehouseById(BigInt(id));
    }

    @Patch('warehouses/:id')
    async updateWarehouse(@Param('id') id: string, @Body() updateWarehouseDto: any): Promise<any> {
        return this.inventoryService.updateWarehouse(BigInt(id), updateWarehouseDto);
    }

    // ==================== 增强的库存操作 ====================

    @Post('items/:id/stock-in')
    async stockIn(@Param('id') id: string, @Body() stockInDto: any): Promise<any> {
        return this.inventoryService.stockIn({
            itemId: BigInt(id),
            ...stockInDto,
        });
    }

    @Post('items/:id/stock-out')
    async stockOut(@Param('id') id: string, @Body() stockOutDto: any): Promise<any> {
        return this.inventoryService.stockOut({
            itemId: BigInt(id),
            ...stockOutDto,
        });
    }

    @Post('items/:id/reserve')
    async reserveStock(@Param('id') id: string, @Body() reserveDto: any): Promise<any> {
        return this.inventoryService.reserveStock(BigInt(id), reserveDto.quantity);
    }

    @Post('items/:id/release')
    async releaseStock(@Param('id') id: string, @Body() releaseDto: any): Promise<any> {
        return this.inventoryService.releaseReservedStock(BigInt(id), releaseDto.quantity);
    }

    // ==================== 增强的查询功能 ====================

    @Get('items/search')
    async searchInventoryItems(@Query() query: any): Promise<any> {
        return this.inventoryService.findInventoryItems(query);
    }

    @Get('items/:id/alerts')
    async checkStockAlert(@Param('id') id: string): Promise<any> {
        await this.inventoryService.checkStockAlert(BigInt(id));
        return { message: '库存预警检查完成' };
    }

    // ==================== 统计信息 ====================

    @Post('transfer')
    async transferStock(@Body() transferData: {
        itemId: string;
        fromWarehouseId: string;
        toWarehouseId: string;
        quantity: number;
        operatorId?: string;
        operatorName?: string;
        notes?: string;
    }): Promise<any> {
        return this.inventoryService.transferStock({
            itemId: BigInt(transferData.itemId),
            fromWarehouseId: BigInt(transferData.fromWarehouseId),
            toWarehouseId: BigInt(transferData.toWarehouseId),
            quantity: new (await import('../../prisma/generated/client/runtime/library')).Decimal(transferData.quantity),
            operatorId: transferData.operatorId ? BigInt(transferData.operatorId) : undefined,
            operatorName: transferData.operatorName,
            notes: transferData.notes,
        });
    }

    @Post('batch-adjust')
    async batchAdjustStock(@Body() adjustmentData: {
        adjustments: Array<{
            itemId: string;
            adjustmentType: 'INCREASE' | 'DECREASE' | 'SET';
            quantity: number;
            reason: string;
            operatorId?: string;
            operatorName?: string;
        }>;
    }): Promise<any> {
        const { Decimal } = await import('../../prisma/generated/client/runtime/library');
        const adjustments = adjustmentData.adjustments.map(adj => ({
            ...adj,
            itemId: BigInt(adj.itemId),
            quantity: new Decimal(adj.quantity),
            operatorId: adj.operatorId ? BigInt(adj.operatorId) : undefined,
        }));
        return this.inventoryService.batchAdjustStock(adjustments);
    }

    @Post('stock-taking')
    async stockTaking(@Body() stockTakingData: {
        warehouseId?: string;
        categoryId?: string;
        operatorId?: string;
        operatorName?: string;
        notes?: string;
    }): Promise<any> {
        return this.inventoryService.stockTaking({
            warehouseId: stockTakingData.warehouseId ? BigInt(stockTakingData.warehouseId) : undefined,
            categoryId: stockTakingData.categoryId ? BigInt(stockTakingData.categoryId) : undefined,
            operatorId: stockTakingData.operatorId ? BigInt(stockTakingData.operatorId) : undefined,
            operatorName: stockTakingData.operatorName,
            notes: stockTakingData.notes,
        });
    }

    @Get('report')
    async getInventoryReport(@Query() query: {
        startDate?: string;
        endDate?: string;
        warehouseId?: string;
        categoryId?: string;
    }): Promise<any> {
        return this.inventoryService.getInventoryReport({
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            warehouseId: query.warehouseId ? BigInt(query.warehouseId) : undefined,
            categoryId: query.categoryId ? BigInt(query.categoryId) : undefined,
        });
    }

    @Get('statistics/overview')
    async getInventoryOverview(): Promise<any> {
        // 这里可以添加更详细的统计逻辑
        const stats = await this.inventoryService.getInventoryStats();
        return {
            message: '库存统计概览获取成功',
            data: stats,
        };
    }
}