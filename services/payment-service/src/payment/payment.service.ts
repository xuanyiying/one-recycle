import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SnowflakeIdGenerator } from '@one-recycle/shared';
import { PaymentProvider, PaymentStatus, RefundStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  private readonly idGenerator = new SnowflakeIdGenerator({ workerId: 6, datacenterId: 1 });

  constructor(private prisma: PrismaService) { }

  async create(createPaymentDto: CreatePaymentDto) {
    // 检查是否已有支付记录
    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId: BigInt(createPaymentDto.orderId), status: PaymentStatus.SUCCESS }
    });

    if (existingPayment) {
      throw new ConflictException('订单已支付成功');
    }

    // 生成交易号
    const transactionId = `PAY${this.idGenerator.nextId()}`;
    const outTradeNo = `OUT${this.idGenerator.nextId()}`;

    return this.prisma.payment.create({
      data: {
        orderId: BigInt(createPaymentDto.orderId),
        provider: createPaymentDto.provider as PaymentProvider,
        outTradeNo: outTradeNo,
        total: createPaymentDto.amount,
        status: PaymentStatus.PENDING,
        transactionId: transactionId
      }
    });
  }

  async updatePaymentStatus(transactionId: string, status: PaymentStatus) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: transactionId }
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: status, updatedAt: new Date() }
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: BigInt(id) },
      include: { refunds: true }
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  async findByOrderId(orderId: string) {
    return this.prisma.payment.findMany({
      where: { orderId: BigInt(orderId) },
      include: { refunds: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createRefund(paymentId: string, refundAmount: number, reason?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: BigInt(paymentId) }
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new ConflictException('只有支付成功的订单才能退款');
    }

    if (refundAmount > payment.total.toNumber()) {
      throw new ConflictException('退款金额不能超过支付金额');
    }

    const outRefundNo = `REF${this.idGenerator.nextId()}`;

    return this.prisma.refund.create({
      data: {
        paymentId: BigInt(paymentId),
        outRefundNo,
        refundAmount,
        reason,
        status: RefundStatus.PROCESSING
      }
    });
  }

  async updateRefundStatus(refundId: string, status: RefundStatus) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: BigInt(refundId) }
    });

    if (!refund) {
      throw new NotFoundException('退款记录不存在');
    }

    return this.prisma.refund.update({
      where: { id: BigInt(refundId) },
      data: { status: status }
    });
  }

  async findByTransactionId(transactionId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId },
      include: { refunds: true }
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  async findByOutTradeNo(outTradeNo: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { outTradeNo },
      include: { refunds: true }
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return payment;
  }

  async handlePaymentNotify(notifyData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { outTradeNo: notifyData.outTradeNo }
    });

    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: notifyData.transactionId,
        status: notifyData.tradeState === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        notifyRaw: notifyData.notifyRaw,
        updatedAt: new Date()
      }
    });
  }

  async handleRefundNotify(notifyData: any) {
    const refund = await this.prisma.refund.findFirst({
      where: { outRefundNo: notifyData.outRefundNo }
    });

    if (!refund) {
      throw new NotFoundException('退款记录不存在');
    }

    return this.prisma.refund.update({
      where: { id: refund.id },
      data: {
        status: notifyData.refundStatus === 'SUCCESS' ? RefundStatus.SUCCESS : RefundStatus.FAILED,
        notifyRaw: notifyData.notifyRaw,
        updatedAt: new Date()
      }
    });
  }

  async getPaymentStats() {
    const totalPayments = await this.prisma.payment.count();
    const successfulPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.SUCCESS }
    });
    const failedPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.FAILED }
    });
    const pendingPayments = await this.prisma.payment.count({
      where: { status: PaymentStatus.PENDING }
    });

    const totalAmountResult = await this.prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCESS },
      select: { total: true }
    });
    const totalAmount = totalAmountResult.reduce((sum, payment) => sum + payment.total.toNumber(), 0);

    const totalRefunds = await this.prisma.refund.count();
    const totalRefundAmountResult = await this.prisma.refund.findMany({
      where: { status: RefundStatus.SUCCESS },
      select: { refundAmount: true }
    });
    const totalRefundAmount = totalRefundAmountResult.reduce((sum, refund) => sum + Number(refund.refundAmount), 0);

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
}