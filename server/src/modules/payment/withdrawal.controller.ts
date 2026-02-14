import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@ApiTags('withdrawals')
@Controller('withdrawals')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  @ApiOperation({ summary: '创建提现申请' })
  @ApiResponse({ status: 201, description: '提现申请创建成功' })
  async create(@Body() dto: CreateWithdrawalDto) {
    return this.withdrawalService.requestWithdrawal({
      userId: BigInt(dto.userId),
      tenantId: dto.tenantId ? BigInt(dto.tenantId) : undefined,
      amount: dto.amount,
      provider: dto.provider,
      accountInfo: dto.accountInfo,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post(':id/process')
  @ApiOperation({ summary: '执行提现出款' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: '提现处理完成' })
  async process(@Param('id', ParseIntPipe) id: number) {
    return this.withdrawalService.processWithdrawal(BigInt(id));
  }

  @Post('notify')
  @ApiOperation({ summary: '提现回调通知' })
  @ApiResponse({ status: 200, description: '提现回调处理完成' })
  async notify(
    @Body()
    dto: {
      outTradeNo: string;
      status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
      providerTxnNo?: string;
      raw?: any;
    },
  ) {
    return this.withdrawalService.handleWithdrawalNotify(dto);
  }
}
