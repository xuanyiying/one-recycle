import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import { SetPaymentPasswordDto } from './dto/payment-password.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RequestWithStaff } from '@/common';

@ApiTags('财务管理')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) { }

  @Get('wallet')
  @ApiOperation({ summary: '获取平台钱包信息' })
  getWallet() {
    return this.financeService.getPlatformWallet();
  }

  @Get('recharge/plans')
  @ApiOperation({ summary: '获取充值套餐列表' })
  getRechargePlans() {
    return this.financeService.getRechargePlans();
  }

  @Post('recharge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建充值订单' })
  createRecharge(@Request() req: RequestWithStaff, @Body() dto: CreateRechargeDto) {
    const tenantId = dto.tenantId || (req.user.type === 'staff' ? req.user.tenantId : undefined);
    return this.financeService.createRechargeOrder(dto, tenantId);
  }

  @Post('recharge/mock-callback')
  @ApiOperation({ summary: '模拟支付回调（测试用）' })
  mockCallback(@Body('orderNo') orderNo: string, @Body('tenantId') tenantId?: string) {
    return this.financeService.mockPaySuccess(orderNo, tenantId);
  }

  @Get('transactions')
  @ApiOperation({ summary: '获取平台交易记录' })
  getTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    return this.financeService.getTransactions(page, limit, type);
  }

  @Post('payment-password')
  @ApiOperation({ summary: '设置支付密码' })
  setPaymentPassword(@Body() dto: SetPaymentPasswordDto) {
    return this.financeService.setPaymentPassword(dto.password);
  }

  @Get('tenant/:tenantId/balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取租户余额' })
  getTenantBalance(@Param('tenantId') tenantId: string) {
    return this.financeService.getTenantBalance(tenantId);
  }

  @Get('tenant/:tenantId/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取租户交易记录' })
  getTenantTransactions(
    @Param('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.financeService.getTenantTransactions(tenantId, page, limit);
  }

  @Get('expenses')
  @ApiOperation({ summary: '获取平台支出记录' })
  getExpenses(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('orderNo') orderNo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.financeService.getExpenses(page, limit, {
      type,
      status,
      startDate,
      endDate,
      orderNo,
      sortBy,
      sortOrder,
    });
  }

  @Get('expenses/stats')
  @ApiOperation({ summary: '获取平台支出统计' })
  getExpenseStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getExpenseStats(startDate, endDate);
  }
}
