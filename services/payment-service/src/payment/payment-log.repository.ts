import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Payment, PaymentStatus, PaymentProvider } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PaymentLogData {
  orderId: string;
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  provider: PaymentProvider;
  reason?: string;
}

export interface PaymentStats {
  total: number;
  success: number;
  failed: number;
  closed: number;
  totalAmount: number;
}

@Injectable()
export class PaymentLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建支付日志
   */
  async createPaymentLog(data: PaymentLogData): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        orderId: BigInt(data.orderId),
        transactionId: data.transactionId,
        status: data.status,
        total: new Decimal(data.amount),
        provider: data.provider,
        outTradeNo: data.transactionId, // 使用 transactionId 作为 outTradeNo
      },
    });
  }

  /**
   * 检查交易是否已处理
   */
  async isTransactionProcessed(transactionId: string): Promise<boolean> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        OR: [
          { transactionId },
          { outTradeNo: transactionId },
        ],
      },
    });
    return !!payment;
  }

  /**
   * 根据订单ID查找支付日志
   */
  async findByOrderId(orderId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { orderId: BigInt(orderId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据交易ID查找支付日志
   */
  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: {
        OR: [
          { transactionId },
          { outTradeNo: transactionId },
        ],
      },
    });
  }

  /**
   * 获取支付统计数据
   */
  async getPaymentStats(startDate: Date, endDate: Date): Promise<PaymentStats> {
    const payments = await this.prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const stats = {
      total: payments.length,
      success: 0,
      failed: 0,
      closed: 0,
      totalAmount: 0,
    };

    payments.forEach((payment) => {
      const amount = payment.total ? Number(payment.total) : 0;
      stats.totalAmount += amount;
      
      switch (payment.status) {
        case PaymentStatus.SUCCESS:
          stats.success++;
          break;
        case PaymentStatus.FAILED:
          stats.failed++;
          break;
        case PaymentStatus.CLOSED:
          stats.closed++;
          break;
      }
    });

    return stats;
  }

  /**
   * 更新支付状态
   */
  async updatePaymentStatus(
    transactionId: string,
    status: PaymentStatus,
    reason?: string
  ): Promise<Payment | null> {
    const payment = await this.findByTransactionId(transactionId);
    if (!payment) {
      return null;
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
}