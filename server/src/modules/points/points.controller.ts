import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PointsService } from './points.service';
import { PointsProductService } from './services/points-product.service';
import { PointsOrderService } from './services/points-order.service';
import { PointsRecordService } from './services/points-record.service';
// AI功能已禁用：签到和任务服务暂时不导入
// import { SignInService } from './services/sign-in.service';
// import { PointsTaskService } from './services/points-task.service';
import { InviteService } from './services/invite.service';
import { CreatePointsOrderDto } from './dto/create-order.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { BindInviteDto } from './dto/bind-invite.dto';
import { PointsType } from '@prisma/client';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(
    private readonly pointsService: PointsService,
    private readonly productService: PointsProductService,
    private readonly orderService: PointsOrderService,
    private readonly recordService: PointsRecordService,
    // AI功能已禁用：签到和任务服务暂时不使用
    // private readonly signInService: SignInService,
    // private readonly taskService: PointsTaskService,
    private readonly inviteService: InviteService,
  ) {}

  // ==================== 积分概览 ====================

  @Get('overview')
  async getOverview(@Request() req: any) {
    return this.pointsService.getPointsOverview(BigInt(req.user.id));
  }

  // ==================== 商品相关 ====================

  @Get('products')
  async getProducts(@Query() query: QueryProductDto) {
    return this.productService.findList(query);
  }

  @Get('products/categories')
  async getProductCategories() {
    return this.productService.getCategories();
  }

  @Get('products/:id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(BigInt(id));
  }

  // ==================== 订单相关 ====================

  @Post('orders')
  async createOrder(@Request() req: any, @Body() dto: CreatePointsOrderDto) {
    return this.orderService.create(BigInt(req.user.id), dto);
  }

  @Get('orders')
  async getMyOrders(@Request() req: any, @Query() query: QueryOrderDto) {
    return this.orderService.findByUser(BigInt(req.user.id), query);
  }

  @Get('orders/:id')
  async getOrder(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(BigInt(id), BigInt(req.user.id));
  }

  @Post('orders/:id/cancel')
  async cancelOrder(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.cancel(BigInt(req.user.id), BigInt(id));
  }

  @Post('orders/:id/confirm')
  async confirmOrder(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orderService.confirm(BigInt(req.user.id), BigInt(id));
  }

  // ==================== 积分记录 ====================

  @Get('records')
  async getRecords(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: PointsType,
  ) {
    return this.recordService.findByUser(
      BigInt(req.user.id),
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      type,
    );
  }

  @Get('records/stats')
  async getRecordStats(@Request() req: any) {
    return this.recordService.getStats(BigInt(req.user.id));
  }

  // ==================== 签到 (AI功能已禁用) ====================
  /*
  @Post('sign-in')
  async signIn(@Request() req: any) {
    return this.signInService.signIn(BigInt(req.user.id));
  }

  @Get('sign-in/status')
  async getSignInStatus(@Request() req: any) {
    return this.signInService.getSignInStatus(BigInt(req.user.id));
  }

  @Get('sign-in/records')
  async getSignInRecords(
    @Request() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date();
    return this.signInService.getSignInRecords(
      BigInt(req.user.id),
      year ? parseInt(year) : now.getFullYear(),
      month ? parseInt(month) : now.getMonth() + 1,
    );
  }
  */

  // ==================== 任务 (AI功能已禁用) ====================
  /*
  @Get('tasks')
  async getTasks(@Request() req: any) {
    return this.taskService.getTaskList(BigInt(req.user.id));
  }

  @Post('tasks/:id/complete')
  async completeTask(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.taskService.completeTask(BigInt(req.user.id), BigInt(id));
  }
  */

  // ==================== 邀请 ====================

  @Get('invite/stats')
  async getInviteStats(@Request() req: any) {
    return this.inviteService.getInviteStats(BigInt(req.user.id));
  }

  @Get('invite/list')
  async getInviteList(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inviteService.getInviteList(
      BigInt(req.user.id),
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post('invite/bind')
  async bindInvite(@Request() req: any, @Body() dto: BindInviteDto) {
    await this.inviteService.handleInvite(BigInt(req.user.id), dto.inviteCode);
    return { success: true };
  }
}
