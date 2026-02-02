import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import * as crypto from 'crypto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

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
      // Seed default plans
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

  async createRechargeOrder(dto: CreateRechargeDto) {
    const orderNo = `RC${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const order = await this.prisma.rechargeOrder.create({
      data: {
        orderNo,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        status: 'PENDING',
      },
    });

    // Mock Pay URL
    return {
      orderNo,
      payUrl: `https://mock-pay.com/pay?orderNo=${orderNo}&amount=${dto.amount}`,
    };
  }

  // Mock callback for testing
  async mockPaySuccess(orderNo: string) {
    const order = await this.prisma.rechargeOrder.findUnique({
      where: { orderNo },
    });

    if (!order || order.status !== 'PENDING') {
      throw new BadRequestException('Order invalid or already paid');
    }

    const wallet = await this.getPlatformWallet();

    return this.prisma.$transaction(async (tx) => {
      // Update Order
      await tx.rechargeOrder.update({
        where: { id: order.id },
        data: {
          status: 'SUCCESS',
          paidAt: new Date(),
        },
      });

      // Update Wallet
      const updatedWallet = await tx.platformWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: order.amount },
          totalRecharge: { increment: order.amount },
          version: { increment: 1 },
        },
      });

      // Create Transaction
      await tx.platformTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'RECHARGE',
          amount: order.amount,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
          relatedOrderNo: order.orderNo,
          description: `充值 ${order.amount} 元`,
        },
      });

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
    // Simple hash
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    return this.prisma.platformWallet.update({
      where: { id: wallet.id },
      data: { paymentPassword: hashedPassword },
    });
  }
}
