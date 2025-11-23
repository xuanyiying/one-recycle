import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderData, UpdateOrderData, OrderFilters } from '../interfaces/order.interface';
import { OrderEntity } from '../entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderData: CreateOrderData): Promise<OrderEntity> {
    return this.orderService.create(createOrderData);
  }

  @Get()
  async findAll(
    @Query() filters: OrderFilters,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    return this.orderService.findAll(filters, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderEntity> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderData: UpdateOrderData,
  ): Promise<OrderEntity> {
    return this.orderService.update(id, updateOrderData);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<OrderEntity> {
    return this.orderService.cancel(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderService.remove(id);
  }

  // 兼容旧版API
  @Post('recycle')
  async createRecycleOrder(@Body() createOrderData: CreateOrderData): Promise<OrderEntity> {
    return this.orderService.createRecycleOrder(createOrderData);
  }

  @Post('sale')
  async createSaleOrder(@Body() createOrderData: CreateOrderData): Promise<OrderEntity> {
    return this.orderService.createSaleOrder(createOrderData);
  }
}