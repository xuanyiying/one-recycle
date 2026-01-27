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

  /**
   * 创建订单
   * @param createOrderData 创建订单数据
   */
  @Post()
  @ApiOperation({ summary: '创建订单' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  async create(@Body() createOrderData: CreateOrderDto): Promise<Order> {
    return this.orderService.create(createOrderData);
  }

  /**
   * 获取订单列表
   * @param filters 筛选条件
   * @param page 页码
   * @param limit 每页数量
   */
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

  /**
   * 获取订单详情
   * @param id 订单ID
   */
  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '获取订单详情成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.findOne(id);
  }

  /**
   * 获取用户订单列表
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   */
  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户订单列表' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: '获取用户订单列表成功' })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<{ orders: Order[]; total: number }> {
    return this.orderService.findAll({ userId: userId.toString() }, page, limit);
  }

  /**
   * 获取用户订单统计
   * @param userId 用户ID
   */
  @Get('user/:userId/statistics')
  @ApiOperation({ summary: '获取用户订单统计' })
  @ApiParam({ name: 'userId', type: Number })
  async getUserStatistics(@Param('userId', ParseIntPipe) userId: number) {
    // 简单实现，后续可以移入 service
    const { total } = await this.orderService.findAll({
      userId: userId.toString(),
    });
    return { total };
  }

  /**
   * 更新订单
   * @param id 订单ID
   * @param updateOrderData 更新订单数据
   */
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

  /**
   * 取消订单
   * @param id 订单ID
   */
  @Patch(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单取消成功' })
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.cancel(id);
  }

  /**
   * 删除订单
   * @param id 订单ID
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单删除成功' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderService.remove(id);
  }

  // 兼容旧版API
  /**
   * 创建回收订单 (兼容旧版)
   * @param createOrderData 创建订单数据
   */
  @Post('recycle')
  @ApiOperation({ summary: '创建回收订单' })
  async createRecycleOrder(
    @Body() createOrderData: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.createRecycleOrder(createOrderData);
  }

  /**
   * 创建销售订单 (兼容旧版)
   * @param createOrderData 创建订单数据
   */
  @Post('sale')
  @ApiOperation({ summary: '创建销售订单' })
  async createSaleOrder(
    @Body() createOrderData: CreateOrderDto,
  ): Promise<Order> {
    return this.orderService.createSaleOrder(createOrderData);
  }
}
