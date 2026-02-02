import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ISettlementService } from './tenant.interfaces';
import { SettlementStatus, TenantTransactionType } from '@prisma/client';

@Injectable()
export class SettlementService implements ISettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async initSettlement(
    orderId: number,
    tenantId: number,
    estimatedExpressFee: number,
  ): Promise<void> {
    const oid = BigInt(orderId);
    const tid = BigInt(tenantId);

    // Create initial settlement record
    await this.prisma.settlementRecord.create({
      data: {
        orderId: oid,
        tenantId: tid,
        goodsAmount: 0,
        expressFee: estimatedExpressFee,
        platformFee: 0,
        totalAmount: 0,
        status: SettlementStatus.PENDING,
      },
    });

    // Freeze express fee
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tid } });
    if (tenant) {
      await this.prisma.tenantTransaction.create({
        data: {
          tenantId: tid,
          type: TenantTransactionType.EXPRESS_DEDUCTION,
          amount: -estimatedExpressFee,
          balanceAfter: tenant.balance - estimatedExpressFee,
          relatedType: 'ORDER',
          relatedId: orderId.toString(),
          remark: 'Frozen express fee for order',
        },
      });
    }

    this.logger.log(
      `Initialized settlement for order ${orderId} (Est Fee: ${estimatedExpressFee})`,
    );
  }

  async calculateSettlement(orderId: number): Promise<number> {
    const order = await this.prisma.order.findUnique({
      where: { id: BigInt(orderId) },
      include: {
        items: true,
        settlementRecord: true,
      },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Goods total
    const goodsAmount = order.items.reduce((sum, item) => sum + item.amount, 0);

    // Platform fee (5%)
    const platformFee = goodsAmount * 0.05;

    // Total amount to be added to tenant balance
    const expressFee = order.settlementRecord?.expressFee || 0;
    const totalAmount = goodsAmount - platformFee - expressFee;

    // Update settlement record
    await this.prisma.settlementRecord.update({
      where: { orderId: BigInt(orderId) },
      data: {
        goodsAmount,
        platformFee,
        totalAmount,
        status: SettlementStatus.PROCESSING,
      },
    });

    return totalAmount;
  }

  async executeSettlement(orderId: number): Promise<void> {
    const settlement = await this.prisma.settlementRecord.findUnique({
      where: { orderId: BigInt(orderId) },
    });

    if (!settlement || settlement.status === SettlementStatus.COMPLETED) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Update tenant balance
      const tenant = await tx.tenant.update({
        where: { id: settlement.tenantId },
        data: {
          balance: { increment: settlement.totalAmount },
        },
      });

      // 2. Create transaction record
      await tx.tenantTransaction.create({
        data: {
          tenantId: settlement.tenantId,
          type: TenantTransactionType.ORDER_INCOME,
          amount: settlement.totalAmount,
          balanceAfter: tenant.balance,
          relatedType: 'ORDER',
          relatedId: orderId.toString(),
          remark: `Settlement for order ${orderId}`,
        },
      });

      // 3. Mark settlement as completed
      await tx.settlementRecord.update({
        where: { id: settlement.id },
        data: {
          status: SettlementStatus.COMPLETED,
          settledAt: new Date(),
        },
      });
    });

    this.logger.log(`Executed settlement for order ${orderId}`);
  }
}
