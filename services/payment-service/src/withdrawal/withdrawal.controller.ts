import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  SetMetadata,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto, WithdrawalFiltersDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { User } from '../common/decorators/user.decorator';

// 用于标记公开接口的装饰器
export const Public = () => SetMetadata('isPublic', true);

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  /**
   * 创建提现申请
   * POST /withdrawals
   */
  @Post()
  async createWithdrawal(
    @User('userId') userId: number,
    @Body() dto: CreateWithdrawalDto,
  ) {
    const withdrawal = await this.withdrawalService.createWithdrawal(userId, dto);
    return withdrawal.toJSON();
  }

  /**
   * 获取我的提现记录
   * GET /withdrawals/me
   */
  @Get('me')
  async getMyWithdrawals(
    @User('userId') userId: number,
    @Query() filters: WithdrawalFiltersDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.withdrawalService.getWithdrawals(
      userId,
      filters,
      page,
      limit,
    );

    return {
      withdrawals: result.withdrawals.map((w) => w.toJSON()),
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * 获取单个提现详情
   * GET /withdrawals/:id
   */
  @Get(':id')
  async getWithdrawal(
    @User('userId') userId: number,
    @Param('id') id: string,
  ) {
    const withdrawal = await this.withdrawalService.getWithdrawal(id, userId);
    return withdrawal.toJSON();
  }

  /**
   * 获取待处理提现列表（管理员）
   * GET /withdrawals/admin/pending
   */
  @Get('admin/pending')
  @UseGuards(AdminGuard)
  async getPendingWithdrawals(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const result = await this.withdrawalService.getPendingWithdrawals(page, limit);

    return {
      withdrawals: result.withdrawals.map((w) => w.toJSON()),
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * 审核通过提现申请（管理员）
   * POST /withdrawals/:id/approve
   */
  @Post(':id/approve')
  @UseGuards(AdminGuard)
  async approveWithdrawal(
    @Param('id') id: string,
    @User('userId') adminId: number,
  ) {
    const withdrawal = await this.withdrawalService.processWithdrawal(id, adminId);
    return withdrawal.toJSON();
  }

  /**
   * 拒绝提现申请（管理员）
   * POST /withdrawals/:id/reject
   */
  @Post(':id/reject')
  @UseGuards(AdminGuard)
  async rejectWithdrawal(
    @Param('id') id: string,
    @User('userId') adminId: number,
    @Body('reason') reason: string,
  ) {
    const withdrawal = await this.withdrawalService.rejectWithdrawal(
      id,
      adminId,
      reason,
    );
    return withdrawal.toJSON();
  }

  /**
   * 处理支付回调
   * POST /withdrawals/callback/:provider
   * 注意：此接口不需要JWT认证，由支付提供商直接调用
   */
  @Public()
  @Post('callback/:provider')
  async handleCallback(
    @Param('provider') provider: string,
    @Body() callbackData: any,
  ) {
    // 从回调数据中提取outTradeNo
    const outTradeNo = callbackData.out_trade_no || callbackData.partner_trade_no;

    if (!outTradeNo) {
      return {
        success: false,
        message: 'Missing out_trade_no',
      };
    }

    try {
      await this.withdrawalService.handlePaymentCallback(outTradeNo, callbackData);

      // 返回成功响应（根据不同支付提供商的要求格式化）
      if (provider.toUpperCase() === 'WECHAT') {
        return {
          return_code: 'SUCCESS',
          return_msg: 'OK',
        };
      } else if (provider.toUpperCase() === 'ALIPAY') {
        return 'success';
      }

      return { success: true };
    } catch (error: any) {
      // 返回失败响应
      if (provider.toUpperCase() === 'WECHAT') {
        return {
          return_code: 'FAIL',
          return_msg: error.message,
        };
      } else if (provider.toUpperCase() === 'ALIPAY') {
        return 'fail';
      }

      return {
        success: false,
        message: error.message,
      };
    }
  }
}
