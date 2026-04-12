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
  Put,
  BadRequestException,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from './services/order.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrderFilters } from './interfaces/order.interface';
import { Order } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Public } from '@/common/decorators/auth.decorator';
import type { Request } from 'express';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
  ) {}

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
   * 获取订单统计信息
   */
  @Get('stats')
  @ApiOperation({ summary: '获取订单统计信息' })
  @ApiResponse({ status: 200, description: '获取订单统计信息成功' })
  async getStats() {
    return this.orderService.getStats();
  }

  /**
   * 获取最近订单
   * @param limit 数量
   */
  @Get('recent')
  @ApiOperation({ summary: '获取最近订单' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '获取最近订单成功' })
  async getRecentOrders(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.orderService.getRecentOrders(limit);
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
    return this.orderService.findAll(
      { userId: userId.toString() },
      page,
      limit,
    );
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
   * 更新订单状态
   * @param id 订单ID
   * @param updateOrderData 更新订单状态
   */
  @Put(':id/status')
  @ApiOperation({ summary: '更新订单状态' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单状态更新成功' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderData: UpdateOrderDto,
  ): Promise<Order> {
    if (!updateOrderData.status) {
      throw new BadRequestException('status is required');
    }
    return this.orderService.updateStatus(id, updateOrderData);
  }

  /**
   * 确认订单
   * @param id 订单ID
   */
  @Put(':id/confirm')
  @ApiOperation({ summary: '确认订单' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单确认成功' })
  async confirm(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.confirmOrder(id);
  }

  /**
   * 入库确认
   * @param id 订单ID
   */
  @Patch(':id/inbound/confirm')
  @ApiOperation({ summary: '入库确认' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '入库确认成功' })
  async confirmInbound(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.orderService.confirmInbound(id);
  }

  /**
   * 物流状态回调
   * @param id 订单ID
   */
  @Public()
  @Post(':id/logistics/notify')
  @ApiOperation({ summary: '物流状态回调' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '物流状态更新成功' })
  async logisticsNotify(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
    @Body()
    data: {
      status: string;
      providerData?: any;
    },
  ): Promise<Order> {
    if (!data?.status) {
      throw new BadRequestException('status is required');
    }

    const logisticsOrder = await this.orderService.findLogisticsOrder(
      id.toString(),
    );

    const callbackLog = await this.prisma.logisticsCallbackLog.create({
      data: {
        logisticsOrderId: logisticsOrder?.id,
        orderId: BigInt(id),
        providerCode:
          data?.providerData?.providerCode ||
          logisticsOrder?.logisticsCompany ||
          'UNKNOWN',
        headers: req.headers as any,
        rawBody: JSON.stringify(data),
        parsedBody: data.providerData ?? data,
        signatureValid: null,
        processed: false,
      },
    });

    try {
      const updated = await this.orderService.updateLogisticsStatus(
        id,
        data.status,
        data.providerData,
      );

      await this.prisma.logisticsCallbackLog.update({
        where: { id: callbackLog.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      return updated;
    } catch (error: any) {
      await this.prisma.logisticsCallbackLog.update({
        where: { id: callbackLog.id },
        data: {
          processed: true,
          processedAt: new Date(),
          processError: error?.message
            ? String(error.message)
            : 'UNKNOWN_ERROR',
        },
      });
      throw error;
    }
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
   * 删除订单（仅管理员）
   * @param id 订单ID
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除订单' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '订单删除成功' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<void> {
    // 仅管理员可删除订单
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('仅管理员可删除订单');
    }
    return this.orderService.remove(id);
  }
}
