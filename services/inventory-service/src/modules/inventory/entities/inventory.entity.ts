// 库存状态枚举
export enum InventoryStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

// 商品状况枚举
export enum ItemCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED',
}

// 商品类型枚举
export enum ItemType {
  RECYCLED = 'RECYCLED',
  PURCHASED = 'PURCHASED',
  RETURNED = 'RETURNED',
}

// 交易类型枚举
export enum TransactionType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
}

// 移动类型枚举
export enum MovementType {
  PURCHASE = 'PURCHASE',
  RECYCLE_IN = 'RECYCLE_IN',
  SALE_OUT = 'SALE_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUST_IN = 'ADJUST_IN',
  ADJUST_OUT = 'ADJUST_OUT',
  DAMAGE_OUT = 'DAMAGE_OUT',
  RETURN_IN = 'RETURN_IN',
  RETURN_OUT = 'RETURN_OUT',
}

// 移动方向枚举
export enum MovementDirection {
  IN = 'IN',
  OUT = 'OUT',
}

// 预订状态枚举
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// 处理状态枚举
export enum ProcessingStatus {
  RECEIVED = 'RECEIVED',
  INSPECTING = 'INSPECTING',
  PROCESSING = 'PROCESSING',
  CLEANED = 'CLEANED',
  REPAIRED = 'REPAIRED',
  READY = 'READY',
  REJECTED = 'REJECTED',
}

// 检查类型枚举
export enum CheckType {
  INITIAL = 'INITIAL',
  DETAILED = 'DETAILED',
  FINAL = 'FINAL',
  RANDOM = 'RANDOM',
}

// 检查结果枚举
export enum CheckResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CONDITIONAL = 'CONDITIONAL',
}

// 警报类型枚举
export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  HIGH_STOCK = 'HIGH_STOCK',
  EXPIRY = 'EXPIRY',
  ZERO_STOCK = 'ZERO_STOCK',
}

// 警报级别枚举
export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

// 警报状态枚举
export enum AlertStatus {
  PENDING = 'PENDING',
  HANDLED = 'HANDLED',
  IGNORED = 'IGNORED',
}

// 仓库类型枚举
export enum WarehouseType {
  MAIN = 'MAIN',
  BRANCH = 'BRANCH',
  TRANSIT = 'TRANSIT',
  RETURN = 'RETURN',
}

// 仓库状态枚举
export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

// 基础实体类
export abstract class BaseEntity {
  id: bigint;
  createdAt: Date;
  updatedAt: Date;
}

// 库存商品实体
export class InventoryItemEntity extends BaseEntity {
  warehouseId: bigint;
  categoryId: bigint;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  unitPrice: number;
  totalPrice: number;
  location?: string;
  status: InventoryStatus;
  itemType: ItemType;
  condition: ItemCondition;
  sourceOrderId?: bigint;
  qualityGrade?: string;
  processingStatus: ProcessingStatus;
  expiryDate?: Date;
  batchNumber?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
}

// 仓库实体
export class WarehouseEntity extends BaseEntity {
  name: string;
  code: string;
  type: WarehouseType;
  address: string;
  contactName?: string;
  contactPhone?: string;
  capacity?: number;
  status: WarehouseStatus;
  description?: string;
}

// 分类实体
export class CategoryEntity extends BaseEntity {
  name: string;
  code: string;
  parentId?: string;
  level: number;
  enabled: boolean;
  iconUrl?: string;
  description?: string;
  sortOrder: number;
}

// 库存交易实体
export class InventoryTransactionEntity extends BaseEntity {
  itemId: bigint;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  referenceId?: string;
  notes?: string;
}

// 库存预订实体
export class InventoryReservationEntity extends BaseEntity {
  itemId: bigint;
  orderId: string;
  quantity: number;
  status: ReservationStatus;
  reservedAt: Date;
  expiresAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  notes?: string;
}

// 质量检查实体
export class QualityCheckEntity extends BaseEntity {
  itemId: bigint;
  checkerId: bigint;
  checkType: CheckType;
  result: CheckResult;
  score?: number;
  notes?: string;
  images: string[];
  checkedAt: Date;
}

// 库存警报实体
export class StockAlertEntity extends BaseEntity {
  itemId: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  currentQty: number;
  thresholdQty: number;
  message: string;
  status: AlertStatus;
  handledBy?: string;
  handledAt?: Date;
  handlerRemark?: string;
}

// 库存统计实体
export class InventoryStatsEntity {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  inStockItems: number;
  expiringSoonItems: number;
  averageValue: number;
}

// 库存搜索结果实体
export class InventorySearchResultEntity {
  items: InventoryItemEntity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  limit?: number;
}

// 批量操作结果实体
export class InventoryBatchResultEntity {
  successCount: number;
  failureCount: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
  success?: boolean;
}

// 库存报告实体
export class InventoryReportEntity {
  reportType: string;
  generatedAt: Date;
  data: any;
  summary: {
    totalItems: number;
    totalValue: number;
    period: string;
  };
}

// 库存移动实体
export class InventoryMovementEntity extends BaseEntity {
  itemId: string;
  warehouseId: string;
  categoryId: string;
  movementType: MovementType;
  direction: MovementDirection;
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  beforeQty: number;
  afterQty: number;
  referenceType?: string;
  referenceId?: string;
  referenceNo?: string;
  operatorId?: string;
  operatorName?: string;
  remark?: string;
}