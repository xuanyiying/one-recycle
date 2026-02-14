import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Tenant, TenantAddress, AddressType } from '@prisma/client';
import { ITenantService } from './tenant.interfaces';
import { toDecimal } from '@/common/utils/decimal.util';

@Injectable()
export class TenantService implements ITenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async assignTenant(orderId: number): Promise<Tenant> {
    // Strategy: Assign to the active tenant with the fewest associated orders in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const tenants = await this.prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: {
            orders: {
              where: { createdAt: { gte: oneDayAgo } },
            },
          },
        },
      },
    });

    if (tenants.length === 0) {
      throw new Error('No active tenant found');
    }

    // Sort by order count (simple load balancing)
    tenants.sort((a, b) => a._count.orders - b._count.orders);
    const tenant = tenants[0];

    // Update order with assigned tenant
    await this.prisma.order.update({
      where: { id: BigInt(orderId) },
      data: { tenantId: tenant.id },
    });

    this.logger.log(
      `Assigned tenant ${tenant.id} to order ${orderId} (Load: ${tenant._count.orders} orders/24h)`,
    );
    return tenant;
  }

  async getReceiptAddress(tenantId: number): Promise<TenantAddress> {
    const tid = BigInt(tenantId);
    const address = await this.prisma.tenantAddress.findFirst({
      where: {
        tenantId: tid,
        type: AddressType.RECEIPT,
      },
    });

    if (!address) {
      // Fallback to Business address if receipt not found
      const businessAddr = await this.prisma.tenantAddress.findFirst({
        where: {
          tenantId: tid,
          type: AddressType.BUSINESS,
        },
      });

      if (!businessAddr) {
        throw new Error(
          `No receipt or business address found for tenant ${tenantId}`,
        );
      }
      return businessAddr;
    }

    return address;
  }

  async checkBalance(
    tenantId: number,
    estimatedAmount: number,
  ): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(tenantId) },
    });

    if (!tenant) return false;

    // Strict check: Available balance (total - frozen) must cover estimated amount
    const availableBalance = toDecimal(tenant.balance).minus(
      toDecimal(tenant.frozenBalance),
    );
    return availableBalance.greaterThanOrEqualTo(toDecimal(estimatedAmount));
  }
}
