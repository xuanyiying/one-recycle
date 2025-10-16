import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '../../prisma/generated/client';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { Decimal } from '../../prisma/generated/client/runtime/library';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createInventoryItem(createInventoryItemDto: CreateInventoryItemDto) {
    const { warehouseId, categoryId, name, description, unit, quantity, unitPrice, location } = createInventoryItemDto;
    const totalPrice = quantity * unitPrice;

    return this.prisma['inventoryItem'].create({
      data: {
        warehouseId: BigInt(warehouseId),
        categoryId: BigInt(categoryId),
        name,
        description,
        unit,
        quantity: new Prisma.Decimal(quantity),
        unitPrice: new Prisma.Decimal(unitPrice),
        totalPrice: new Prisma.Decimal(totalPrice),
        location,
        status: quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      },
    });
  }

  async findAllInventoryItems(filters?: {
    status?: string;
    itemType?: string;
    condition?: string;
    location?: string;
    categoryId?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.itemType) where.itemType = filters.itemType;
    if (filters?.condition) where.condition = filters.condition;
    if (filters?.location) where.location = filters.location;
    if (filters?.categoryId) where.categoryId = BigInt(filters.categoryId);
    
    return this.prisma['inventoryItem'].findMany({
      where,
      include: {
        qualityChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 1,
        },
        reservations: {
          where: { status: 'CONFIRMED' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findInventoryItemById(id: string) {
    const item = await this.prisma['inventoryItem'].findUnique({
      where: { id: BigInt(id) },
      include: {
        qualityChecks: {
          orderBy: { checkedAt: 'desc' },
        },
        reservations: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return item;
  }

  async updateInventoryItem(id: string, updateInventoryItemDto: UpdateInventoryItemDto) {
    const item = await this.prisma['inventoryItem'].findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    // 计算新的总价值
    const quantity = updateInventoryItemDto.quantity !== undefined ? updateInventoryItemDto.quantity : Number(item.quantity);
    const unitPrice = updateInventoryItemDto.unitPrice !== undefined ? updateInventoryItemDto.unitPrice : Number(item.unitPrice);
    const totalPrice = quantity * unitPrice;

    // 更新状态
    let status = item.status;
    if (quantity === 0) {
      status = 'OUT_OF_STOCK';
    } else if (quantity > 0) {
      status = 'IN_STOCK';
    }

    return this.prisma['inventoryItem'].update({
      where: { id: BigInt(id) },
      data: {
        ...updateInventoryItemDto,
        quantity: updateInventoryItemDto.quantity !== undefined ? new Prisma.Decimal(updateInventoryItemDto.quantity) : undefined,
        unitPrice: updateInventoryItemDto.unitPrice !== undefined ? new Prisma.Decimal(updateInventoryItemDto.unitPrice) : undefined,
        totalPrice: new Prisma.Decimal(totalPrice),
        status,
      },
    });
  }

  async removeInventoryItem(id: string) {
    const item = await this.prisma['inventoryItem'].findUnique({
      where: { id: BigInt(id) },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return this.prisma['inventoryItem'].delete({
      where: { id: BigInt(id) },
    });
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const { itemId, type, quantity, unitPrice, referenceId, notes } = createTransactionDto;
    const totalPrice = quantity * unitPrice;

    // 检查库存是否足够（出库时）
    if (type === 'OUTBOUND') {
      const item = await this.prisma['inventoryItem'].findUnique({
        where: { id: BigInt(itemId) },
      });
      
      if (!item || Number(item.quantity) < quantity) {
        throw new BadRequestException('库存不足');
      }
    }

    // 创建交易记录
    const transaction = await this.prisma['inventoryTransaction'].create({
      data: {
        itemId: BigInt(itemId),
        type,
        quantity: new Prisma.Decimal(quantity),
        unitPrice: new Prisma.Decimal(unitPrice),
        totalPrice: new Prisma.Decimal(totalPrice),
        referenceId,
        notes,
      },
    });

    // 更新库存数量和状态
    const item = await this.prisma['inventoryItem'].findUnique({
      where: { id: BigInt(itemId) },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
    }

    let newQuantity;
    if (type === 'INBOUND') {
      newQuantity = Number(item.quantity) + quantity;
    } else if (type === 'OUTBOUND') {
      newQuantity = Number(item.quantity) - quantity;
    } else {
      // ADJUSTMENT
      newQuantity = quantity;
    }

    // 更新状态
    let status = item.status;
    if (newQuantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (newQuantity > 0) {
      status = 'IN_STOCK';
    }

    const newTotalPrice = newQuantity * unitPrice;

    await this.prisma['inventoryItem'].update({
      where: { id: BigInt(itemId) },
      data: {
        quantity: new Prisma.Decimal(newQuantity),
        totalPrice: new Prisma.Decimal(newTotalPrice),
        status,
      },
    });

    return transaction;
  }

  async getInventoryTransactions(itemId: string) {
    return this.prisma['inventoryTransaction'].findMany({
      where: { itemId: BigInt(itemId) },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getLowStockItems(threshold: number = 10) {
    return this.prisma['inventoryItem'].findMany({
      where: {
        quantity: { lte: new Prisma.Decimal(threshold) },
        status: 'IN_STOCK',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOutOfStockItems() {
    return this.prisma['inventoryItem'].findMany({
      where: {
        status: 'OUT_OF_STOCK',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async recordSales(salesData: {
    itemId: number;
    quantity: number;
    unitPrice: number;
    orderId: string;
    customerId: number;
    notes?: string;
  }) {
    const { itemId, quantity, unitPrice, orderId, customerId, notes } = salesData;
    const totalPrice = quantity * unitPrice;

    // 记录销售记录
    const salesRecord = await this.prisma['salesRecord'].create({
      data: {
        itemId: BigInt(itemId),
        quantity: new Prisma.Decimal(quantity),
        unitPrice: new Prisma.Decimal(unitPrice),
        totalPrice: new Prisma.Decimal(totalPrice),
        orderId,
        customerId: BigInt(customerId),
        soldAt: new Date(),
        notes,
      },
    });

    // 创建出库交易记录
    await this.createTransaction({
      itemId: itemId.toString(),
      type: 'OUTBOUND',
      quantity,
      unitPrice,
      referenceId: orderId,
      notes: `销售出库 - 订单 ${orderId}`,
    });

    return salesRecord;
  }

  async getSalesRecords(itemId?: string) {
    const where = itemId ? { itemId: BigInt(itemId) } : {};

    return this.prisma['salesRecord'].findMany({
      where,
      orderBy: {
        soldAt: 'desc',
      },
    });
  }

  // 质量检查相关方法
  async createQualityCheck(createQualityCheckDto: CreateQualityCheckDto) {
    return this.prisma['qualityCheck'].create({
      data: {
        ...createQualityCheckDto,
        itemId: BigInt(createQualityCheckDto.itemId),
        checkedAt: new Date(),
      },
    });
  }

  async getQualityChecksByItemId(itemId: string) {
    return this.prisma['qualityCheck'].findMany({
      where: { itemId: BigInt(itemId) },
      orderBy: { checkedAt: 'desc' },
    });
  }

  // 库存预留相关方法
  async createReservation(createReservationDto: CreateReservationDto) {
    const { itemId, quantity } = createReservationDto;
    
    // 检查可用库存
    const item = await this.prisma['inventoryItem'].findUnique({
      where: { id: BigInt(itemId) },
      include: {
        reservations: {
          where: { status: 'CONFIRMED' },
        },
      },
    });
    
    if (!item) {
      throw new BadRequestException('商品不存在');
    }
    
    const reservedQuantity = item.reservations.reduce((sum, r) => sum + Number(r.quantity), 0);
    const availableQuantity = Number(item.quantity) - reservedQuantity;
    
    if (availableQuantity < quantity) {
      throw new BadRequestException('可用库存不足');
    }
    
    return this.prisma['reservation'].create({
      data: {
        ...createReservationDto,
        itemId: BigInt(itemId),
        quantity: new Prisma.Decimal(quantity),
        reservedAt: new Date(),
      },
    });
  }

  async confirmReservation(reservationId: string) {
    return this.prisma['reservation'].update({
      where: { id: BigInt(reservationId) },
      data: { status: 'CONFIRMED' },
    });
  }

  async cancelReservation(reservationId: string) {
    return this.prisma['reservation'].update({
      where: { id: BigInt(reservationId) },
      data: { status: 'CANCELLED' },
    });
  }

  async getReservationsByOrderId(orderId: string) {
    return this.prisma['reservation'].findMany({
      where: { orderId },
      include: {
        item: true,
      },
    });
  }

  // 库存统计方法
  async getInventoryStats() {
    const totalItems = await this.prisma['inventoryItem'].count({
      where: { status: { not: 'OUT_OF_STOCK' } },
    });
    
    const totalValue = await this.prisma['inventoryItem'].aggregate({
      where: { status: { not: 'OUT_OF_STOCK' } },
      _sum: {
        quantity: true,
      },
    });
    
    const lowStockCount = await this.prisma['inventoryItem'].count({
      where: {
        quantity: { lte: new Prisma.Decimal(10) },
        status: 'IN_STOCK',
      },
    });
    
    const outOfStockCount = await this.prisma['inventoryItem'].count({
      where: {
        status: 'OUT_OF_STOCK',
      },
    });
    
    return {
      totalItems,
      totalQuantity: Number(totalValue._sum.quantity) || 0,
      lowStockCount,
      outOfStockCount,
    };
  }

  // 批量处理方法
  async batchUpdateStatus(itemIds: string[], status: string) {
    return this.prisma['inventoryItem'].updateMany({
      where: {
        id: { in: itemIds.map(id => BigInt(id)) },
      },
      data: { status: status as any },
    });
  }

  async batchUpdateLocation(itemIds: string[], location: string) {
    return this.prisma['inventoryItem'].updateMany({
      where: {
        id: { in: itemIds.map(id => BigInt(id)) },
      },
      data: { location },
    });
  }

  // ==================== 仓库管理 ====================

  /**
   * 创建仓库
   */
  async createWarehouse(createDto: CreateWarehouseDto) {
    return await this.prisma.warehouse.create({
      data: createDto as any,
    });
  }

  /**
   * 更新仓库信息
   */
  async updateWarehouse(id: bigint, updateDto: UpdateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException(`仓库 ID ${id} 不存在`);
    }
    
    return await this.prisma.warehouse.update({
      where: { id },
      data: updateDto as any,
    });
  }

  /**
   * 获取仓库列表
   */
  async findWarehouses(query: any = {}) {
    const { page = 1, limit = 20, status, type, region } = query;
    
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (region) where.region = region;

    const [warehouses, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return {
      warehouses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取仓库详情
   */
  async findWarehouseById(id: bigint) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        inventoryItems: {
          include: {
            category: true,
            qualityChecks: {
              orderBy: { checkedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }

    return warehouse;
  }

  // ==================== 增强的库存操作 ====================

  /**
   * 入库操作
   */
  async stockIn(params: {
    itemId: bigint;
    quantity: Decimal;
    unitPrice?: Decimal;
    movementType: string;
    referenceType?: string;
    referenceId?: bigint;
    referenceNo?: string;
    operatorId?: bigint;
    operatorName?: string;
    remark?: string;
  }) {
    const { itemId, quantity, ...movementData } = params;

    if (quantity.lte(0)) {
      throw new BadRequestException('入库数量必须大于0');
    }

    const item = await this.findInventoryItemById(itemId.toString());
    const beforeQty = item.quantity;
    const afterQty = new Decimal(beforeQty).add(quantity);

    // 更新库存数量
    const updatedItem = await this.prisma['inventoryItem'].update({
      where: { id: itemId },
      data: {
        quantity: afterQty,
        status: afterQty.gt(0) ? 'IN_STOCK' : 'OUT_OF_STOCK',
      },
    });

    // 创建库存变动记录
    await this.createTransaction({
      itemId: itemId.toString(),
      type: 'INBOUND',
      quantity: quantity.toNumber(),
      unitPrice: movementData.unitPrice?.toNumber() || 0,
      referenceId: movementData.referenceId?.toString(),
      notes: movementData.remark,
    });

    return updatedItem;
  }

  /**
   * 出库操作
   */
  async stockOut(params: {
    itemId: bigint;
    quantity: Decimal;
    unitPrice?: Decimal;
    movementType: string;
    referenceType?: string;
    referenceId?: bigint;
    referenceNo?: string;
    operatorId?: bigint;
    operatorName?: string;
    remark?: string;
  }) {
    const { itemId, quantity, ...movementData } = params;

    if (quantity.lte(0)) {
      throw new BadRequestException('出库数量必须大于0');
    }

    const item = await this.findInventoryItemById(itemId.toString());
    const beforeQty = new Decimal(item.quantity);
    
    if (beforeQty.lt(quantity)) {
      throw new BadRequestException(`库存不足，当前库存: ${beforeQty}, 需要: ${quantity}`);
    }

    const afterQty = beforeQty.sub(quantity);

    // 更新库存数量
    const updatedItem = await this.prisma['inventoryItem'].update({
      where: { id: itemId },
      data: {
        quantity: afterQty,
        status: afterQty.gt(0) ? 'IN_STOCK' : 'OUT_OF_STOCK',
      },
    });

    // 创建库存变动记录
    await this.createTransaction({
      itemId: itemId.toString(),
      type: 'OUTBOUND',
      quantity: quantity.toNumber(),
      unitPrice: movementData.unitPrice?.toNumber() || 0,
      referenceId: movementData.referenceId?.toString(),
      notes: movementData.remark,
    });

    // 检查库存预警
    await this.checkStockAlert(itemId);

    return updatedItem;
  }

  /**
   * 库存预留
   */
  async reserveStock(itemId: bigint, quantity: Decimal) {
    const item = await this.findInventoryItemById(itemId.toString());
    const currentQty = new Decimal(item.quantity);
    
    if (currentQty.lt(quantity)) {
      throw new BadRequestException(`库存不足，无法预留`);
    }

    // 创建预留记录
    return await this.createReservation({
      itemId: itemId.toString(),
      quantity: quantity.toNumber(),
      orderId: `RESERVE_${Date.now()}`,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
      notes: '库存预留',
    });
  }

  /**
   * 释放预留库存
   */
  async releaseReservedStock(itemId: bigint, quantity: Decimal) {
    // 取消相关预留记录
    const reservations = await this.prisma['reservation'].findMany({
      where: {
        itemId: itemId,
        status: 'CONFIRMED',
      },
    });

    let remainingQty = quantity;
    for (const reservation of reservations) {
      if (remainingQty.lte(0)) break;
      
      const reservedQty = new Decimal(reservation.quantity);
      if (reservedQty.lte(remainingQty)) {
        await this.cancelReservation(reservation.id.toString());
        remainingQty = remainingQty.sub(reservedQty);
      }
    }

    return await this.findInventoryItemById(itemId.toString());
  }

  // ==================== 库存预警 ====================

  /**
   * 检查库存预警
   */
  async checkStockAlert(itemId: bigint): Promise<void> {
    const item = await this.findInventoryItemById(itemId.toString());
    const currentQty = new Decimal(item.quantity);
    
    // 检查零库存预警
    if (currentQty.eq(0)) {
      await this.createStockAlert({
        itemId,
        alertType: 'ZERO_STOCK',
        alertLevel: 'CRITICAL',
        currentQty,
        thresholdQty: new Decimal(0),
        message: `商品 ${item.name} 已零库存`,
      });
    }
    // 检查低库存预警（假设阈值为10）
    else if (currentQty.lte(10)) {
      await this.createStockAlert({
        itemId,
        alertType: 'LOW_STOCK',
        alertLevel: 'WARNING',
        currentQty,
        thresholdQty: new Decimal(10),
        message: `商品 ${item.name} 库存不足，当前库存: ${currentQty}`,
      });
    }
  }

  /**
   * 创建库存预警
   */
  private async createStockAlert(alertData: any): Promise<void> {
    // 检查是否已存在相同的未处理预警
    try {
      const existingAlert = await this.prisma.inventoryAlert.findFirst({
        where: {
          itemId: alertData.itemId,
          alertType: alertData.alertType,
          status: 'PENDING',
        },
      });

      if (!existingAlert) {
        await this.prisma.inventoryAlert.create({
          data: alertData,
        });
      }
    } catch (error) {
      // 如果表不存在，记录日志但不抛出错误
      console.warn('库存预警表不存在，跳过预警创建:', error.message);
    }
  }

  // ==================== 库存调拨功能 ====================

  /**
   * 库存调拨 - 在不同仓库间转移库存
   */
  async transferStock(params: {
    itemId: bigint;
    fromWarehouseId: bigint;
    toWarehouseId: bigint;
    quantity: Decimal;
    operatorId?: bigint;
    operatorName?: string;
    notes?: string;
  }) {
    const { itemId, fromWarehouseId, toWarehouseId, quantity, operatorId, operatorName, notes } = params;

    if (quantity.lte(0)) {
      throw new BadRequestException('调拨数量必须大于0');
    }

    if (fromWarehouseId === toWarehouseId) {
      throw new BadRequestException('源仓库和目标仓库不能相同');
    }

    // 检查源仓库库存
    const sourceItem = await this.prisma['inventoryItem'].findFirst({
      where: {
        id: itemId,
        warehouseId: fromWarehouseId,
      },
    });

    if (!sourceItem) {
      throw new NotFoundException('源仓库中未找到该商品');
    }

    const sourceQty = new Decimal(sourceItem.quantity);
    if (sourceQty.lt(quantity)) {
      throw new BadRequestException(`源仓库库存不足，当前库存: ${sourceQty}, 需要: ${quantity}`);
    }

    // 检查目标仓库是否存在该商品
    let targetItem = await this.prisma['inventoryItem'].findFirst({
      where: {
        name: sourceItem.name,
        warehouseId: toWarehouseId,
      },
    });

    // 使用事务确保数据一致性
    return await this.prisma.$transaction(async (tx) => {
      // 从源仓库减少库存
      await tx['inventoryItem'].update({
        where: { id: sourceItem.id },
        data: {
          quantity: sourceQty.sub(quantity),
          status: sourceQty.sub(quantity).gt(0) ? 'IN_STOCK' : 'OUT_OF_STOCK',
        },
      });

      // 如果目标仓库没有该商品，创建新记录
      if (!targetItem) {
        targetItem = await tx['inventoryItem'].create({
          data: {
            name: sourceItem.name,
            description: sourceItem.description,
            categoryId: sourceItem.categoryId,
            warehouseId: toWarehouseId,
            unit: sourceItem.unit,
            quantity: quantity,
            availableQty: quantity,
            unitPrice: sourceItem.unitPrice,
            totalPrice: quantity.mul(sourceItem.unitPrice),
            status: 'IN_STOCK',
            itemType: sourceItem.itemType,
            condition: sourceItem.condition,
            location: sourceItem.location,
            processingStatus: sourceItem.processingStatus,
          },
        });
      } else {
        // 如果目标仓库已有该商品，增加库存
        const targetQty = new Decimal(targetItem.quantity);
        await tx['inventoryItem'].update({
          where: { id: targetItem.id },
          data: {
            quantity: targetQty.add(quantity),
            status: 'IN_STOCK',
          },
        });
      }

      // 创建调拨出库记录
      await tx['inventoryTransaction'].create({
        data: {
          itemId: sourceItem.id,
          type: 'TRANSFER_OUT',
          quantity: quantity,
          unitPrice: sourceItem.unitPrice,
          totalPrice: quantity.mul(sourceItem.unitPrice),
          referenceId: toWarehouseId.toString(),
          notes: `调拨至仓库${toWarehouseId}: ${notes || ''}`,
        },
      });

      // 创建调拨入库记录
      await tx['inventoryTransaction'].create({
        data: {
          itemId: targetItem.id,
          type: 'TRANSFER_IN',
          quantity: quantity,
          unitPrice: sourceItem.unitPrice,
          totalPrice: quantity.mul(sourceItem.unitPrice),
          referenceId: fromWarehouseId.toString(),
          notes: `从仓库${fromWarehouseId}调入: ${notes || ''}`,
        },
      });

      return {
        sourceItem: await tx['inventoryItem'].findUnique({ where: { id: sourceItem.id } }),
        targetItem: await tx['inventoryItem'].findUnique({ where: { id: targetItem.id } }),
      };
    });
  }

  /**
   * 批量库存调整
   */
  async batchAdjustStock(adjustments: Array<{
    itemId: bigint;
    adjustmentType: 'INCREASE' | 'DECREASE' | 'SET';
    quantity: Decimal;
    reason: string;
    operatorId?: bigint;
    operatorName?: string;
  }>) {
    const results = [];

    for (const adjustment of adjustments) {
      const { itemId, adjustmentType, quantity, reason, operatorId, operatorName } = adjustment;

      const item = await this.findInventoryItemById(itemId.toString());
      const currentQty = new Decimal(item.quantity);
      let newQty: Decimal;

      switch (adjustmentType) {
        case 'INCREASE':
          newQty = currentQty.add(quantity);
          break;
        case 'DECREASE':
          newQty = currentQty.sub(quantity);
          if (newQty.lt(0)) {
            throw new BadRequestException(`商品 ${item.name} 调整后库存不能为负数`);
          }
          break;
        case 'SET':
          newQty = quantity;
          break;
        default:
          throw new BadRequestException('无效的调整类型');
      }

      // 更新库存
      const updatedItem = await this.prisma['inventoryItem'].update({
        where: { id: itemId },
        data: {
          quantity: newQty,
          status: newQty.gt(0) ? 'IN_STOCK' : 'OUT_OF_STOCK',
        },
      });

      // 创建调整记录
      await this.createTransaction({
        itemId: itemId.toString(),
        type: 'ADJUSTMENT',
        quantity: adjustmentType === 'SET' ? newQty.sub(currentQty).toNumber() : 
                 adjustmentType === 'INCREASE' ? quantity.toNumber() : -quantity.toNumber(),
        unitPrice: item.unitPrice.toNumber(),
        notes: `库存调整: ${reason}`,
      });

      results.push(updatedItem);
    }

    return results;
  }

  /**
   * 库存盘点
   */
  async stockTaking(params: {
    warehouseId?: bigint;
    categoryId?: bigint;
    operatorId?: bigint;
    operatorName?: string;
    notes?: string;
  }) {
    const { warehouseId, categoryId, operatorId, operatorName, notes } = params;

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (categoryId) where.categoryId = categoryId;

    const items = await this.prisma['inventoryItem'].findMany({
      where,
      include: {
        warehouse: true,
      },
    });

    const stockTakingId = `ST_${Date.now()}`;
    const results = [];

    for (const item of items) {
      // 这里可以集成实际的盘点逻辑，比如扫码盘点
      // 目前只是记录当前库存状态
      const stockTakingRecord = {
        stockTakingId,
        itemId: item.id,
        itemName: item.name,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse?.name || '',
        systemQuantity: item.quantity,
        actualQuantity: item.quantity, // 实际盘点数量，这里暂时等于系统数量
        difference: new Decimal(0),
        status: 'NORMAL',
        operatorId,
        operatorName,
        notes,
        createdAt: new Date(),
      };

      results.push(stockTakingRecord);
    }

    return {
      stockTakingId,
      totalItems: results.length,
      results,
      summary: {
        normalItems: results.filter(r => r.status === 'NORMAL').length,
        abnormalItems: results.filter(r => r.status !== 'NORMAL').length,
      },
    };
  }

  // ==================== 增强的查询功能 ====================

  /**
   * 增强的库存商品查询
   */
  async findInventoryItems(query: InventoryQueryDto) {
    const {
      page = 1,
      limit = 20,
      warehouseId,
      categoryId,
      status,
      itemType,
      keyword,
      lowStock,
    } = query;

    const where: any = {};

    if (warehouseId) where.warehouseId = warehouseId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (itemType) where.itemType = itemType;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }
    if (lowStock) {
      where.quantity = { lte: 10 };
    }

    const [items, total] = await Promise.all([
      this.prisma['inventoryItem'].findMany({
        where,
        include: {
          warehouse: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma['inventoryItem'].count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取库存报表数据
   */
  async getInventoryReport(params: {
    startDate?: Date;
    endDate?: Date;
    warehouseId?: bigint;
    categoryId?: bigint;
  }) {
    const { startDate, endDate, warehouseId, categoryId } = params;

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (categoryId) where.categoryId = categoryId;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // 库存总览
    const inventoryOverview = await this.prisma['inventoryItem'].aggregate({
      where,
      _count: { id: true },
      _sum: { quantity: true },
      _avg: { unitPrice: true },
    });

    // 库存变动统计
    const transactionStats = await this.prisma['inventoryTransaction'].groupBy({
      by: ['type'],
      where: {
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        item: where,
      },
      _count: { id: true },
      _sum: { quantity: true },
    });

    // 低库存商品
    const lowStockItems = await this.prisma['inventoryItem'].findMany({
      where: {
        ...where,
        quantity: { lte: 10 },
      },
      include: { warehouse: true },
      orderBy: { quantity: 'asc' },
      take: 10,
    });

    // 零库存商品
    const outOfStockItems = await this.prisma['inventoryItem'].findMany({
      where: {
        ...where,
        quantity: { lte: 0 },
      },
      include: { warehouse: true },
      take: 10,
    });

    return {
      overview: {
        totalItems: inventoryOverview._count.id,
        totalQuantity: inventoryOverview._sum.quantity || 0,
        averagePrice: inventoryOverview._avg.unitPrice || 0,
      },
      transactions: transactionStats,
      lowStockItems,
      outOfStockItems,
      generatedAt: new Date(),
    };
  }
}