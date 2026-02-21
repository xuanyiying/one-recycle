import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentProvider, PaymentStatus, RefundStatus } from '@prisma/client';
import { toNumber } from '@/common/utils/decimal.util';
import {
  PersistentSnowflakeIdGenerator,
  RedisSnowflakeStateStore,
  RedisService,
} from '@/common';
import { PaymentProviderFactory } from './payment-provider.factory';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly paymentProviderFactory: PaymentProviderFactory,
  ) {
    this.idGenerator = new PersistentSnowflakeIdGenerator({
      workerId: this.configService.get<number>('PAYMENT_WORKER_ID', 9),
      datacenterId: this.configService.get<number>('DATACENTER_ID', 1),
      stateStore: new RedisSnowflakeStateStore(this.redisService),
      stateKey: 'snowflake:state:payment',
      metricsKey: 'snowflake:payment',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.idGenerator.initialize();
  }

  async create(createPaymentDto: CreatePaymentDto) {
    // 检查是否已有支付记录
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        orderId: BigInt(createPaymentDto.orderId),
        status: PaymentStatus.SUCCESS,
      },
    });

    if (existingPayment) {
      this.logger.warn(
        `Duplicate payment attempt for order ${createPaymentDto.orderId}`,
      );
      throw new ConflictException('订单已支付成功');
    }

    // 生成交易号
    const id = this.idGenerator.nextId();
    const transactionId = BigInt(id);
    const prefix = this.configService.get<string>(
      'PAYMENT_NUMBER_PREFIX',
      'OUT',
    );
    const outTradeNo = `${prefix}${id}`;

    this.logger.log(
      `Creating payment for order ${createPaymentDto.orderId}, transactionId: ${transactionId}`,
    );

    return this.prisma.payment.create({
      data: {
        orderId: BigInt(createPaymentDto.orderId),
        provider: createPaymentDto.provider as PaymentProvider,
        outTradeNo: outTradeNo,
        total: createPaymentDto.amount,
        status: PaymentStatus.PENDING,
        transactionId: transactionId,
      },
    });
  }

  async updatePaymentStatus(transactionId: bigint, status: PaymentStatus) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: transactionId },
    });

    if (!payment) {
      this.logger.error(`Payment not found for update: ${transactionId}`);
      throw new NotFoundException('支付记录不存在');
    }

    this.logger.log(`Updating payment ${transactionId} status to ${status}`);
    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: status, updatedAt: new Date() },
    });
  }

  async findOne(id: bigint) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: id },
      include: { refunds: true },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  async findByOrderId(orderId: bigint) {
    return this.prisma.payment.findMany({
      where: { orderId: orderId },
      include: { refunds: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRefund(paymentId: bigint, refundAmount: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new ConflictException('只有支付成功的订单才能退款');
    }

    if (refundAmount > toNumber(payment.total)) {
      throw new ConflictException('退款金额不能超过支付金额');
    }

    const outRefundNo = `REF${this.idGenerator.nextId()}`;
    this.logger.log(
      `Creating refund for payment ${paymentId}, amount: ${refundAmount}`,
    );

    return this.prisma.refund.create({
      data: {
        paymentId: paymentId,
        outRefundNo,
        refundAmount,
        reason,
        status: RefundStatus.PROCESSING,
      },
    });
  }

  async updateRefundStatus(refundId: bigint, status: RefundStatus) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException('退款记录不存在');
    }

    this.logger.log(`Updating refund ${refundId} status to ${status}`);
    return this.prisma.refund.update({
      where: { id: refundId },
      data: { status: status },
    });
  }

  async findByTransactionId(transactionId: bigint) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: transactionId },
      include: { refunds: true },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  async findByOutTradeNo(outTradeNo: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { outTradeNo },
      include: { refunds: true },
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  async findByRefundId(refundId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: BigInt(refundId) },
    });

    if (!refund) {
      throw new NotFoundException('退款记录不存在');
    }

    return refund;
  }

  async handlePaymentNotify(notifyData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { outTradeNo: notifyData.outTradeNo },
    });

    if (!payment) {
      this.logger.error(
        `Payment not found for notify: ${notifyData.outTradeNo}`,
      );
      throw new NotFoundException('支付记录不存在');
    }

    const newStatus =
      notifyData.tradeState === 'SUCCESS'
        ? PaymentStatus.SUCCESS
        : PaymentStatus.FAILED;

    this.logger.log(
      `Handling notify for ${notifyData.outTradeNo}, status: ${newStatus}`,
    );

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: notifyData.transactionId,
        status: newStatus,
        notifyRaw: notifyData.notifyRaw,
        updatedAt: new Date(),
      },
    });
  }

  async handleRefundNotify(notifyData: any) {
    const refund = await this.prisma.refund.findFirst({
      where: { outRefundNo: notifyData.outRefundNo },
    });

    if (!refund) {
      this.logger.error(
        `Refund not found for notify: ${notifyData.outRefundNo}`,
      );
      throw new NotFoundException('退款记录不存在');
    }

    const newStatus =
      notifyData.refundStatus === 'SUCCESS'
        ? RefundStatus.SUCCESS
        : RefundStatus.FAILED;

    this.logger.log(
      `Handling refund notify for ${notifyData.outRefundNo}, status: ${newStatus}`,
    );

    return this.prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: newStatus,
        notifyRaw: notifyData.notifyRaw,
        updatedAt: new Date(),
      },
    });
  }

  async getPaymentStats() {
    const totalPayments = await this.prisma.payment.count();
    const successfulPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.SUCCESS },
    });
    const failedPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.FAILED },
    });
    const pendingPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.PENDING },
    });

    const totalAmountResult = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCESS },
      select: { total: true },
    });
    const totalAmount = totalAmountResult.reduce(
      (sum, payment) => sum + toNumber(payment.total),
      0,
    );

    const totalRefunds = await this.prisma.refund.count();
    const totalRefundAmountResult = await this.prisma.refund.findMany({
      where: { status: RefundStatus.SUCCESS },
      select: { refundAmount: true },
    });
    const totalRefundAmount = totalRefundAmountResult.reduce(
      (sum, refund) => sum + toNumber(refund.refundAmount),
      0,
    );

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalAmount,
      totalRefunds,
      totalRefundAmount,
    };
  }

  // 支付日志相关方法
  async createPaymentLog(data: any) {
    return this.prisma.paymentLog.create({ data });
  }

  async getPaymentLogsByOrderId(orderId: bigint) {
    return this.prisma.paymentLog.findMany({
      where: { orderId: BigInt(orderId) },
    });
  }

  async getPaymentLogByTransactionId(transactionId: bigint) {
    return this.prisma.paymentLog.findFirst({
      where: { transactionId: transactionId },
    });
  }

  async isTransactionProcessed(transactionId: bigint) {
    return this.prisma.paymentLog.findFirst({
      where: { transactionId: transactionId, status: PaymentStatus.SUCCESS },
    });
  }

  async getPaymentStatsInRange(startDate: Date, endDate: Date) {
    return this.prisma.paymentLog.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
    });
  }

  /**
   * 转账给用户（企业付款到零钱/提现）
   * @param userId 用户ID
   * @param amount 金额
   * @param provider 支付渠道
   * @param accountInfo 账户信息
   * @param description 描述
   * @param orderId 关联订单ID
   */
  async transferToUser(
    userId: bigint,
    amount: number,
    provider: PaymentProvider,
    accountInfo: { openid?: string; realName?: string; accountNo?: string },
    description: string = 'Order Settlement',
    orderId: bigint = BigInt(0),
    outTradeNoOverride?: string,
  ) {
    // 1. 生成交易号
    const id = this.idGenerator.nextId();
    const transactionId = BigInt(id);
    const outTradeNo = outTradeNoOverride || `TR${id}`;

    this.logger.log(
      `Starting transfer to user ${userId} (Order: ${orderId}), amount: ${amount}, provider: ${provider}`,
    );

    // 2. 创建支付记录 (状态为 PENDING)
    // 注意：转账记录我们也放在 Payment 表中
    await this.prisma.payment.create({
      data: {
        orderId: orderId,
        transactionId,
        outTradeNo,
        total: amount,
        status: PaymentStatus.PENDING,
        provider,
      },
    });

    try {
      let result;
      // 3. 调用具体 Provider
      const paymentProvider = this.paymentProviderFactory.getProvider(provider);

      if (provider === PaymentProvider.WECHAT) {
        if (!accountInfo.openid) {
          throw new Error('WeChat transfer requires openid');
        }

        result = await paymentProvider.transfer(
          amount,
          {
            openid: accountInfo.openid,
            realName: accountInfo.realName,
          },
          outTradeNo,
          description,
        );
      } else {
        // Try generic transfer if supported by other providers
        result = await paymentProvider.transfer(
          amount,
          {
            openid: accountInfo.openid,
            realName: accountInfo.realName,
            alipayAccount: accountInfo.accountNo,
          },
          outTradeNo,
          description,
        );
      }

      // 4. 更新状态
      if (result.success) {
        this.logger.log(`Transfer success: ${transactionId}`);
        await this.updatePaymentStatus(transactionId, PaymentStatus.SUCCESS);
      } else {
        this.logger.warn(
          `Transfer failed: ${transactionId}, message: ${result.message}`,
        );
        await this.updatePaymentStatus(transactionId, PaymentStatus.FAILED);
        // Log failure reason
        await this.createPaymentLog({
          transactionId,
          orderId: orderId,
          amount,
          status: PaymentStatus.FAILED,
          provider,
          rawData: JSON.stringify(result),
        });
        throw new Error(result.message || 'Transfer failed');
      }

      return {
        ...result,
        transactionId,
        outTradeNo,
      };
    } catch (error) {
      this.logger.error(
        `Transfer exception: ${transactionId}`,
        error instanceof Error ? error.stack : String(error),
      );
      await this.updatePaymentStatus(transactionId, PaymentStatus.FAILED);
      await this.createPaymentLog({
        transactionId,
        orderId: orderId,
        amount,
        status: PaymentStatus.FAILED,
        provider,
        rawData: JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
      });
      throw error;
    }
  }
}
