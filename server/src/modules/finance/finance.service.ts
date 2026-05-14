import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { toDecimal } from '@/common/utils/decimal.util';
import { generateorderNo } from '@/common/utils/common.util';
import { PaymentConfig } from '@/config/payment.config';
import { RedisService } from '@/common';

const PASSWORD_SALT_LENGTH = 16;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_ITERATIONS = 100000;

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);
  private readonly mockPayBaseUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    this.mockPayBaseUrl =
      this.configService.get<PaymentConfig>('payment')?.mockPayBaseUrl ||
      'https://mock-pay.com/pay';
  }

  async getPlatformWallet() {
    let wallet = await this.prisma.platformWallet.findFirst();
    if (!wallet) {
      wallet = await this.prisma.platformWallet.create({
        data: {},
      });
    }
    return wallet;
  }

  async getRechargePlans() {
    const plans = await this.prisma.rechargePlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (plans.length === 0) {
      const defaultAmounts = [500, 1000, 2000, 5000, 10000, 20000, 50000];
      const newPlans = await this.prisma.$transaction(
        defaultAmounts.map((amount, index) =>
          this.prisma.rechargePlan.create({
            data: {
              amount,
              bonus: 0,
              sortOrder: index,
            },
          }),
        ),
      );
      return newPlans;
    }

    return plans;
  }

  async createRechargeOrder(dto: CreateRechargeDto, tenantId?: string) {
    const orderNo = generateorderNo('RC');

    await this.prisma.rechargeOrder.create({
      data: {
        orderNo,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Created recharge order ${orderNo} for amount ${dto.amount}, tenantId: ${tenantId || 'platform'}`,
    );

    const payUrl = `${this.mockPayBaseUrl}?orderNo=${orderNo}&amount=${dto.amount}`;

    return {
      orderNo,
      payUrl,
      tenantId,
    };
  }

  async mockPaySuccess(orderNo: string, tenantId?: string) {
    // 防重入：使用 Redis 分布式锁
    return this.redisService.withLock(
      `finance:recharge:${orderNo}`,
      async () => {
        const order = await this.prisma.rechargeOrder.findUnique({
          where: { orderNo },
        });

        if (!order || order.status !== 'PENDING') {
          throw new BadRequestException('Order invalid or already paid');
        }

        const wallet = await this.getPlatformWallet();
        const rechargeAmount = toDecimal(order.amount);

        if (tenantId) {
          return this.processTenantRecharge(
            order,
            wallet,
            rechargeAmount,
            tenantId,
          );
        } else {
          return this.processPlatformRecharge(order, wallet, rechargeAmount);
        }
      },
      30, // 30秒锁超时
    );
  }

  private async processTenantRecharge(
    order: any,
    wallet: any,
    rechargeAmount: Prisma.Decimal,
    tenantId: string,
  ) {
    const tid = BigInt(tenantId);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tid },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.rechargeOrder.update({
        where: { id: order.id },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      });

      const updatedWallet = await tx.platformWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: rechargeAmount },
          totalRecharge: { increment: rechargeAmount },
          version: { increment: 1 },
        },
      });

      await tx.platformTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'RECHARGE',
          amount: rechargeAmount,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          relatedOrderNo: order.orderNo,
          description: `租户充值 - 租户ID: ${tenantId}`,
        },
      });

      const updatedTenant = await tx.tenant.update({
        where: { id: tid },
        data: {
          balance: { increment: rechargeAmount },
          version: { increment: 1 },
        },
      });

      await tx.tenantTransaction.create({
        data: {
          tenantId: tid,
          type: 'ADJUSTMENT',
          amount: rechargeAmount,
          balanceAfter: updatedTenant.balance,
          relatedType: 'RECHARGE',
          relatedId: order.orderNo,
          remark: `充值入账 - 订单号: ${order.orderNo}`,
        },
      });

      this.logger.log(
        `Tenant recharge completed: orderNo=${order.orderNo}, tenantId=${tenantId}, amount=${rechargeAmount.toString()}`,
      );

      return {
        wallet: updatedWallet,
        tenant: updatedTenant,
      };
    });

    return result;
  }

  private async processPlatformRecharge(
    order: any,
    wallet: any,
    rechargeAmount: Prisma.Decimal,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.rechargeOrder.update({
        where: { id: order.id },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      });

      const updatedWallet = await tx.platformWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: rechargeAmount },
          totalRecharge: { increment: rechargeAmount },
          version: { increment: 1 },
        },
      });

      await tx.platformTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'RECHARGE',
          amount: rechargeAmount,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          relatedOrderNo: order.orderNo,
          description: `平台充值 ${rechargeAmount.toString()} 元`,
        },
      });

      this.logger.log(
        `Platform recharge completed: orderNo=${order.orderNo}, amount=${rechargeAmount.toString()}`,
      );

      return updatedWallet;
    });
  }

  async getTransactions(page: number = 1, limit: number = 20, type?: string) {
    const skip = (page - 1) * limit;
    const where = type ? { type } : {};

    const [data, total] = await Promise.all([
      this.prisma.platformTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.platformTransaction.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async setPaymentPassword(password: string) {
    const wallet = await this.getPlatformWallet();
    const hashedPassword = this.hashPassword(password);

    return this.prisma.platformWallet.update({
      where: { id: wallet.id },
      data: { paymentPassword: hashedPassword },
    });
  }

  /**
   * 验证支付密码
   */
  async verifyPaymentPassword(password: string): Promise<boolean> {
    const wallet = await this.getPlatformWallet();
    if (!wallet.paymentPassword) {
      return false;
    }
    return this.verifyPassword(password, wallet.paymentPassword);
  }

  /**
   * 使用 scrypt 加盐哈希密码
   * 格式: iterations$salt(hex)$hash(hex)
   */
  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(PASSWORD_SALT_LENGTH);
    const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH, {
      N: PASSWORD_ITERATIONS,
    });
    return `${PASSWORD_ITERATIONS}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
  }

  /**
   * 验证密码
   */
  private verifyPassword(password: string, storedHash: string): boolean {
    // 兼容旧的 SHA256 格式（无 $ 分隔符）
    if (!storedHash.includes('$')) {
      const legacyHash = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');
      return legacyHash === storedHash;
    }

    const parts = storedHash.split('$');
    if (parts.length !== 3) {
      return false;
    }

    const iterations = parseInt(parts[0], 10);
    const salt = Buffer.from(parts[1], 'hex');
    const storedKey = parts[2];

    const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH, {
      N: iterations,
    });

    return crypto.timingSafeEqual(Buffer.from(storedKey, 'hex'), derivedKey);
  }

  async getTenantBalance(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
      select: {
        id: true,
        name: true,
        balance: true,
        frozenBalance: true,
        version: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    return tenant;
  }

  async getTenantTransactions(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const tid = BigInt(tenantId);

    const [data, total] = await Promise.all([
      this.prisma.tenantTransaction.findMany({
        where: { tenantId: tid },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.tenantTransaction.count({ where: { tenantId: tid } }),
    ]);

    return { data, total, page, limit };
  }

  async getExpenses(
    page: number = 1,
    limit: number = 10,
    filters?: {
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      orderNo?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: Prisma.OrderWhereInput = {};

    if (filters?.orderNo) {
      where.orderNo = { contains: filters.orderNo };
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Determine sort order
    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (
      filters?.sortBy &&
      ['createdAt', 'amount', 'updatedAt'].includes(filters.sortBy)
    ) {
      (orderBy as any)[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Get completed orders with payments as expense records
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          status: 'COMPLETED',
          ...where,
        },
        include: {
          user: {
            select: {
              id: true,
              realName: true,
              mobile: true,
            },
          },
          items: {
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          logisticsOrder: {
            select: {
              logisticsCompany: true,
              logisticsNo: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          status: 'COMPLETED',
          ...where,
        },
      }),
    ]);

    // Map orders to expense records
    const items = orders.map((order) => {
      const categoryName = order.items[0]?.category?.name || '未知分类';
      const quantity = order.items.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0,
      );
      const unitPrice = order.items[0]?.unitPrice?.toNumber() || 0;

      return {
        id: String(order.id),
        type: 'recycle_payment' as const,
        amount:
          order.settlementAmount?.toNumber() ||
          order.payAmount?.toNumber() ||
          0,
        orderId: String(order.id),
        orderNo: order.orderNo,
        userId: String(order.userId),
        userName: order.user?.realName || '未知用户',
        userPhone: order.user?.mobile || '',
        categoryName,
        quantity,
        unitPrice,
        expressCompany: order.logisticsOrder?.logisticsCompany,
        expressNo: order.logisticsOrder?.logisticsNo,
        status: 'COMPLETED' as const,
        paymentDate: order.completedAt?.toISOString(),
        description: `回收订单支付 - ${order.orderNo}`,
        createdAt: order.createdAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getExpenseStats(startDate?: string, endDate?: string) {
    // Build date filter
    const dateFilter: Prisma.OrderWhereInput = {};
    if (startDate || endDate) {
      dateFilter.completedAt = {};
      if (startDate) {
        dateFilter.completedAt.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.completedAt.lte = new Date(endDate);
      }
    }

    // Get all completed orders within date range
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        ...dateFilter,
      },
      include: {
        items: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Calculate totals
    let totalExpense = 0;
    let recyclePaymentTotal = 0;
    const expressFeeTotal = 0;
    let todayExpense = 0;
    let monthExpense = 0;
    const pendingCount = 0;
    const completedCount = orders.length;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const trendMap = new Map<
      string,
      { recyclePayment: number; expressFee: number }
    >();
    const categoryMap = new Map<string, { amount: number; count: number }>();

    orders.forEach((order) => {
      const amount =
        order.settlementAmount?.toNumber() || order.payAmount?.toNumber() || 0;
      const orderDate = order.completedAt || order.createdAt;

      totalExpense += amount;
      recyclePaymentTotal += amount;

      // Today's expense
      if (orderDate >= today) {
        todayExpense += amount;
      }

      // This month's expense
      if (orderDate >= monthStart) {
        monthExpense += amount;
      }

      // Trend data
      const dateKey = orderDate.toISOString().split('T')[0];
      const existing = trendMap.get(dateKey) || {
        recyclePayment: 0,
        expressFee: 0,
      };
      existing.recyclePayment += amount;
      trendMap.set(dateKey, existing);

      // Category breakdown
      order.items.forEach((item) => {
        const catName = item.category?.name || '未知分类';
        const itemAmount = item.amount?.toNumber() || 0;
        const cat = categoryMap.get(catName) || { amount: 0, count: 0 };
        cat.amount += itemAmount;
        cat.count += 1;
        categoryMap.set(catName, cat);
      });
    });

    // Convert trend map to array (last 30 days)
    const trendData = Array.from(trendMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, data]) => ({
        date,
        recyclePayment: data.recyclePayment,
        expressFee: data.expressFee,
      }));

    // Convert category map to array
    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([categoryName, data]) => ({
        categoryName,
        amount: data.amount,
        count: data.count,
      }),
    );

    return {
      totalExpense,
      recyclePaymentTotal,
      expressFeeTotal,
      todayExpense,
      monthExpense,
      pendingCount,
      completedCount,
      trendData,
      categoryBreakdown,
    };
  }
}
