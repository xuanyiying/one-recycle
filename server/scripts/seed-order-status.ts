import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as path from 'path';

import { config } from 'dotenv';
config({ path: path.join(__dirname, '../.env') });

import {
  PrismaClient,
  OrderStatus,
  LogisticsStatus,
  InventoryTxnType,
  PaymentStatus,
  PaymentProvider,
  RefundStatus,
  WarehouseStatus,
  WarehouseType,
  InventoryStatus,
  ItemType,
  ItemCondition,
  ProcessingStatus,
  ReservationStatus,
  SettlementStatus,
} from '@prisma/client';

const ORDER_PREFIX = 'SEED-OS-';
const DEFAULT_ORDER_COUNT = 50;

const orderCount = Number(process.env.SEED_ORDER_COUNT ?? DEFAULT_ORDER_COUNT);
const clearOld = (process.env.SEED_CLEAR_OLD ?? 'true') === 'true';
const withRelations = (process.env.SEED_WITH_RELATIONS ?? 'true') === 'true';

const color = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
};

const statusFlow = [
  OrderStatus.PENDING,
  OrderStatus.PENDING_PICKUP,
  OrderStatus.PICKED_UP,
  OrderStatus.IN_TRANSIT,
  OrderStatus.PENDING_RECEIPT,
  OrderStatus.INSPECTING,
  OrderStatus.INSPECTED,
  OrderStatus.PENDING_INBOUND,
  OrderStatus.INBOUNDED,
  OrderStatus.PENDING_SETTLEMENT,
  OrderStatus.COMPLETED,
] as const;

const statusPool = [
  OrderStatus.PENDING,
  OrderStatus.PENDING_PICKUP,
  OrderStatus.PICKED_UP,
  OrderStatus.IN_TRANSIT,
  OrderStatus.PENDING_RECEIPT,
  OrderStatus.INSPECTING,
  OrderStatus.INSPECTED,
  OrderStatus.INSPECTION_EXCEPTION,
  OrderStatus.MANUAL_PROCESSING,
  OrderStatus.PENDING_INBOUND,
  OrderStatus.INBOUNDED,
  OrderStatus.PENDING_SETTLEMENT,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.REFUNDED,
] as const;

function buildTimeline(status: OrderStatus, variant: number): OrderStatus[] {
  if (status === OrderStatus.CANCELLED) {
    if (variant % 4 === 0) return [OrderStatus.PENDING, OrderStatus.CANCELLED];
    if (variant % 4 === 1)
      return [OrderStatus.PENDING, OrderStatus.PENDING_PICKUP, OrderStatus.CANCELLED];
    if (variant % 4 === 2)
      return [
        OrderStatus.PENDING,
        OrderStatus.PENDING_PICKUP,
        OrderStatus.PICKED_UP,
        OrderStatus.IN_TRANSIT,
        OrderStatus.CANCELLED,
      ];
    return [
      OrderStatus.PENDING,
      OrderStatus.PENDING_PICKUP,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
      OrderStatus.PENDING_RECEIPT,
      OrderStatus.INSPECTING,
      OrderStatus.INSPECTION_EXCEPTION,
      OrderStatus.MANUAL_PROCESSING,
      OrderStatus.CANCELLED,
    ];
  }

  if (status === OrderStatus.INSPECTION_EXCEPTION) {
    return [
      OrderStatus.PENDING,
      OrderStatus.PENDING_PICKUP,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
      OrderStatus.PENDING_RECEIPT,
      OrderStatus.INSPECTING,
      OrderStatus.INSPECTION_EXCEPTION,
    ];
  }

  if (status === OrderStatus.MANUAL_PROCESSING) {
    return [
      OrderStatus.PENDING,
      OrderStatus.PENDING_PICKUP,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
      OrderStatus.PENDING_RECEIPT,
      OrderStatus.INSPECTING,
      OrderStatus.INSPECTION_EXCEPTION,
      OrderStatus.MANUAL_PROCESSING,
    ];
  }

  if (status === OrderStatus.REFUNDED) {
    return [...statusFlow, OrderStatus.REFUNDED];
  }

  const index = statusFlow.indexOf(status);
  if (index >= 0) {
    return statusFlow.slice(0, index + 1);
  }

  return [OrderStatus.PENDING];
}

