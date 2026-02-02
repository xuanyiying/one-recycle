import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import { SetPaymentPasswordDto } from './dto/payment-password.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('wallet')
  getWallet() {
    return this.financeService.getPlatformWallet();
  }

  @Get('recharge/plans')
  getRechargePlans() {
    return this.financeService.getRechargePlans();
  }

  @Post('recharge')
  createRecharge(@Body() dto: CreateRechargeDto) {
    return this.financeService.createRechargeOrder(dto);
  }

  @Post('recharge/mock-callback')
  mockCallback(@Body('orderNo') orderNo: string) {
    return this.financeService.mockPaySuccess(orderNo);
  }

  @Get('transactions')
  getTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    return this.financeService.getTransactions(page, limit, type);
  }

  @Post('payment-password')
  setPaymentPassword(@Body() dto: SetPaymentPasswordDto) {
    return this.financeService.setPaymentPassword(dto.password);
  }
}
