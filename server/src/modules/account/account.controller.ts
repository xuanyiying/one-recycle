import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/common/types/auth.types';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('me')
  async getMyAccount(@Request() req: RequestWithUser) {
    // req.user is populated by JwtStrategy
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