function statusRank(status: OrderStatus): number {
  if (
    status === OrderStatus.INSPECTION_EXCEPTION ||
    status === OrderStatus.MANUAL_PROCESSING
  ) {
    return statusFlow.indexOf(OrderStatus.INSPECTING);
  }
  if (status === OrderStatus.REFUNDED) return statusFlow.indexOf(OrderStatus.COMPLETED);
  if (status === OrderStatus.CANCELLED) return statusFlow.indexOf(OrderStatus.PENDING);
  return statusFlow.indexOf(status);
}

function logisticsStatus(status: OrderStatus): LogisticsStatus {
  if (status === OrderStatus.PICKED_UP) return LogisticsStatus.PICKED_UP;
  if (status === OrderStatus.IN_TRANSIT) return LogisticsStatus.IN_TRANSIT;
  if (
    status === OrderStatus.PENDING_RECEIPT ||
    status === OrderStatus.INSPECTING ||
    status === OrderStatus.INSPECTED ||
    status === OrderStatus.INSPECTION_EXCEPTION ||
    status === OrderStatus.MANUAL_PROCESSING ||
    status === OrderStatus.PENDING_INBOUND ||
    status === OrderStatus.INBOUNDED ||
    status === OrderStatus.PENDING_SETTLEMENT ||
    status === OrderStatus.COMPLETED ||
    status === OrderStatus.REFUNDED
  ) {
    return LogisticsStatus.DELIVERED;
  }
  if (status === OrderStatus.CANCELLED) return LogisticsStatus.CANCELLED;
  return LogisticsStatus.CREATED;
}

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(color.red('DATABASE_URL 未在 .env 文件中设置'));
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const startedAt = Date.now();

  try {
    // 使用系统默认租户（与 seed-tenant-staff.ts 保持一致）
    const tenant = await prisma.tenant.upsert({
      where: { code: 'DEFAULT' },
      update: {},
      create: {
        name: '默认租户',
        code: 'DEFAULT',
        contactName: '管理员',
        contactPhone: '13812345678',
        status: 'ACTIVE',
      },
    });

    const user = await prisma.user.upsert({
      where: { mobile: '13800138000' },
      update: {},
      create: {
        mobile: '13800138000',
        nickname: '种子用户',
        status: 'ACTIVE',
      },
    });

    let address = await prisma.address.findFirst({
      where: { userId: user.id },
    });
    if (!address) {
      address = await prisma.address.create({
        data: {
          userId: user.id,
          name: '张三',
          mobile: '13800138000',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          town: '粤海街道',
          street: '科苑路',
          zipCode: '518000',
          detail: '科技园 100 号',
          isDefault: true,
        },
      });
    }

    let tenantAddress = await prisma.tenantAddress.findFirst({
      where: { tenantId: tenant.id, type: 'RECEIPT' },
    });
    if (!tenantAddress) {
      tenantAddress = await prisma.tenantAddress.create({
        data: {
          tenantId: tenant.id,
          type: 'RECEIPT',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          street: '建国路',
          detail: '回收仓库 1 号',
          contactName: '仓库收货',
          contactPhone: '010-88886666',
          isDefault: true,
        },
      });
    }

    let warehouse = await prisma.warehouse.findFirst({
      where: { code: 'SEED-WH-001' },
    });
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({
        data: {
          name: '种子仓库',
          code: 'SEED-WH-001',
          type: WarehouseType.MAIN,
          address: `${tenantAddress.province}${tenantAddress.city}${tenantAddress.district}${tenantAddress.detail}`,
          contactPhone: tenantAddress.contactPhone,
          capacity: 10000,
          status: WarehouseStatus.ACTIVE,
          tenantId: tenant.id,
        },
      });
    }

    let categories = await prisma.category.findMany({
      where: { type: 'RECYCLE' },
      take: 3,
    });
    if (categories.length === 0) {
      const created = await prisma.category.create({
        data: {
          name: '默认回收品类',
          description: '种子数据默认品类',
          type: 'RECYCLE',
          priceInfo: '{}',
          seo: '{}',
          sortOrder: 1,
          level: 1,
          path: '0',
        },
      });
      categories = [created];
    }

    const statusList = [...statusPool];
    while (statusList.length < orderCount) {
      statusList.push(statusPool[statusList.length % statusPool.length]);
    }

    if (clearOld) {
      const oldOrders = await prisma.order.findMany({
        where: { orderNo: { startsWith: ORDER_PREFIX } },
        select: { id: true },
      });
      const oldOrderIds = oldOrders.map((item) => item.id);

      if (oldOrderIds.length > 0) {
        const inventoryItems = await prisma.inventoryItem.findMany({
          where: { sourceOrderId: { in: oldOrderIds } },
          select: { id: true },
        });
        const inventoryItemIds = inventoryItems.map((item) => item.id);

        if (inventoryItemIds.length > 0) {
          await prisma.reservation.deleteMany({
            where: { itemId: { in: inventoryItemIds } },
          });
          await prisma.inventoryTransaction.deleteMany({
            where: { itemId: { in: inventoryItemIds } },
          });
          await prisma.inventoryItem.deleteMany({
            where: { id: { in: inventoryItemIds } },
          });
        }

        await prisma.reservation.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        await prisma.orderItem.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        await prisma.logisticsOrder.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        await prisma.orderTimeline.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        await prisma.settlementRecord.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        await prisma.paymentLog.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        const payments = await prisma.payment.findMany({
          where: { orderId: { in: oldOrderIds } },
          select: { id: true },
        });
        const paymentIds = payments.map((payment) => payment.id);
        if (paymentIds.length > 0) {
          await prisma.refund.deleteMany({
            where: { paymentId: { in: paymentIds } },
          });
        }
        await prisma.payment.deleteMany({
          where: { orderId: { in: oldOrderIds } },
        });
        await prisma.order.deleteMany({
          where: { id: { in: oldOrderIds } },
        });
      }
    }

    let orderCreated = 0;
    let itemCreated = 0;
    let paymentCreated = 0;
    let paymentLogCreated = 0;
    let refundCreated = 0;
    let logisticsCreated = 0;
    let timelineCreated = 0;
    let inventoryItemCreated = 0;
    let inventoryTransactionCreated = 0;
    let reservationCreated = 0;
    let settlementCreated = 0;
    const statusCount: Record<string, number> = {};

    for (let index = 0; index < orderCount; index += 1) {
      const status = statusList[index];
      const orderNo = `${ORDER_PREFIX}${String(index + 1).padStart(4, '0')}`;
      const baseTime = new Date(Date.now() - (orderCount - index) * 3600 * 1000);
      const estimatedAmount = roundAmount(30 + (index % 9) * 12 + Math.random() * 10);
      const discountAmount =
        status === OrderStatus.CANCELLED ? 0 : roundAmount(Math.random() * 6);
      const settlementAmount = roundAmount(
        Math.max(estimatedAmount - discountAmount, 1),
      );
      const payAmount = settlementAmount;
      const rank = statusRank(status);

      const expectPickupTime =
        rank >= statusRank(OrderStatus.PENDING_PICKUP)
          ? new Date(baseTime.getTime() + 2 * 3600 * 1000)
          : null;
      const actualPickupTime =
        rank >= statusRank(OrderStatus.PICKED_UP)
          ? new Date(baseTime.getTime() + 4 * 3600 * 1000)
          : null;
      const expectDeliveryTime =
        rank >= statusRank(OrderStatus.IN_TRANSIT)
          ? new Date(baseTime.getTime() + 8 * 3600 * 1000)
          : null;
      const actualDeliveryTime =
        rank >= statusRank(OrderStatus.PENDING_RECEIPT)
          ? new Date(baseTime.getTime() + 10 * 3600 * 1000)
          : null;

      const cancelAt =
        status === OrderStatus.CANCELLED
          ? new Date(baseTime.getTime() + 3 * 3600 * 1000)
          : null;
      const completedAt =
        status === OrderStatus.COMPLETED || status === OrderStatus.REFUNDED
          ? new Date(baseTime.getTime() + 24 * 3600 * 1000)
          : null;

      const existingOrder = await prisma.order.findUnique({
        where: { orderNo },
        select: { id: true },
      });

      if (existingOrder && withRelations) {
        const inventoryItems = await prisma.inventoryItem.findMany({
          where: { sourceOrderId: existingOrder.id },
          select: { id: true },
        });
        const inventoryItemIds = inventoryItems.map((item) => item.id);
        if (inventoryItemIds.length > 0) {
          await prisma.reservation.deleteMany({
            where: { itemId: { in: inventoryItemIds } },
          });
          await prisma.inventoryTransaction.deleteMany({
            where: { itemId: { in: inventoryItemIds } },
          });
          await prisma.inventoryItem.deleteMany({
            where: { id: { in: inventoryItemIds } },
          });
        }
        await prisma.reservation.deleteMany({
          where: { orderId: existingOrder.id },
        });
        await prisma.orderItem.deleteMany({
          where: { orderId: existingOrder.id },
        });
        await prisma.logisticsOrder.deleteMany({
          where: { orderId: existingOrder.id },
        });
        await prisma.orderTimeline.deleteMany({
          where: { orderId: existingOrder.id },
        });
        await prisma.settlementRecord.deleteMany({
          where: { orderId: existingOrder.id },
        });
        await prisma.paymentLog.deleteMany({
          where: { orderId: existingOrder.id },
        });
        const payments = await prisma.payment.findMany({
          where: { orderId: existingOrder.id },
          select: { id: true },
        });
        const paymentIds = payments.map((payment) => payment.id);
        if (paymentIds.length > 0) {
          await prisma.refund.deleteMany({
            where: { paymentId: { in: paymentIds } },
          });
        }
        await prisma.payment.deleteMany({
          where: { orderId: existingOrder.id },
        });
      }

      const order = await prisma.order.upsert({
        where: { orderNo },
        update: {
          status,
          estimatedAmount,
          settlementAmount,
          payAmount,
          discountAmount,
          expectPickupTime,
          actualPickupTime,
          expectDeliveryTime,
          actualDeliveryTime,
          cancelReason: status === OrderStatus.CANCELLED ? '用户主动取消' : null,
          cancelAt,
          completedAt,
          remark: 'seed:order-status',
          couponId: withRelations ? `SEED-COUPON-${index + 1}` : null,
          tenantId: tenant.id,
        },
        create: {
          orderNo,
          userId: user.id,
          addressId: address.id,
          status,
          estimatedAmount,
          settlementAmount,
          payAmount,
          discountAmount,
          expectPickupTime,
          actualPickupTime,
          expectDeliveryTime,
          actualDeliveryTime,
          cancelReason: status === OrderStatus.CANCELLED ? '用户主动取消' : null,
          cancelAt,
          completedAt,
          channel: 'WECHAT',
          source: 'SEED',
          remark: 'seed:order-status',
          couponId: withRelations ? `SEED-COUPON-${index + 1}` : null,
          tenantId: tenant.id,
        },
      });

      orderCreated += 1;
      statusCount[status] = (statusCount[status] ?? 0) + 1;

      if (!withRelations) {
        console.log(
          `${color.cyan(`(${index + 1}/${orderCount})`)} 订单 ${orderNo} ${color.yellow(
            status,
          )}`,
        );
        continue;
      }

      const timelineStatuses = buildTimeline(status, index);
      await prisma.orderTimeline.createMany({
        data: timelineStatuses.map((step, stepIndex) => ({
          orderId: order.id,
          status: step,
          message: `状态变更为 ${step}`,
          operator: stepIndex === 0 ? 'SYSTEM' : 'AUTO',
        })),
      });
      timelineCreated += timelineStatuses.length;

      const itemCount = 1 + (index % 3);
      const items = Array.from({ length: itemCount }).map((_, itemIndex) => {
        const category = categories[itemIndex % categories.length];
        const estimatedWeight = roundAmount(0.5 + Math.random() * 4);
        const unitPrice = roundAmount(6 + Math.random() * 10);
        return {
          orderId: order.id,
          categoryId: category.id,
          estimatedWeight,
          actualWeight:
            rank >= statusRank(OrderStatus.INSPECTED)
              ? roundAmount(estimatedWeight * (0.9 + Math.random() * 0.2))
              : null,
          unitPrice,
          amount: roundAmount(estimatedWeight * unitPrice),
          quantity: 1,
          condition: 'GOOD',
          brandModel: 'seed-model',
          notes: 'seed-item',
        };
      });
      await prisma.orderItem.createMany({ data: items });
      itemCreated += items.length;

      const paymentStatus =
        status === OrderStatus.CANCELLED
          ? PaymentStatus.FAILED
          : status === OrderStatus.PENDING
            ? PaymentStatus.PENDING
            : status === OrderStatus.REFUNDED
              ? PaymentStatus.REFUNDED
              : PaymentStatus.SUCCESS;
      if (paymentStatus !== PaymentStatus.FAILED) {
        const transactionId = BigInt(Date.now() + index);
        const payment = await prisma.payment.create({
          data: {
            orderId: order.id,
            transactionId,
            outTradeNo: `${orderNo}-PAY`,
            total: payAmount,
            status: paymentStatus,
            provider: PaymentProvider.WECHAT,
            paidAt:
              paymentStatus === PaymentStatus.SUCCESS ||
                paymentStatus === PaymentStatus.REFUNDED
                ? new Date(baseTime.getTime() + 12 * 3600 * 1000)
                : null,
            closedAt: null,
          },
        });
        paymentCreated += 1;

        await prisma.paymentLog.create({
          data: {
            transactionId: payment.transactionId,
            orderId: order.id,
            amount: payAmount,
            status: paymentStatus,
            provider: PaymentProvider.WECHAT,
            rawData: '{"source":"seed"}',
            processedAt: new Date(),
          },
        });
        paymentLogCreated += 1;

        if (status === OrderStatus.REFUNDED) {
          await prisma.refund.create({
            data: {
              paymentId: payment.id,
              outRefundNo: `${orderNo}-REFUND`,
              refundAmount: payAmount,
              status: RefundStatus.SUCCESS,
              reason: '种子数据退款',
            },
          });
          refundCreated += 1;
        }
      }

      if (status !== OrderStatus.CANCELLED) {
        await prisma.logisticsOrder.create({
          data: {
            orderId: order.id,
            logisticsNo: `${orderNo}-LG`,
            logisticsCompany: 'SF',
            status: logisticsStatus(status),
            senderName: address.name,
            senderPhone: address.mobile,
            senderAddress: `${address.province}${address.city}${address.district}${address.detail}`,
            receiverName: tenantAddress.contactName,
            receiverPhone: tenantAddress.contactPhone,
            receiverAddress: `${tenantAddress.province}${tenantAddress.city}${tenantAddress.district}${tenantAddress.detail}`,
            estimatedPickupTime: expectPickupTime ?? undefined,
            actualPickupTime: actualPickupTime ?? undefined,
            estimatedDeliveryTime: expectDeliveryTime ?? undefined,
            actualDeliveryTime: actualDeliveryTime ?? undefined,
            deliveryFee: roundAmount(6 + Math.random() * 6),
            providerData: { source: 'seed' },
          },
        });
        logisticsCreated += 1;
      }

      const totalWeight = items.reduce(
        (sum, item) => sum + (item.actualWeight ?? item.estimatedWeight),
        0,
      );
      const unitPrice = roundAmount(8 + Math.random() * 12);
      const inventoryItem = await prisma.inventoryItem.create({
        data: {
          warehouseId: warehouse.id,
          categoryId: items[0].categoryId,
          name: `seed-item-${orderNo}`,
          description: '种子库存物品',
          unit: 'kg',
          quantity: roundAmount(100),
          reservedQty: roundAmount(0),
          availableQty: roundAmount(100),
          unitPrice,
          totalPrice: roundAmount(100 * unitPrice),
          status:
            statusRank(status) >= statusRank(OrderStatus.INBOUNDED)
              ? InventoryStatus.IN_STOCK
              : InventoryStatus.RESERVED,
          itemType: ItemType.RECYCLED,
          condition: ItemCondition.GOOD,
          sourceOrderId: order.id,
          qualityGrade: 'A',
          processingStatus:
            statusRank(status) >= statusRank(OrderStatus.INSPECTING)
              ? ProcessingStatus.INSPECTING
              : ProcessingStatus.RECEIVED,
          weight: totalWeight,
          volume: roundAmount(totalWeight * 0.4),
          brand: 'SeedBrand',
          model: 'SeedModel',
          images: [],
          tags: ['seed', 'order'],
        },
      });
      inventoryItemCreated += 1;

      await prisma.inventoryTransaction.create({
        data: {
          itemId: inventoryItem.id,
          type: InventoryTxnType.OUT,
          quantity: roundAmount(Math.max(totalWeight, 1)),
          unitPrice,
          totalPrice: roundAmount(unitPrice * Math.max(totalWeight, 1)),
          referenceId: orderNo,
          notes: 'seed-transaction',
        },
      });
      inventoryTransactionCreated += 1;

      await prisma.reservation.create({
        data: {
          itemId: inventoryItem.id,
          orderId: order.id,
          quantity: roundAmount(Math.max(totalWeight, 1)),
          status: ReservationStatus.CONFIRMED,
          reservedAt: new Date(),
          notes: 'seed-reservation',
        },
      });
      reservationCreated += 1;

      if (
        status === OrderStatus.PENDING_SETTLEMENT ||
        status === OrderStatus.COMPLETED ||
        status === OrderStatus.REFUNDED
      ) {
        await prisma.settlementRecord.create({
          data: {
            tenantId: tenant.id,
            orderId: order.id,
            totalAmount: settlementAmount,
            goodsAmount: settlementAmount,
            expressFee: roundAmount(6 + Math.random() * 6),
            platformFee: roundAmount(2 + Math.random() * 2),
            subsidyAmount: 0,
            status:
              status === OrderStatus.COMPLETED || status === OrderStatus.REFUNDED
                ? SettlementStatus.COMPLETED
                : SettlementStatus.PENDING,
            settledAt:
              status === OrderStatus.COMPLETED || status === OrderStatus.REFUNDED
                ? new Date()
                : null,
          },
        });
        settlementCreated += 1;
      }

      console.log(
        `${color.cyan(`(${index + 1}/${orderCount})`)} 订单 ${orderNo} ${color.yellow(
          status,
        )} ${color.gray(withRelations ? 'relations:on' : 'relations:off')}`,
      );
    }

    const duration = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log(color.green('种子数据生成完成'));
    console.log(
      color.cyan(
        `订单: ${orderCreated} | 订单项: ${itemCreated} | 物流: ${logisticsCreated} | 支付: ${paymentCreated} | 支付日志: ${paymentLogCreated} | 退款: ${refundCreated}`,
      ),
    );
    console.log(
      color.cyan(
        `库存: ${inventoryItemCreated} | 库存交易: ${inventoryTransactionCreated} | 预订: ${reservationCreated} | 结算: ${settlementCreated} | 时间轴: ${timelineCreated}`,
      ),
    );
    Object.keys(statusCount)
      .sort()
      .forEach((key) => {
        console.log(`${color.gray(key)}: ${statusCount[key]}`);
      });
    console.log(color.gray(`耗时: ${duration}s`));
  } catch (error) {
    console.error(color.red('种子数据生成失败'));
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
