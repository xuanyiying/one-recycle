import { Injectable } from '@nestjs/common';
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
import { InventoryItem } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // 创建库存项目
  async createInventoryItem(
    data: CreateInventoryItemData,
  ): Promise<InventoryItem> {
    const totalPrice = data.unitPrice * data.quantity;
    const availableQty = data.quantity - (data.reservedQty || 0);

    const item = await this.prisma.inventoryItem.create({
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
        status: data.status || InventoryStatus.IN_STOCK,
        itemType: (data.itemType || ItemType.RECYCLED) as any,
        condition: (data.condition || ItemCondition.GOOD) as any,
        sourceOrderId: data.sourceOrderId
          ? BigInt(data.sourceOrderId as any)
          : null,
        qualityGrade: data.qualityGrade,
        processingStatus: (data.processingStatus ||
          ProcessingStatus.RECEIVED) as any,
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

  // 创建交易记录
  async createTransaction(
    data: CreateTransactionData,
  ): Promise<InventoryTransactionEntity> {
    const transaction = await this.prisma.inventoryTransaction.create({
      data: {
        itemId: data.itemId,
        type: data.type,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice: data.unitPrice * data.quantity,
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
    const reservation = await this.prisma.reservation.create({
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

    return reservation as unknown as InventoryReservationEntity;
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
}
