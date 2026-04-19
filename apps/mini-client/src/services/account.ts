import { get } from '@/utils/request';
import offlineStorage, { CacheKeys, CacheTTL } from '@/utils/offlineStorage';
import { logger } from '@/utils/logger';
import type {
  Account,
  TransactionFilters,
  AccountStats,
  TransactionListResponse,
} from '@/types/account';

/**
 * Account Service
 * 账户相关API服务
 */
class AccountService {
  /**
   * 获取当前用户账户信息
   * GET /api/accounts/me
   */
  async getMyAccount(): Promise<Account> {
    try {
      // Fetch from API
      const result = await get('/accounts/me', undefined, { cache: true, cacheTTL: CacheTTL.MEDIUM });
      // Unwrap response if needed
      const account = result.success && result.data ? result.data : result;

      // Update offline storage
      await offlineStorage.set(CacheKeys.USER_PROFILE, account, { ttl: CacheTTL.LONG });

      return account;
    } catch (error) {
      // If API fails, try to return cached data
      const cached = await offlineStorage.get<Account>(CacheKeys.USER_PROFILE);
      if (cached) {
        logger.log('Returning cached account data due to API error');
        return cached;
      }
      throw error;
    }
  }

  /**
   * 获取当前用户交易记录
   * GET /api/accounts/me/transactions
   */
  async getMyTransactions(
    filters: TransactionFilters = {},
  ): Promise<TransactionListResponse> {
    const params: any = {};

    if (filters.type) {
      params.type = filters.type;
    }
    if (filters.startDate) {
      params.startDate = filters.startDate;
    }
    if (filters.endDate) {
      params.endDate = filters.endDate;
    }
    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }

    const result = await get('/accounts/me/transactions', params);
    return result.success && result.data ? result.data : result;
  }

  /**
   * 获取当前用户账户统计
   * GET /api/accounts/me/stats
   */
  async getMyStats(): Promise<AccountStats> {
    const result = await get('/accounts/me/stats');
    return result.success && result.data ? result.data : result;
  }

  /**
   * 格式化金额显示
   * @param amount 金额
   * @returns 格式化后的金额字符串
   */
  formatAmount(amount: number | string): string {
    return `¥${Number(amount || 0).toFixed(2)}`;
  }

  /**
   * 获取交易类型显示文本
   * @param type 交易类型
   * @returns 显示文本
   */
  getTransactionTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      ORDER_INCOME: '订单收入',
      WITHDRAWAL_FREEZE: '提现冻结',
      WITHDRAWAL_SUCCESS: '提现成功',
      WITHDRAWAL_FAILED: '提现失败',
      WITHDRAWAL_UNFREEZE: '提现解冻',
      REFUND: '退款',
    };
    return typeMap[type] || type;
  }

  /**
   * 获取交易类型颜色
   * @param type 交易类型
   * @returns 颜色类名
   */
  getTransactionTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      ORDER_INCOME: 'success', // 绿色
      WITHDRAWAL_FREEZE: 'warning', // 橙色
      WITHDRAWAL_SUCCESS: 'danger', // 红色
      WITHDRAWAL_FAILED: 'default', // 灰色
      WITHDRAWAL_UNFREEZE: 'primary', // 蓝色
      REFUND: 'warning', // 橙色
    };
    return colorMap[type] || 'default';
  }

  /**
   * 获取交易金额符号
   * @param type 交易类型
   * @returns + 或 -
   */
  getTransactionAmountSign(type: string): string {
    const positiveTypes = ['ORDER_INCOME', 'WITHDRAWAL_UNFREEZE'];
    return positiveTypes.includes(type) ? '+' : '-';
  }
}

export default new AccountService();
