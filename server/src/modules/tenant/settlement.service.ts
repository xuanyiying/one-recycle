import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ISettlementService } from './tenant.interfaces';
import { SettlementStatus, TenantTransactionType, Prisma } from '@prisma/client';
import { toDecimal, toNumber } from '@/common/utils/decimal.util';

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

    await this.prisma.$transaction(async (tx) => {
      // Create initial settlement record
      await tx.settlementRecord.create({
        data: {
          orderId: oid,
          tenantId: tid,
          goodsAmount: toDecimal(0),
          expressFee: toDecimal(estimatedExpressFee),
          platformFee: toDecimal(0),
          totalAmount: toDecimal(0),
          status: SettlementStatus.PENDING,
        },
      });

      // Freeze express fee: update tenant balance and record transaction atomically
      const tenant = await tx.tenant.findUnique({ where: { id: tid } });
      if (tenant) {
        const expressFee = toDecimal(estimatedExpressFee);
        const balanceAfter = toDecimal(tenant.balance).minus(expressFee);

        await tx.tenant.update({
          where: { id: tid },
          data: {
            balance: { decrement: expressFee },
            frozenBalance: { increment: expressFee },
          },
        });

        await tx.tenantTransaction.create({
          data: {
            tenantId: tid,
            type: TenantTransactionType.EXPRESS_DEDUCTION,
            amount: expressFee.negated(),
            balanceAfter,
            relatedType: 'ORDER',
            relatedId: orderId.toString(),
            remark: 'Frozen express fee for order',
          },
        });
      }
    });

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
    const goodsAmount = order.items.reduce(
      (sum, item) => sum.plus(toDecimal(item.amount)),
      toDecimal(0),
    );

    // Platform fee (5%)
    const platformFeeRate = parseFloat(process.env.PLATFORM_FEE_RATE || '0.05');
    const platformFee = goodsAmount.mul(new Prisma.Decimal(platformFeeRate));

    // Total amount to be added to tenant balance
    const expressFee = toDecimal(order.settlementRecord?.expressFee);
    const totalAmount = goodsAmount.minus(platformFee).minus(expressFee);

    if (totalAmount.isNegative()) {
      throw new Error(`Settlement amount is negative for order ${orderId}: ${totalAmount.toString()}`);
    }

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

    return toNumber(totalAmount);
  }

  async executeSettlement(orderId: number): Promise<void> {
    const settlement = await this.prisma.settlementRecord.findUnique({
      where: { orderId: BigInt(orderId) },
    });

    if (!settlement || settlement.status === SettlementStatus.COMPLETED) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: settlement.tenantId },
      });
      if (!tenant) throw new Error(`Tenant ${settlement.tenantId} not found`);

      const updatedTenant = await tx.tenant.updateMany({
        where: { id: settlement.tenantId, version: tenant.version },
        data: {
          balance: { increment: settlement.totalAmount },
          version: { increment: 1 },
        },
      });
      if (updatedTenant.count !== 1) {
        throw new Error('TENANT_VERSION_CONFLICT');
      }

      await tx.tenantTransaction.create({
        data: {
          tenantId: settlement.tenantId,
          type: TenantTransactionType.ORDER_INCOME,
          amount: settlement.totalAmount,
          balanceAfter: toDecimal(tenant.balance).plus(settlement.totalAmount),
          relatedType: 'ORDER',
          relatedId: orderId.toString(),
          remark: `Settlement for order ${orderId}`,
        },
      });

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
