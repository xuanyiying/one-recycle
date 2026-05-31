import {
  PersistentSnowflakeIdGenerator,
  QUEUE_NAMES,
  RedisService,
  RedisSnowflakeStateStore,
} from '@/common';
import { toNumber } from '@/common/utils/decimal.util';
import { PrismaService } from '@/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentProvider,
  PaymentStatus,
  Prisma,
  RefundStatus,
} from '@prisma/client';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentProviderFactory } from './payment-provider.factory';

interface PaymentLogData {
  transactionId: bigint;
  orderId: bigint;
  amount: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  rawData?: string;
  processedAt?: Date;
}

/**
 * 支付回调通知数据接口
 */
export interface PaymentNotifyData {
  outTradeNo: string;
  transactionId?: string;
  tradeState: string;
  notifyRaw?: any;
  /** 签名信息 */
  sign?: string;
  signType?: string;
  /** 支付提供商原始数据（用于签名验证） */
  rawData?: string;
}

/**
 * 退款回调通知数据接口
 */
export interface RefundNotifyData {
  outRefundNo: string;
  refundStatus: string;
  notifyRaw?: any;
  /** 签名信息 */
  sign?: string;
  signType?: string;
  /** 支付提供商原始数据（用于签名验证） */
  rawData?: string;
}

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);
  private readonly idGenerator: PersistentSnowflakeIdGenerator;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly paymentProviderFactory: PaymentProviderFactory,
    @InjectQueue(QUEUE_NAMES.PAYMENT_TIMEOUT)
    private readonly paymentTimeoutQueue: Queue,
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
    const existingPayments = await this.prisma.payment.findMany({
      where: {
        orderId: BigInt(createPaymentDto.orderId),
        status: { in: [PaymentStatus.PENDING, PaymentStatus.SUCCESS] },
      },
      orderBy: { createdAt: 'desc' },
    });

    const existingSuccess = existingPayments.find(
      (p) => p.status === PaymentStatus.SUCCESS,
    );
    if (existingSuccess) {
      this.logger.warn(
        `Duplicate payment attempt for order ${createPaymentDto.orderId}`,
      );
      throw new ConflictException('订单已支付成功');
    }

    const existingPending = existingPayments.find(
      (p) => p.status === PaymentStatus.PENDING,
    );
    if (existingPending) {
      const timeoutMinutes = this.configService.get<number>(
        'PAYMENT_TIMEOUT_MINUTES',
        30,
      );
      const elapsed = Date.now() - existingPending.createdAt.getTime();
      if (elapsed > timeoutMinutes * 60 * 1000) {
        await this.prisma.payment.update({
          where: { id: existingPending.id },
          data: { status: PaymentStatus.FAILED, closedAt: new Date() },
        });
      } else {
        return existingPending;
      }
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

    const payment = await this.prisma.payment.create({
      data: {
        orderId: BigInt(createPaymentDto.orderId),
        provider: createPaymentDto.provider,
        outTradeNo: outTradeNo,
        total: createPaymentDto.amount,
        status: PaymentStatus.PENDING,
        transactionId: transactionId,
      },
    });

    const timeoutMinutes = this.configService.get<number>(
      'PAYMENT_TIMEOUT_MINUTES',
      30,
    );
    await this.paymentTimeoutQueue.add(
      'payment-timeout',
      { paymentId: payment.id },
      { delay: timeoutMinutes * 60 * 1000 },
    );

    return payment;
  }

  async updatePaymentStatus(transactionId: bigint, status: PaymentStatus) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: transactionId },
    });

    if (!payment) {
      this.logger.error(`Payment not found for update: ${transactionId}`);
      throw new NotFoundException('支付记录不存在');
    }

    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.SUCCESS, PaymentStatus.FAILED],
      [PaymentStatus.SUCCESS]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [],
      [PaymentStatus.REFUNDED]: [],
    };

    const allowed = validTransitions[payment.status];
    if (!allowed || !allowed.includes(status)) {
      throw new ConflictException(
        `非法的支付状态转换: ${payment.status} -> ${status}`,
      );
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

    if (refundAmount <= 0) {
      throw new ConflictException('退款金额必须大于0');
    }

    const refundDecimal = new Prisma.Decimal(refundAmount);
    if (refundDecimal.greaterThan(payment.total)) {
      throw new ConflictException('退款金额不能超过支付金额');
    }

    const existingRefunds = await this.prisma.refund.findMany({
      where: {
        paymentId: paymentId,
        status: { in: [RefundStatus.SUCCESS, RefundStatus.PROCESSING] },
      },
      select: { refundAmount: true },
    });

    const cumulativeRefund = existingRefunds.reduce(
      (sum, r) => sum.plus(new Prisma.Decimal(r.refundAmount)),
      new Prisma.Decimal(0),
    );

    if (cumulativeRefund.plus(refundDecimal).greaterThan(payment.total)) {
      throw new ConflictException('累计退款金额不能超过支付金额');
    }

    const outRefundNo = `REF${this.idGenerator.nextId()}`;
    this.logger.log(
      `Creating refund for payment ${paymentId}, amount: ${refundAmount}`,
    );

    const refund = await this.prisma.refund.create({
      data: {
        paymentId: paymentId,
        outRefundNo,
        refundAmount,
        reason,
        status: RefundStatus.PROCESSING,
      },
    });

    try {
      const provider = this.paymentProviderFactory.getProvider(
        payment.provider,
      );
      const result = await provider.refund(
        payment.outTradeNo,
        outRefundNo,
        payment.total.toNumber(),
        refundAmount,
        reason,
      );

      if (!result.success) {
        await this.prisma.refund.update({
          where: { id: refund.id },
          data: { status: RefundStatus.FAILED },
        });
        throw new ConflictException(result.message || '退款请求失败');
      }

      return this.prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: RefundStatus.SUCCESS,
          notifyRaw: JSON.stringify({ refundId: result.refundId }),
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      await this.prisma.refund.update({
        where: { id: refund.id },
        data: { status: RefundStatus.FAILED },
      });
      throw error;
    }
  }

  async updateRefundStatus(refundId: bigint, status: RefundStatus) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException('退款记录不存在');
    }

    const validTransitions: Record<RefundStatus, RefundStatus[]> = {
      [RefundStatus.PROCESSING]: [RefundStatus.SUCCESS, RefundStatus.FAILED],
      [RefundStatus.SUCCESS]: [],
      [RefundStatus.FAILED]: [],
    };

    const allowed = validTransitions[refund.status];
    if (!allowed || !allowed.includes(status)) {
      throw new ConflictException(
        `非法的退款状态转换: ${refund.status} -> ${status}`,
      );
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

  async findRefundByOutRefundNo(outRefundNo: string) {
    const refund = await this.prisma.refund.findFirst({
      where: { outRefundNo },
      include: { payment: true },
    });

    if (!refund) {
      throw new NotFoundException('退款记录不存在');
    }

    return refund;
  }

  async handlePaymentNotify(notifyData: PaymentNotifyData) {
    const payment = await this.prisma.payment.findFirst({
      where: { outTradeNo: notifyData.outTradeNo },
    });

    if (!payment) {
      this.logger.error(
        `Payment not found for notify: ${notifyData.outTradeNo}`,
      );
      throw new NotFoundException('支付记录不存在');
    }

    if (!this.verifyPaymentNotifySignature(notifyData, payment.provider)) {
      this.logger.error(
        `Payment notify signature verification failed for outTradeNo: ${notifyData.outTradeNo}`,
      );
      throw new BadRequestException('支付回调签名验证失败');
    }

    if (
      payment.status === PaymentStatus.SUCCESS ||
      payment.status === PaymentStatus.FAILED
    ) {
      this.logger.warn(
        `Payment already processed: ${notifyData.outTradeNo}, status: ${payment.status}`,
      );
      return payment;
    }

    const newStatus =
      notifyData.tradeState === 'SUCCESS'
        ? PaymentStatus.SUCCESS
        : PaymentStatus.FAILED;

    this.logger.log(
      `Handling notify for ${notifyData.outTradeNo}, status: ${newStatus}`,
    );

    const updated = await this.prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: PaymentStatus.PENDING,
      },
      data: {
        transactionId: notifyData.transactionId
          ? BigInt(notifyData.transactionId)
          : undefined,
        status: newStatus,
        notifyRaw: notifyData.notifyRaw,
        updatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      this.logger.warn(
        `Payment already updated by another request: ${notifyData.outTradeNo}`,
      );
      return this.prisma.payment.findUnique({ where: { id: payment.id } });
    }

    return this.prisma.payment.findUnique({ where: { id: payment.id } });
  }

  async handleRefundNotify(notifyData: RefundNotifyData) {
    const refund = await this.prisma.refund.findFirst({
      where: { outRefundNo: notifyData.outRefundNo },
      include: { payment: true },
    });

    if (!refund) {
      this.logger.error(
        `Refund not found for notify: ${notifyData.outRefundNo}`,
      );
      throw new NotFoundException('退款记录不存在');
    }

    if (
      !this.verifyRefundNotifySignature(notifyData, refund.payment.provider)
    ) {
      this.logger.error(
        `Refund notify signature verification failed for outRefundNo: ${notifyData.outRefundNo}`,
      );
      throw new BadRequestException('退款回调签名验证失败');
    }

    if (
      refund.status === RefundStatus.SUCCESS ||
      refund.status === RefundStatus.FAILED
    ) {
      this.logger.warn(
        `Refund already processed: ${notifyData.outRefundNo}, status: ${refund.status}`,
      );
      return this.prisma.refund.findUnique({
        where: { id: refund.id },
        include: { payment: true },
      });
    }

    const newStatus =
      notifyData.refundStatus === 'SUCCESS'
        ? RefundStatus.SUCCESS
        : RefundStatus.FAILED;

    this.logger.log(
      `Handling refund notify for ${notifyData.outRefundNo}, status: ${newStatus}`,
    );

    const updated = await this.prisma.refund.updateMany({
      where: {
        id: refund.id,
        status: RefundStatus.PROCESSING,
      },
      data: {
        status: newStatus,
        notifyRaw: notifyData.notifyRaw,
        updatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      this.logger.warn(
        `Refund already updated by another request: ${notifyData.outRefundNo}`,
      );
      return this.prisma.refund.findUnique({
        where: { id: refund.id },
        include: { payment: true },
      });
    }

    if (newStatus === RefundStatus.SUCCESS) {
      const allRefunds = await this.prisma.refund.findMany({
        where: { paymentId: refund.paymentId, status: RefundStatus.SUCCESS },
        select: { refundAmount: true },
      });
      const totalRefunded = allRefunds.reduce(
        (sum, r) => sum.plus(new Prisma.Decimal(r.refundAmount)),
        new Prisma.Decimal(0),
      );
      const payment = await this.prisma.payment.findUnique({
        where: { id: refund.paymentId },
      });
      if (payment && totalRefunded.greaterThanOrEqualTo(payment.total)) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }
    }

    return this.prisma.refund.findUnique({
      where: { id: refund.id },
      include: { payment: true },
    });
  }

  private verifyPaymentNotifySignature(
    notifyData: PaymentNotifyData,
    provider: PaymentProvider,
  ): boolean {
    if (!notifyData.sign && !notifyData.rawData) {
      const nodeEnv = this.configService.get<string>('NODE_ENV');
      if (nodeEnv === 'development' || nodeEnv === 'test') {
        this.logger.warn(
          'Payment notify received without signature in dev/test mode - skipping verification',
        );
        return true;
      }
      this.logger.error('Payment notify missing signature in production');
      return false;
    }

    try {
      if (provider === PaymentProvider.WECHAT) {
        return this.verifyWechatSignature(
          notifyData.rawData || '',
          notifyData.sign || '',
        );
      } else if (provider === PaymentProvider.ALIPAY) {
        return this.verifyAlipaySignature(
          notifyData.rawData || '',
          notifyData.sign || '',
          notifyData.signType || 'RSA2',
        );
      }

      this.logger.error(`Unknown provider for payment notify: ${provider}`);
      return false;
    } catch (error) {
      this.logger.error(
        `Signature verification error: ${(error as Error).message}`,
      );
      return false;
    }
  }

  private verifyRefundNotifySignature(
    notifyData: RefundNotifyData,
    provider: PaymentProvider,
  ): boolean {
    if (!notifyData.sign && !notifyData.rawData) {
      const nodeEnv = this.configService.get<string>('NODE_ENV');
      if (nodeEnv === 'development' || nodeEnv === 'test') {
        this.logger.warn(
          'Refund notify received without signature in dev/test mode - skipping verification',
        );
        return true;
      }
      this.logger.error('Refund notify missing signature in production');
      return false;
    }

    try {
      if (provider === PaymentProvider.WECHAT) {
        return this.verifyWechatSignature(
          notifyData.rawData || '',
          notifyData.sign || '',
        );
      } else if (provider === PaymentProvider.ALIPAY) {
        return this.verifyAlipaySignature(
          notifyData.rawData || '',
          notifyData.sign || '',
          notifyData.signType || 'RSA2',
        );
      }

      this.logger.error(`Unknown provider for refund notify: ${provider}`);
      return false;
    } catch (error) {
      this.logger.error(
        `Refund signature verification error: ${(error as Error).message}`,
      );
      return false;
    }
  }

  private verifyWechatSignature(rawData: string, sign: string): boolean {
    const apiKey = this.configService.get<string>('WECHAT_PAY_API_KEY');
    if (!apiKey) {
      this.logger.error('WECHAT_PAY_API_KEY not configured');
      return false;
    }

    const expectedSign = crypto
      .createHmac('sha256', apiKey)
      .update(rawData)
      .digest('hex')
      .toUpperCase();

    const expectedBuf = Buffer.from(expectedSign, 'utf8');
    const signBuf = Buffer.from(sign.toUpperCase(), 'utf8');
    if (expectedBuf.length !== signBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signBuf);
  }

  /**
   * 支付宝签名验证（RSA2/RSA）
   * 生产环境应使用支付宝公钥进行验签
   */
  private verifyAlipaySignature(
    rawData: string,
    sign: string,
    signType: string,
  ): boolean {
    const alipayPublicKey = this.configService.get<string>('ALIPAY_PUBLIC_KEY');
    if (!alipayPublicKey) {
      this.logger.error('ALIPAY_PUBLIC_KEY not configured');
      return false;
    }

    const algorithm = signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1';

    try {
      const verify = crypto.createVerify(algorithm);
      verify.update(rawData, 'utf8');
      return verify.verify(
        `-----BEGIN PUBLIC KEY-----\n${alipayPublicKey}\n-----END PUBLIC KEY-----`,
        sign,
        'base64',
      );
    } catch (error) {
      this.logger.error(
        `Alipay signature verification failed: ${(error as Error).message}`,
      );
      return false;
    }
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

    const totalAmountResult = await this.prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS },
      _sum: { total: true },
    });
    const totalAmount = toNumber(totalAmountResult._sum.total);

    const totalRefunds = await this.prisma.refund.count();
    const totalRefundAmountResult = await this.prisma.refund.aggregate({
      where: { status: RefundStatus.SUCCESS },
      _sum: { refundAmount: true },
    });
    const totalRefundAmount = toNumber(
      totalRefundAmountResult._sum.refundAmount,
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
  async createPaymentLog(data: PaymentLogData) {
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
      try {
        const currentPayment = await this.prisma.payment.findFirst({
          where: { transactionId: transactionId },
        });
        if (currentPayment && currentPayment.status === PaymentStatus.PENDING) {
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
        } else if (
          currentPayment &&
          currentPayment.status === PaymentStatus.SUCCESS
        ) {
          this.logger.warn(
            `Transfer ${transactionId} already succeeded before error, skipping status update`,
          );
        }
      } catch (logError) {
        this.logger.error(
          `Failed to update payment status on error: ${logError}`,
        );
      }
      throw error;
    }
  }
}
