import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import {
  CreateAccountDto,
  IncreaseBalanceDto,
  FreezeBalanceDto,
  DeductFrozenBalanceDto,
  UnfreezeBalanceDto,
  TransactionFiltersDto,
  AccountStatsDto,
} from './dto';
import { Account, Transaction } from './entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('accounts')
export class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private readonly accountService: AccountService) {}

  /**
   * 获取当前用户账户信息
   * GET /accounts/me
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyAccount(@User() user: any): Promise<Account> {
    this.logger.log(`Getting account for user ${user.id}`);
    return this.accountService.getAccount(user.id);
  }

  /**
   * 获取当前用户交易记录
   * GET /accounts/me/transactions
   */
  @Get('me/transactions')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(
    @User() user: any,
    @Query() filters: TransactionFiltersDto,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    this.logger.log(`Getting transactions for user ${user.id}`);
    
    // Convert string dates to Date objects
    const processedFilters = {
      type: filters.type,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };
    
    return this.accountService.getTransactions(
      user.id,
      processedFilters,
      filters.page || 1,
      filters.limit || 50,
    );
  }

  /**
   * 获取当前用户账户统计
   * GET /accounts/me/stats
   */
  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@User() user: any): Promise<AccountStatsDto> {
    this.logger.log(`Getting stats for user ${user.id}`);
    return this.accountService.getAccountStats(user.id);
  }

  /**
   * 管理员查询用户账户信息
   * GET /accounts/:userId
   */
  @Get(':userId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAccount(@Param('userId') userId: string): Promise<Account> {
    this.logger.log(`Admin getting account for user ${userId}`);
    return this.accountService.getAccount(Number(userId));
  }

  /**
   * 管理员查询用户交易记录
   * GET /accounts/:userId/transactions
   */
  @Get(':userId/transactions')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getTransactions(
    @Param('userId') userId: string,
    @Query() filters: TransactionFiltersDto,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    this.logger.log(`Admin getting transactions for user ${userId}`);
    
    // Convert string dates to Date objects
    const processedFilters = {
      type: filters.type,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };
    
    return this.accountService.getTransactions(
      Number(userId),
      processedFilters,
      filters.page || 1,
      filters.limit || 50,
    );
  }

  /**
   * 创建账户（内部API）
   * POST /accounts
   */
  @Post()
  async createAccount(@Body() dto: CreateAccountDto): Promise<Account> {
    this.logger.log(`Creating account for user ${dto.userId}`);
    return this.accountService.createAccount(dto.userId);
  }

  /**
   * 增加余额（内部API，用于订单完成后积分入账）
   * POST /accounts/increase
   */
  @Post('increase')
  async increaseBalance(
    @Body() dto: IncreaseBalanceDto,
  ): Promise<Transaction> {
    this.logger.log(
      `Increasing balance for user ${dto.userId}, amount: ${dto.amount}`,
    );
    return this.accountService.increaseBalance(
      dto.userId,
      dto.amount,
      dto.orderId,
      dto.description || `订单收入 - ${dto.orderId}`,
    );
  }

  /**
   * 冻结余额（内部API，用于提现申请）
   * POST /accounts/freeze
   */
  @Post('freeze')
  async freezeBalance(@Body() dto: FreezeBalanceDto): Promise<Transaction> {
    this.logger.log(
      `Freezing balance for user ${dto.userId}, amount: ${dto.amount}`,
    );
    return this.accountService.freezeBalance(
      dto.userId,
      dto.amount,
      dto.withdrawalId,
    );
  }

  /**
   * 扣除冻结余额（内部API，用于提现成功）
   * POST /accounts/deduct-frozen
   */
  @Post('deduct-frozen')
  async deductFrozenBalance(
    @Body() dto: DeductFrozenBalanceDto,
  ): Promise<Transaction> {
    this.logger.log(
      `Deducting frozen balance for user ${dto.userId}, amount: ${dto.amount}`,
    );
    return this.accountService.deductFrozenBalance(
      dto.userId,
      dto.amount,
      dto.withdrawalId,
    );
  }

  /**
   * 解冻余额（内部API，用于提现失败/拒绝）
   * POST /accounts/unfreeze
   */
  @Post('unfreeze')
  async unfreezeBalance(
    @Body() dto: UnfreezeBalanceDto,
  ): Promise<Transaction> {
    this.logger.log(
      `Unfreezing balance for user ${dto.userId}, amount: ${dto.amount}`,
    );
    return this.accountService.unfreezeBalance(
      dto.userId,
      dto.amount,
      dto.withdrawalId,
    );
  }

  /**
   * 退款（内部API，用于订单取消）
   * POST /accounts/refund
   */
  @Post('refund')
  async refundBalance(
    @Body() dto: { userId: number; amount: number; orderId: string; description?: string },
  ): Promise<Transaction> {
    this.logger.log(
      `Processing refund for user ${dto.userId}, amount: ${dto.amount}, orderId: ${dto.orderId}`,
    );
    return this.accountService.refundBalance(
      dto.userId,
      dto.amount,
      dto.orderId,
      dto.description || `订单取消退款 - ${dto.orderId}`,
    );
  }
}
