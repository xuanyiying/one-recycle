import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrderService } from './services/order.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
} from './dto';
import { OrderFilters } from './interfaces/order.interface';
import { Order } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  async create(@Body() createOrderData: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderData);
  }

  @Get()
  @ApiOperation({ summary: '获取订单列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取订单列表成功' })
  async findAll(
    @Query() filters: OrderFilters,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<{ orders: Order[]; total: number }> {
    return this.orderService.findAll(filters, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '获取订单详情成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新订单' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单更新成功' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderData: UpdateOrderDto,
  ): Promise<Order> {
    return this.orderService.update(id, updateOrderData);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单取消成功' })
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.cancel(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单删除成功' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderService.remove(id);
  }

  // 兼容旧版API
  @Post('recycle')
  @ApiOperation({ summary: '创建回收订单' })
  async createRecycleOrder(
    @Body() createOrderData: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.createRecycleOrder(createOrderData);
  }

  @Post('sale')
  @ApiOperation({ summary: '创建销售订单' })
  async createSaleOrder(
    @Body() createOrderData: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.createSaleOrder(createOrderData);
  }
}
