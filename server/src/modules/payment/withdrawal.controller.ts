import { ForbiddenException } from '@/common';
import { Public } from '@/common/decorators/auth.decorator';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { Request, Response } from 'express';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { QueryWithdrawalDto } from './dto/query-withdrawal.dto';
import { WithdrawalNotifyDto } from './dto/withdrawal-notify.dto';
import WithdrawalService from './withdrawal.service';

@ApiTags('withdrawals')
@Controller('withdrawals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Get('my')
  @ApiOperation({ summary: '查询当前用户提现列表' })
  async findMyWithdrawals(
    @Req() req: Request,
    @Query() query: QueryWithdrawalDto,
  ): Promise<any> {
    const userId = (req as any).user?.sub;
    return this.withdrawalService.findWithdrawals({
      ...query,
      userId: String(userId),
    });
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '查询提现列表（管理员）' })
  async findAll(@Query() query: QueryWithdrawalDto): Promise<any> {
    return this.withdrawalService.findWithdrawals(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '查询提现详情' })
  @ApiParam({ name: 'id', type: Number })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<any> {
    const userId = (req as any).user?.sub;
    const isAdmin = (req as any).user?.role === 'ADMIN';
    const withdrawal = await this.withdrawalService.findWithdrawalById(
      BigInt(id),
    );
    if (!isAdmin && String(withdrawal.userId) !== String(userId)) {
      throw new ForbiddenException('无权访问该提现记录');
    }
    return withdrawal;
  }

  @Post()
  @ApiOperation({ summary: '创建提现申请' })
  @ApiResponse({ status: 201, description: '提现申请创建成功' })
  async create(@Body() dto: CreateWithdrawalDto): Promise<any> {
    return this.withdrawalService.requestWithdrawal({
      userId: BigInt(dto.userId),
      tenantId: dto.tenantId ? BigInt(dto.tenantId) : undefined,
      amount: dto.amount,
      provider: dto.provider,
      accountInfo: dto.accountInfo,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post('notify')
  @Public()
  @ApiOperation({ summary: '提现回调通知（第三方支付平台回调端点，无需认证）' })
  @ApiResponse({ status: 200, description: '提现回调处理完成' })
  async notify(
    @Body() dto: WithdrawalNotifyDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const withdrawal =
        await this.withdrawalService.handleWithdrawalNotify(dto);
      const provider = (withdrawal as any)?.provider as PaymentProvider;

      if (provider === PaymentProvider.WECHAT) {
        res
          .contentType('application/xml')
          .send('<xml><return_code>SUCCESS</return_code></xml>');
      } else {
        res.contentType('text/plain').send('success');
      }
    } catch (error) {
      let provider: PaymentProvider | undefined;
      try {
        const withdrawal = await this.withdrawalService.findByOutTradeNo(
          dto.outTradeNo,
        );
        provider = (withdrawal as any)?.provider as PaymentProvider;
      } catch {
        provider = undefined;
      }

      if (provider === PaymentProvider.WECHAT) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        res
          .contentType('application/xml')
          .send(
            `<xml><return_code>FAIL</return_code><return_msg>${msg}</return_msg></xml>`,
          );
      } else {
        res.contentType('text/plain').send('fail');
      }
    }
  }
}
