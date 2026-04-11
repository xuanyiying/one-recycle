import { Controller, Get, Request, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { RequestWithUser } from '@/common/types/auth.types';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('me')
  async getMyAccount(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.accountService.findAccountByUserId(userId);
  }

  @Get('me/stats')
  async getMyStats(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.accountService.getAccountStats(userId);
  }

  @Get('me/transactions')
  async getTransactions(
    @Request() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const userId = req.user.id;
    return this.accountService.getTransactions(userId, +page, +limit);
  }
}
