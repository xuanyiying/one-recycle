import { get, post } from '../utils/request';
import type {
  Withdrawal,
  CreateWithdrawalRequest,
  WithdrawalFilters,
  WithdrawalListResponse,
  WithdrawalStatus,
  WithdrawalProvider,
} from '../types/withdrawal';

/**
 * Withdrawal Service
 * 提现相关API服务
 */
class WithdrawalService {
  /**
   * 创建提现申请
   * POST /api/withdrawals
   */
  async createWithdrawal(data: CreateWithdrawalRequest): Promise<Withdrawal> {
    return post('/withdrawals', data);
  }

  /**
   * 获取当前用户提现记录
   * GET /api/withdrawals/me
   */
  async getMyWithdrawals(
    filters: WithdrawalFilters = {},
  ): Promise<WithdrawalListResponse> {
    const params: any = {};

    if (filters.status) {
      params.status = filters.status;
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

    return get('/api/withdrawals/me', params);
  }

  /**
   * 获取单个提现详情
   * GET /api/withdrawals/:id
   */
  async getWithdrawal(id: string): Promise<Withdrawal> {
    return get(`/api/withdrawals/${id}`);
  }

  /**
   * 验证提现金额
   * @param amount 提现金额
   * @param availableBalance 可用余额
   * @returns 验证结果
   */
  validateWithdrawalAmount(
    amount: number,
    availableBalance: number,
  ): { valid: boolean; message?: string } {
    const MIN_AMOUNT = 10;

    if (!amount || amount <= 0) {
      return { valid: false, message: '请输入提现金额' };
    }

    if (amount < MIN_AMOUNT) {
      return { valid: false, message: `最低提现金额为¥${MIN_AMOUNT}` };
    }

    if (amount > availableBalance) {
      return { valid: false, message: '提现金额不能超过可用余额' };
    }

    return { valid: true };
  }

  /**
   * 获取提现状态显示文本
   * @param status 提现状态
   * @returns 显示文本
   */
  getStatusText(status: WithdrawalStatus): string {
    const statusMap: Record<WithdrawalStatus, string> = {
      PENDING: '待处理',
      PROCESSING: '处理中',
      SUCCESS: '已成功',
      FAILED: '已失败',
      REJECTED: '已拒绝',
    };
    return statusMap[status] || status;
  }

  /**
   * 获取提现状态颜色
   * @param status 提现状态
   * @returns 颜色类名
   */
  getStatusColor(status: WithdrawalStatus): string {
    const colorMap: Record<WithdrawalStatus, string> = {
      PENDING: 'warning',
      PROCESSING: 'primary',
      SUCCESS: 'success',
      FAILED: 'danger',
      REJECTED: 'danger',
    };
    return colorMap[status] || 'default';
  }

  /**
   * 获取支付方式显示文本
   * @param provider 支付方式
   * @returns 显示文本
   */
  getProviderText(provider: WithdrawalProvider): string {
    const providerMap: Record<WithdrawalProvider, string> = {
      WECHAT: '微信',
      ALIPAY: '支付宝',
    };
    return providerMap[provider] || provider;
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
   * 格式化时间显示
   * @param dateString 时间字符串
   * @returns 格式化后的时间字符串
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}

export default new WithdrawalService();
