import {
  InventoryStatus,
  ItemType,
  ItemCondition,
  TransactionType,
  MovementType,
  MovementDirection,
  ReservationStatus,
  ProcessingStatus,
  CheckType,
  CheckResult,
  AlertType,
  AlertLevel,
  AlertStatus,
  WarehouseType,
  WarehouseStatus,
} from '../entities/inventory.entity';

// 创建库存商品数据接口
export interface CreateInventoryItemData {
  warehouseId: bigint;
  categoryId: bigint;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  reservedQty?: number;
  unitPrice: number;
  location?: string;
  status?: InventoryStatus;
  itemType?: ItemType;
  condition?: ItemCondition;
  sourceOrderId?: string;
  qualityGrade?: string;
  processingStatus?: ProcessingStatus;
  expiryDate?: Date;
  batchNumber?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
}

// 更新库存商品数据接口
export interface UpdateInventoryItemData {
  name?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  reservedQty?: number;
  unitPrice?: number;
  location?: string;
  status?: InventoryStatus;
  itemType?: ItemType;
  condition?: ItemCondition;
  qualityGrade?: string;
  processingStatus?: ProcessingStatus;
  expiryDate?: Date;
  batchNumber?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
}

// 库存过滤器接口
export interface InventoryFilters {
  warehouseId?: bigint;
  categoryId?: bigint;
  name?: string;
  status?: InventoryStatus;
  itemType?: ItemType;
  condition?: ItemCondition;
  processingStatus?: ProcessingStatus;
  minQuantity?: number;
  maxQuantity?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  batchNumber?: string;
  expiryDateFrom?: Date;
  expiryDateTo?: Date;
}

// 库存排序选项接口
export interface InventorySortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// 分页选项接口
export interface PaginationOptions {
  page: number;
  pageSize: number;
  limit?: number;
  offset?: number;
}

// 创建交易数据接口
export interface CreateTransactionData {
  itemId: bigint;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  referenceId?: string;
  notes?: string;
}

// 创建预订数据接口
export interface CreateReservationData {
  itemId: bigint;
  orderId: string;
  quantity: number;
  status?: ReservationStatus;
  expiresAt: Date;
  notes?: string;
}

// 创建质量检查数据接口
export interface CreateQualityCheckData {
  itemId: bigint;
  checkerId: bigint;
  checkType: CheckType;
  result: CheckResult;
  score?: number;
  notes?: string;
  images?: string[];
  checkedAt?: Date;
}

// 创建仓库数据接口
export interface CreateWarehouseData {
  name: string;
  type: WarehouseType;
  address: string;
  contactPhone?: string;
  capacity?: number;
  status?: WarehouseStatus;
  description?: string;
}

// 更新仓库数据接口
export interface UpdateWarehouseData {
  name?: string;
  code?: string;
  type?: WarehouseType;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  capacity?: number;
  status?: WarehouseStatus;
  description?: string;
}

// 库存变动数据接口
export interface InventoryMovementData {
  itemId: string;
  warehouseId: string;
  categoryId: string;
  movementType: MovementType;
  direction?: MovementDirection;
  quantity: number;
  unitPrice?: number;
  beforeQty?: number;
  afterQty?: number;
  referenceType?: string;
  referenceId?: string;
  referenceNo?: string;
  operatorId?: string;
  operatorName?: string;
  remark?: string;
}

// 批量操作结果接口
export interface BatchOperationResult {
  successCount: number;
  failureCount: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// 库存调整数据接口
export interface StockAdjustmentData {
  itemId: string;
  newQuantity: number;
  reason?: string;
}

// 库存转移数据接口
export interface StockTransferData {
  sourceItemId: string;
  targetItemId: string;
  targetWarehouseId: string;
  quantity: number;
  reason?: string;
}

// 盘点数据接口
export interface StockTakingData {
  stockTakingNo: string;
  items: Array<{
    itemId: string;
    actualQuantity: number;
  }>;
}

// 库存报告参数接口
export interface InventoryReportParams {
  reportType: string;
  warehouseId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
}

// 销售记录数据接口
export interface SalesRecordData {
  itemId: string;
  quantity: number;
  unitPrice: number;
  orderId: string;
  customerId: string;
  soldAt?: Date;
  notes?: string;
}

// 库存警报配置接口
export interface StockAlertConfig {
  itemId: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  currentQty: number;
  thresholdQty: number;
  message: string;
}