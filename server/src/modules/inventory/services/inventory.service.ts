import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateInventoryItemData,
  CreateTransactionData,
  CreateReservationData,
  CreateQualityCheckData,
  CreateWarehouseData,
  InventoryFilters,
  InventorySortOptions,
  PaginationOptions,
} from '../interfaces/inventory.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  InventoryItemEntity,
  InventorySearchResultEntity,
  InventoryStatsEntity,
  InventoryTransactionEntity,
  InventoryReservationEntity,
  QualityCheckEntity,
  WarehouseEntity,
  InventoryStatus,
  ItemType,
  ItemCondition,
  ProcessingStatus,
  ReservationStatus,
  WarehouseType,
  WarehouseStatus,
} from '../entities/inventory.entity';
import { InventoryItem, Order, Prisma, InventoryTxnType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // 创建库存项目
  async createInventoryItem(
    data: CreateInventoryItemData,
    tx?: Prisma.TransactionClient,
  ): Promise<InventoryItem> {
    const totalPrice = data.unitPrice * data.quantity;
    const availableQty = data.quantity - (data.reservedQty || 0);

    const client = tx ?? this.prisma;
    const item = await client.inventoryItem.create({
      data: {
        warehouseId: data.warehouseId,
        categoryId: Number(data.categoryId as any),
        name: data.name,
        description: data.description,
        unit: data.unit,
        quantity: data.quantity,
        reservedQty: data.reservedQty || 0,
        availableQty: availableQty,
        unitPrice: data.unitPrice,
        totalPrice: totalPrice,
        location: data.location,
        status:
          data.status ||
          this.configService.get<InventoryStatus>(
            'INVENTORY_DEFAULT_STATUS',
            InventoryStatus.IN_STOCK,
          ),
        itemType: (data.itemType ||
          this.configService.get<ItemType>(
            'INVENTORY_DEFAULT_ITEM_TYPE',
            ItemType.RECYCLED,
          )) as any,
        condition: (data.condition ||
          this.configService.get<ItemCondition>(
            'INVENTORY_DEFAULT_CONDITION',
            ItemCondition.GOOD,
          )) as any,
        sourceOrderId: data.sourceOrderId
          ? BigInt(data.sourceOrderId as any)
          : null,
        qualityGrade: data.qualityGrade,
        processingStatus: (data.processingStatus ||
          this.configService.get<ProcessingStatus>(
            'INVENTORY_DEFAULT_PROCESSING_STATUS',
            ProcessingStatus.RECEIVED,
          )) as any,
        expiryDate: data.expiryDate,
        batchNumber: data.batchNumber,
        minStockLevel: data.minStockLevel,
        maxStockLevel: data.maxStockLevel,
      },
    });

    return item as unknown as InventoryItem;
  }

  // 获取库存项目列表
  async getInventoryItems(
    filters?: InventoryFilters,
    sort?: InventorySortOptions,
    pagination?: PaginationOptions,
  ): Promise<InventorySearchResultEntity> {
    const { page = 1, pageSize = 10 } = pagination || { page: 1, pageSize: 10 };
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {};

    if (filters) {
      if (filters.name) {
        where.name = { contains: filters.name, mode: 'insensitive' };
      }
      if (filters.warehouseId) {
        where.warehouseId = filters.warehouseId;
      }
      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.itemType) {
        where.itemType = filters.itemType;
      }
      if (filters.condition) {
        where.condition = filters.condition;
      }
      if (filters.expiryDateFrom || filters.expiryDateTo) {
        where.expiryDate = {};
        if (filters.expiryDateFrom) {
          where.expiryDate.gte = filters.expiryDateFrom;
        }
        if (filters.expiryDateTo) {
          where.expiryDate.lte = filters.expiryDateTo;
        }
      }
    }

    const orderBy: any = {};
    if (sort) {
      orderBy[sort.field] = sort.order;
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          warehouse: true,
          category: true,
        },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      items: items as unknown as InventoryItemEntity[],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  // 根据ID获取库存项目
  async getInventoryItemById(id: bigint): Promise<InventoryItem | null> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        warehouse: true,
        category: true,
      },
    });

    return item as unknown as InventoryItemEntity;
  }

  // 更新库存项目
  async updateInventoryItem(
    id: bigint,
    data: Partial<CreateInventoryItemData>,
  ): Promise<InventoryItemEntity> {
    const updateData: any = { ...data };

    if (data.quantity !== undefined || data.reservedQty !== undefined) {
      const current = await this.prisma.inventoryItem.findUnique({
        where: { id },
      });
      if (current) {
        const quantity = data.quantity ?? Number(current.quantity);
        const reservedQty = data.reservedQty ?? Number(current.reservedQty);
        updateData.availableQty = quantity - reservedQty;
      }
    }

    if (data.unitPrice !== undefined && data.quantity !== undefined) {
      updateData.totalPrice = data.unitPrice * data.quantity;
    }

    const item = await this.prisma.inventoryItem.update({
      where: { id },
      data: updateData,
      include: {
        warehouse: true,
        category: true,
      },
    });

    return item as unknown as InventoryItemEntity;
  }

  // 删除库存项目
  async deleteInventoryItem(id: bigint): Promise<void> {
    await this.prisma.inventoryItem.delete({
      where: { id },
    });
  }

  // 获取库存统计
  async getInventoryStats(): Promise<InventoryStatsEntity> {
    const [
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      inStockItems,
    ] = await Promise.all([
      this.prisma.inventoryItem.count(),
      this.prisma.inventoryItem.aggregate({
        _sum: { totalPrice: true },
      }),
      this.prisma.inventoryItem.count({
        where: { status: InventoryStatus.LOW_STOCK },
      }),
      this.prisma.inventoryItem.count({
        where: { status: InventoryStatus.OUT_OF_STOCK },
      }),
      this.prisma.inventoryItem.count({
        where: { status: InventoryStatus.IN_STOCK },
      }),
    ]);

    const expiringSoonItems = await this.prisma.inventoryItem.count({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
    });

    const averageValue =
      totalItems > 0 ? Number(totalValue._sum.totalPrice || 0) / totalItems : 0;

    return {
      totalItems,
      totalValue: Number(totalValue._sum.totalPrice || 0),
      lowStockItems,
      outOfStockItems,
      inStockItems,
      expiringSoonItems,
      averageValue,
    };
  }

  // 获取库存警报
  async getAlerts(): Promise<any[]> {
    const alerts: any[] = [];

    // 1. 获取低库存商品
    const lowStockItems = await this.prisma.inventoryItem.findMany({
      where: {
        status: InventoryStatus.LOW_STOCK,
      },
      take: 5,
    });

    lowStockItems.forEach((item) => {
      alerts.push({
        id: `low-${item.id}`,
        type: 'low_stock',
        severity: 'warning',
        message: `商品 "${item.name}" 库存不足 (剩余: ${item.quantity})`,
        itemId: item.id.toString(),
        createdAt: new Date().toISOString(),
      });
    });

    // 2. 获取即将过期商品
    const expiringItems = await this.prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          gt: new Date(),
        },
      },
      take: 5,
    });

    expiringItems.forEach((item) => {
      alerts.push({
        id: `exp-${item.id}`,
        type: 'expiring_soon',
        severity: 'info',
        message: `商品 "${item.name}" 即将过期 (${item.expiryDate?.toISOString().split('T')[0]})`,
        itemId: item.id.toString(),
        createdAt: new Date().toISOString(),
      });
    });

    return alerts;
  }

  // 创建交易记录
  async createTransaction(
    data: CreateTransactionData,
  ): Promise<InventoryTransactionEntity> {
    const unitPrice = new Prisma.Decimal(data.unitPrice);
    const quantity = new Prisma.Decimal(data.quantity);
    const transaction = await this.prisma.inventoryTransaction.create({
      data: {
        itemId: data.itemId,
        type: data.type,
        quantity: data.quantity,
        unitPrice,
        totalPrice: unitPrice.mul(quantity),
        referenceId: data.referenceId,
        notes: data.notes,
      },
    });

    return {
      ...transaction,
      updatedAt: transaction.createdAt, // 添加缺失的updatedAt字段
    } as unknown as InventoryTransactionEntity;
  }

  // 创建预订
  async createReservation(
    data: CreateReservationData,
  ): Promise<InventoryReservationEntity> {
    const reservation = await this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({
        where: { id: data.itemId },
      });
      if (!item) {
        throw new Error('Inventory item not found');
      }
      if (Number(item.availableQty) < data.quantity) {
        throw new Error('Insufficient available quantity');
      }

      const created = await tx.reservation.create({
        data: {
          itemId: data.itemId,
          orderId: BigInt(data.orderId as any),
          quantity: data.quantity,
          status: data.status || ReservationStatus.PENDING,
          reservedAt: new Date(),
          expiresAt: data.expiresAt,
          notes: data.notes,
        },
      });

      await tx.inventoryItem.update({
        where: { id: item.id },
        data: {
          reservedQty: { increment: data.quantity },
          availableQty: { decrement: data.quantity },
        },
      });

      const unitPrice = new Prisma.Decimal(item.unitPrice);
      const qty = new Prisma.Decimal(data.quantity);

      await tx.inventoryTransaction.create({
        data: {
          itemId: item.id,
          type: InventoryTxnType.RESERVE,
          quantity: data.quantity,
          unitPrice,
          totalPrice: unitPrice.mul(qty),
          referenceId: data.orderId,
          notes: 'reservation:create',
        },
      });

      return created;
    });

    return reservation as unknown as InventoryReservationEntity;
  }

  async confirmReservation(reservationId: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });
      if (!reservation) throw new Error('Reservation not found');
      if (reservation.status !== ReservationStatus.PENDING) return reservation;

      return tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });
    });
  }

  async cancelReservation(reservationId: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });
      if (!reservation) throw new Error('Reservation not found');
      if (
        reservation.status === ReservationStatus.CANCELLED ||
        reservation.status === ReservationStatus.EXPIRED
      ) {
        return reservation;
      }

      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: ReservationStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      await tx.inventoryItem.update({
        where: { id: reservation.itemId },
        data: {
          reservedQty: { decrement: reservation.quantity },
          availableQty: { increment: reservation.quantity },
        },
      });

      const item = await tx.inventoryItem.findUnique({
        where: { id: reservation.itemId },
      });
      if (item) {
        const unitPrice = new Prisma.Decimal(item.unitPrice);
        const qty = new Prisma.Decimal(reservation.quantity);
        await tx.inventoryTransaction.create({
          data: {
            itemId: item.id,
            type: InventoryTxnType.RELEASE,
            quantity: reservation.quantity,
            unitPrice,
            totalPrice: unitPrice.mul(qty),
            referenceId: reservation.orderId.toString(),
            notes: 'reservation:cancel',
          },
        });
      }

      return tx.reservation.findUniqueOrThrow({ where: { id: reservationId } });
    });
  }

  async expireReservations(now: Date = new Date()) {
    const expired = await this.prisma.reservation.findMany({
      where: {
        status: ReservationStatus.PENDING,
        expiresAt: { lt: now },
      },
      select: { id: true },
      take: 200,
    });

    for (const r of expired) {
      await this.prisma.$transaction(async (tx) => {
        const reservation = await tx.reservation.findUnique({
          where: { id: r.id },
        });
        if (!reservation) return;
        if (reservation.status !== ReservationStatus.PENDING) return;
        if (!reservation.expiresAt || reservation.expiresAt >= now) return;

        await tx.reservation.update({
          where: { id: reservation.id },
          data: {
            status: ReservationStatus.EXPIRED,
            expiredAt: now,
          },
        });

        await tx.inventoryItem.update({
          where: { id: reservation.itemId },
          data: {
            reservedQty: { decrement: reservation.quantity },
            availableQty: { increment: reservation.quantity },
          },
        });

        const item = await tx.inventoryItem.findUnique({
          where: { id: reservation.itemId },
        });
        if (item) {
          const unitPrice = new Prisma.Decimal(item.unitPrice);
          const qty = new Prisma.Decimal(reservation.quantity);
          await tx.inventoryTransaction.create({
            data: {
              itemId: item.id,
              type: InventoryTxnType.RELEASE,
              quantity: reservation.quantity,
              unitPrice,
              totalPrice: unitPrice.mul(qty),
              referenceId: reservation.orderId.toString(),
              notes: 'reservation:expire',
            },
          });
        }
      });
    }

    return { expiredCount: expired.length };
  }

  // 创建质量检查
  async createQualityCheck(
    data: CreateQualityCheckData,
  ): Promise<QualityCheckEntity> {
    const qualityCheck = await this.prisma.qualityCheck.create({
      data: {
        itemId: data.itemId,
        checkerId: data.checkerId,
        checkType: data.checkType,
        result: data.result,
        score: data.score,
        notes: data.notes,
        images: data.images || [],
        checkedAt: data.checkedAt || new Date(),
      },
    });

    return qualityCheck as unknown as QualityCheckEntity;
  }

  // 获取仓库列表
  async getWarehouses(): Promise<any[]> {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { status: WarehouseStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
    return warehouses.map((w) => ({
      id: w.id.toString(),
      name: w.name,
      address: w.address,
    }));
  }

  // 创建仓库
  async createWarehouse(data: CreateWarehouseData): Promise<WarehouseEntity> {
    const warehouse = await this.prisma.warehouse.create({
      data: {
        name: data.name,
        code: `WH-${Date.now()}`, // 自动生成code
        type: (data.type || WarehouseType.MAIN) as any,
        address: data.address,
        contactPhone: data.contactPhone || '',
        capacity: data.capacity,
        status: data.status || WarehouseStatus.ACTIVE,
        description: data.description,
      },
    });

    return warehouse as unknown as WarehouseEntity;
  }

  // 从订单创建库存项目
  async createFromOrder(
    order: Order & { items: any[] },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    if (!order.items || order.items.length === 0) return;

    const client = tx ?? this.prisma;

    // Find default warehouse
    let warehouse = await client.warehouse.findFirst({
      where: {
        type: WarehouseType.MAIN as any,
        status: WarehouseStatus.ACTIVE,
      },
    });

    // If no warehouse, create one
    if (!warehouse) {
      warehouse = await client.warehouse.create({
        data: {
          name: 'Default Warehouse',
          code: `WH-DEFAULT`,
          type: WarehouseType.MAIN as any,
          address: 'Default Address',
          contactPhone: '000-0000000',
          capacity: 10000,
          status: WarehouseStatus.ACTIVE,
        },
      });
    }

    const warehouseId = warehouse.id;

    // Fetch categories to get names
    const categoryIds = order.items.map((i) => i.categoryId);
    const categories = await client.category.findMany({
      where: { id: { in: categoryIds } },
    });
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    for (const item of order.items) {
      const category = categoryMap.get(item.categoryId);
      const name = item.brandModel || category?.name || 'Recycled Item';

      await this.createInventoryItem(
        {
          warehouseId: warehouseId,
          categoryId: BigInt(item.categoryId),
          name: name,
          description: item.notes,
          unit: 'kg', // Default unit
          quantity:
            item.actualWeight || item.estimatedWeight || item.quantity || 1,
          unitPrice: item.unitPrice,
          status: InventoryStatus.IN_STOCK,
          itemType: ItemType.RECYCLED,
          condition: ItemCondition.GOOD,
          sourceOrderId: order.id.toString(),
          processingStatus: ProcessingStatus.RECEIVED,
        },
        client,
      );
    }
  }

  exportInventory(_query: any): any[] {
    return [];
  }

  batchDelete(_ids: string[]): void {
    // Batch delete logic
  }

  adjustInventory(
    _id: bigint,
    _data: { type: string; quantity: number; reason: string },
  ): any {
    return {};
  }

  getAdjustments(_id: bigint): any[] {
    return [];
  }

  markAlertAsRead(_id: bigint): void {
    // Mark alert as read
  }

  batchMarkAlertsAsRead(_ids: string[]): void {
    // Batch mark alerts as read
  }

  getValueTrend(_days: number): any[] {
    return [];
  }

  getTurnover(): any[] {
    return [];
  }
}
