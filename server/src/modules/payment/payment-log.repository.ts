import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, PaymentProvider } from '@prisma/client';

export interface PaymentLogData {
  transactionId: string;
  orderId?: string;
  amount: number;
  status: PaymentStatus;
  provider: PaymentProvider;
  rawData?: any;
  processedAt?: Date;
}

@Injectable()
export class PaymentLogRepository {
  constructor(private prisma: PrismaService) { }

  async createPaymentLog(data: PaymentLogData) {
    return this.prisma.paymentLog.create({
      data: {
        transactionId: data.transactionId,
        orderId: data.orderId ? BigInt(data.orderId) : undefined,
        amount: data.amount,
        status: data.status,
        provider: data.provider,
        rawData: data.rawData ? JSON.stringify(data.rawData) : undefined,
        processedAt: data.processedAt,
      },
    });
  }

  async findByOrderId(orderId: string) {
    return this.prisma.paymentLog.findMany({
      where: { orderId: BigInt(orderId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTransactionId(transactionId: string) {
    return this.prisma.paymentLog.findFirst({
      where: { transactionId },
    });
  }

  async isTransactionProcessed(transactionId: string): Promise<boolean> {
    const log = await this.prisma.paymentLog.findFirst({
      where: { transactionId },
    });
    return !!log;
  }

  async getPaymentStats(startDate: Date, endDate: Date) {
    const logs = await this.prisma.paymentLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: true,
      },
    });

    const totalTransactions = logs.length;
    const successfulTransactions = logs.filter(log => log.status === PaymentStatus.SUCCESS).length;
    const failedTransactions = logs.filter(log => log.status === PaymentStatus.FAILED).length;
    const pendingTransactions = logs.filter(log => log.status === PaymentStatus.PENDING).length;

    const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);
    const successfulAmount = logs
      .filter(log => log.status === PaymentStatus.SUCCESS)
      .reduce((sum, log) => sum + log.amount, 0);

    return {
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      totalAmount,
      successfulAmount,
      startDate,
      endDate,
    };
  }
}