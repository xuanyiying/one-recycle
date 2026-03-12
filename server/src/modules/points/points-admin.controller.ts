import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { PointsProductService } from './services/points-product.service';
import { PointsOrderService } from './services/points-order.service';
import { PointsTaskService } from './services/points-task.service';
import { PointsService } from './points.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Controller('admin/points')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class PointsAdminController {
  constructor(
    private readonly productService: PointsProductService,
    private readonly orderService: PointsOrderService,
    private readonly taskService: PointsTaskService,
    private readonly pointsService: PointsService,
  ) { }

  // ==================== 统计概览 ====================

  @Get('stats')
  async getStats() {
    return this.pointsService.getAdminStats();
  }

  // ==================== 商品管理 ====================

  @Get('products')
  async getAllProducts(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get('products/:id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(BigInt(id));
  }

  @Post('products/:id')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(BigInt(id), dto);
  }

  @Post('products/:id/delete')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(BigInt(id));
  }

  // ==================== 订单管理 ====================

  @Get('orders')
  async getAllOrders(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get('orders/:id')
  async getOrder(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(BigInt(id));
  }

  @Post('orders/:id/ship')
  async shipOrder(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { logisticsNo: string; logisticsCompany: string },
  ) {
    return this.orderService.ship(
      BigInt(id),
      body.logisticsNo,
      body.logisticsCompany,
    );
  }

  // ==================== 任务管理 ====================

  @Get('tasks')
  async getTasks() {
    return this.taskService.getTaskList(BigInt(0)); // Admin can see all tasks
  }

  @Post('tasks')
  async createTask(
    @Body()
    body: {
      name: string;
      description?: string;
      type: string;
      points: number;
      icon?: string;
      config?: any;
      sortOrder?: number;
    },
  ) {
    return this.taskService.createTask({
      name: body.name,
      description: body.description,
      type: body.type as any,
      points: body.points,
      icon: body.icon,
      config: body.config,
      sortOrder: body.sortOrder,
    });
  }

  @Post('tasks/:id')
  async updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<{
      name: string;
      description: string;
      points: number;
      icon: string;
      config: any;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.taskService.updateTask(BigInt(id), body);
  }
}
