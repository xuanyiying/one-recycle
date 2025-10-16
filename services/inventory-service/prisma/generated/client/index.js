
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.WarehouseScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  type: 'type',
  address: 'address',
  contactName: 'contactName',
  contactPhone: 'contactPhone',
  capacity: 'capacity',
  status: 'status',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ItemCategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  parentId: 'parentId',
  level: 'level',
  enabled: 'enabled',
  iconUrl: 'iconUrl',
  description: 'description',
  sortOrder: 'sortOrder',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InventoryItemScalarFieldEnum = {
  id: 'id',
  warehouseId: 'warehouseId',
  categoryId: 'categoryId',
  name: 'name',
  description: 'description',
  unit: 'unit',
  quantity: 'quantity',
  reservedQty: 'reservedQty',
  availableQty: 'availableQty',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice',
  location: 'location',
  status: 'status',
  itemType: 'itemType',
  condition: 'condition',
  sourceOrderId: 'sourceOrderId',
  qualityGrade: 'qualityGrade',
  processingStatus: 'processingStatus',
  expiryDate: 'expiryDate',
  batchNumber: 'batchNumber',
  minStockLevel: 'minStockLevel',
  maxStockLevel: 'maxStockLevel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InventoryTransactionScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  type: 'type',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice',
  referenceId: 'referenceId',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.SalesRecordScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice',
  orderId: 'orderId',
  customerId: 'customerId',
  soldAt: 'soldAt',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.QualityCheckScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  checkerId: 'checkerId',
  checkType: 'checkType',
  result: 'result',
  score: 'score',
  notes: 'notes',
  images: 'images',
  checkedAt: 'checkedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ReservationScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  orderId: 'orderId',
  quantity: 'quantity',
  status: 'status',
  reservedAt: 'reservedAt',
  expiresAt: 'expiresAt',
  confirmedAt: 'confirmedAt',
  cancelledAt: 'cancelledAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InventoryMovementScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  warehouseId: 'warehouseId',
  categoryId: 'categoryId',
  movementType: 'movementType',
  direction: 'direction',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalAmount: 'totalAmount',
  beforeQty: 'beforeQty',
  afterQty: 'afterQty',
  referenceType: 'referenceType',
  referenceId: 'referenceId',
  referenceNo: 'referenceNo',
  operatorId: 'operatorId',
  operatorName: 'operatorName',
  remark: 'remark',
  createdAt: 'createdAt'
};

exports.Prisma.PricingRuleScalarFieldEnum = {
  id: 'id',
  categoryId: 'categoryId',
  regionCode: 'regionCode',
  priceType: 'priceType',
  basePrice: 'basePrice',
  unit: 'unit',
  weightTiers: 'weightTiers',
  qualityFactors: 'qualityFactors',
  seasonFactors: 'seasonFactors',
  enabled: 'enabled',
  validFrom: 'validFrom',
  validTo: 'validTo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InventoryAlertScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  alertType: 'alertType',
  alertLevel: 'alertLevel',
  currentQty: 'currentQty',
  thresholdQty: 'thresholdQty',
  message: 'message',
  status: 'status',
  handledBy: 'handledBy',
  handledAt: 'handledAt',
  handlerRemark: 'handlerRemark',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.WarehouseType = exports.$Enums.WarehouseType = {
  MAIN: 'MAIN',
  BRANCH: 'BRANCH',
  TRANSIT: 'TRANSIT',
  RETURN: 'RETURN'
};

exports.WarehouseStatus = exports.$Enums.WarehouseStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE'
};

exports.InventoryStatus = exports.$Enums.InventoryStatus = {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
};

exports.ItemType = exports.$Enums.ItemType = {
  RECYCLED: 'RECYCLED',
  PURCHASED: 'PURCHASED',
  RETURNED: 'RETURNED'
};

exports.ItemCondition = exports.$Enums.ItemCondition = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  DAMAGED: 'DAMAGED'
};

exports.ProcessingStatus = exports.$Enums.ProcessingStatus = {
  RECEIVED: 'RECEIVED',
  INSPECTING: 'INSPECTING',
  PROCESSING: 'PROCESSING',
  CLEANED: 'CLEANED',
  REPAIRED: 'REPAIRED',
  READY: 'READY',
  REJECTED: 'REJECTED'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER_OUT: 'TRANSFER_OUT',
  TRANSFER_IN: 'TRANSFER_IN'
};

exports.CheckType = exports.$Enums.CheckType = {
  INITIAL: 'INITIAL',
  DETAILED: 'DETAILED',
  FINAL: 'FINAL',
  RANDOM: 'RANDOM'
};

exports.CheckResult = exports.$Enums.CheckResult = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  CONDITIONAL: 'CONDITIONAL'
};

exports.ReservationStatus = exports.$Enums.ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

exports.MovementType = exports.$Enums.MovementType = {
  PURCHASE: 'PURCHASE',
  RECYCLE_IN: 'RECYCLE_IN',
  SALE_OUT: 'SALE_OUT',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT',
  ADJUST_IN: 'ADJUST_IN',
  ADJUST_OUT: 'ADJUST_OUT',
  DAMAGE_OUT: 'DAMAGE_OUT',
  RETURN_IN: 'RETURN_IN',
  RETURN_OUT: 'RETURN_OUT'
};

exports.MovementDirection = exports.$Enums.MovementDirection = {
  IN: 'IN',
  OUT: 'OUT'
};

exports.PriceType = exports.$Enums.PriceType = {
  RECYCLE: 'RECYCLE',
  SALE: 'SALE',
  WHOLESALE: 'WHOLESALE'
};

exports.AlertType = exports.$Enums.AlertType = {
  LOW_STOCK: 'LOW_STOCK',
  HIGH_STOCK: 'HIGH_STOCK',
  EXPIRY: 'EXPIRY',
  ZERO_STOCK: 'ZERO_STOCK'
};

exports.AlertLevel = exports.$Enums.AlertLevel = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL'
};

exports.AlertStatus = exports.$Enums.AlertStatus = {
  PENDING: 'PENDING',
  HANDLED: 'HANDLED',
  IGNORED: 'IGNORED'
};

exports.Prisma.ModelName = {
  Warehouse: 'Warehouse',
  ItemCategory: 'ItemCategory',
  InventoryItem: 'InventoryItem',
  InventoryTransaction: 'InventoryTransaction',
  SalesRecord: 'SalesRecord',
  QualityCheck: 'QualityCheck',
  Reservation: 'Reservation',
  InventoryMovement: 'InventoryMovement',
  PricingRule: 'PricingRule',
  InventoryAlert: 'InventoryAlert'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/yiying/dev-app/one-recycle/services/inventory-service/prisma/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "/Users/yiying/dev-app/one-recycle/services/inventory-service/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../..",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "datasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"./generated/client\"\n}\n\n// 仓库表\nmodel Warehouse {\n  id           BigInt          @id @default(autoincrement())\n  name         String          @db.VarChar(100)\n  code         String          @unique @db.VarChar(20) // 仓库编码\n  type         WarehouseType   @default(MAIN) // 仓库类型\n  address      String          @db.VarChar(500)\n  contactName  String?         @map(\"contact_name\") @db.VarChar(50)\n  contactPhone String?         @map(\"contact_phone\") @db.VarChar(20)\n  capacity     Decimal?        @db.Decimal(10, 2) // 仓库容量(立方米)\n  status       WarehouseStatus @default(ACTIVE)\n  description  String?         @db.VarChar(500)\n  createdAt    DateTime        @default(now()) @map(\"created_at\")\n  updatedAt    DateTime        @updatedAt @map(\"updated_at\")\n\n  // 关联\n  inventoryItems InventoryItem[]\n  movements      InventoryMovement[]\n\n  @@index([type, status])\n  @@map(\"warehouses\")\n}\n\n// 商品分类表\nmodel ItemCategory {\n  id          BigInt   @id @default(autoincrement())\n  name        String   @db.VarChar(50)\n  code        String   @unique @db.VarChar(20) // 分类编码\n  parentId    BigInt?  @map(\"parent_id\")\n  level       Int      @default(1) // 分类层级\n  enabled     Boolean  @default(true)\n  iconUrl     String?  @map(\"icon_url\") @db.VarChar(255)\n  description String?  @db.VarChar(500)\n  sortOrder   Int      @default(0) @map(\"sort_order\") // 排序\n  createdAt   DateTime @default(now()) @map(\"created_at\")\n  updatedAt   DateTime @updatedAt @map(\"updated_at\")\n\n  // 自关联\n  parent   ItemCategory?  @relation(\"CategoryHierarchy\", fields: [parentId], references: [id])\n  children ItemCategory[] @relation(\"CategoryHierarchy\")\n\n  // 关联\n  inventoryItems InventoryItem[]\n  movements      InventoryMovement[]\n  pricingRules   PricingRule[]\n\n  @@index([parentId])\n  @@index([enabled, level])\n  @@map(\"item_categories\")\n}\n\nmodel InventoryItem {\n  id               BigInt           @id @default(autoincrement())\n  warehouseId      BigInt           @map(\"warehouse_id\")\n  categoryId       BigInt           @map(\"category_id\")\n  name             String           @db.VarChar(100)\n  description      String?          @db.VarChar(500)\n  unit             String           @db.VarChar(20) // 单位，如 kg, 件, 个等\n  quantity         Decimal          @db.Decimal(12, 2) // 库存数量\n  reservedQty      Decimal          @default(0) @map(\"reserved_qty\") @db.Decimal(12, 2) // 预留数量\n  availableQty     Decimal          @default(0) @map(\"available_qty\") @db.Decimal(12, 2) // 可用数量\n  unitPrice        Decimal          @map(\"unit_price\") @db.Decimal(10, 2) // 单价\n  totalPrice       Decimal          @map(\"total_price\") @db.Decimal(12, 2) // 总价值\n  location         String?          @db.VarChar(100) // 存放位置\n  status           InventoryStatus  @default(IN_STOCK)\n  itemType         ItemType         @default(RECYCLED) @map(\"item_type\") // 商品类型\n  condition        ItemCondition    @default(GOOD) // 商品状态\n  sourceOrderId    String?          @map(\"source_order_id\") @db.VarChar(50) // 来源订单ID\n  qualityGrade     String?          @map(\"quality_grade\") @db.VarChar(20) // 质量等级\n  processingStatus ProcessingStatus @default(RECEIVED) @map(\"processing_status\") // 处理状态\n  expiryDate       DateTime?        @map(\"expiry_date\") // 过期时间（如适用）\n  batchNumber      String?          @map(\"batch_number\") @db.VarChar(50) // 批次号\n  minStockLevel    Decimal?         @map(\"min_stock_level\") @db.Decimal(12, 2) // 最低库存预警\n  maxStockLevel    Decimal?         @map(\"max_stock_level\") @db.Decimal(12, 2) // 最高库存预警\n  createdAt        DateTime         @default(now()) @map(\"created_at\")\n  updatedAt        DateTime         @updatedAt @map(\"updated_at\")\n\n  // 关联\n  warehouse     Warehouse              @relation(fields: [warehouseId], references: [id])\n  category      ItemCategory           @relation(fields: [categoryId], references: [id])\n  transactions  InventoryTransaction[]\n  salesRecords  SalesRecord[]\n  qualityChecks QualityCheck[]\n  movements     InventoryMovement[]\n  reservations  Reservation[]\n\n  @@index([warehouseId, categoryId, status])\n  @@index([sourceOrderId])\n  @@map(\"inventory_items\")\n}\n\nmodel InventoryTransaction {\n  id          BigInt          @id @default(autoincrement())\n  itemId      BigInt          @map(\"item_id\")\n  type        TransactionType\n  quantity    Decimal         @db.Decimal(12, 2) // 变动数量\n  unitPrice   Decimal         @map(\"unit_price\") @db.Decimal(10, 2) // 单价\n  totalPrice  Decimal         @map(\"total_price\") @db.Decimal(12, 2) // 总价值\n  referenceId String?         @map(\"reference_id\") @db.VarChar(50) // 关联订单ID等\n  notes       String?         @db.VarChar(500)\n  createdAt   DateTime        @default(now()) @map(\"created_at\")\n  item        InventoryItem   @relation(fields: [itemId], references: [id])\n\n  @@index([itemId])\n  @@map(\"inventory_transactions\")\n}\n\nmodel SalesRecord {\n  id         BigInt        @id @default(autoincrement())\n  itemId     BigInt        @map(\"item_id\")\n  quantity   Decimal       @db.Decimal(12, 2)\n  unitPrice  Decimal       @map(\"unit_price\") @db.Decimal(10, 2)\n  totalPrice Decimal       @map(\"total_price\") @db.Decimal(12, 2)\n  orderId    String        @map(\"order_id\") @db.VarChar(50)\n  customerId BigInt        @map(\"customer_id\")\n  soldAt     DateTime      @map(\"sold_at\")\n  notes      String?       @db.VarChar(500)\n  createdAt  DateTime      @default(now()) @map(\"created_at\")\n  item       InventoryItem @relation(fields: [itemId], references: [id])\n\n  @@index([itemId])\n  @@index([orderId])\n  @@map(\"sales_records\")\n}\n\nmodel QualityCheck {\n  id        BigInt        @id @default(autoincrement())\n  itemId    BigInt        @map(\"item_id\")\n  checkerId BigInt        @map(\"checker_id\") // 检查员ID\n  checkType CheckType     @map(\"check_type\")\n  result    CheckResult\n  score     Int? // 质量评分 (1-100)\n  notes     String?       @db.VarChar(1000)\n  images    String[] // 检查照片URLs\n  checkedAt DateTime      @map(\"checked_at\")\n  createdAt DateTime      @default(now()) @map(\"created_at\")\n  item      InventoryItem @relation(fields: [itemId], references: [id])\n\n  @@index([itemId])\n  @@index([checkerId])\n  @@map(\"quality_checks\")\n}\n\nenum InventoryStatus {\n  IN_STOCK // 在库\n  LOW_STOCK // 库存不足\n  OUT_OF_STOCK // 缺货\n}\n\nenum TransactionType {\n  INBOUND // 入库\n  OUTBOUND // 出库\n  ADJUSTMENT // 调整\n  TRANSFER_OUT // 调拨出库\n  TRANSFER_IN // 调拨入库\n}\n\nenum ItemType {\n  RECYCLED // 回收商品\n  PURCHASED // 采购商品\n  RETURNED // 退货商品\n}\n\nenum ItemCondition {\n  EXCELLENT // 优秀\n  GOOD // 良好\n  FAIR // 一般\n  POOR // 较差\n  DAMAGED // 损坏\n}\n\nenum ProcessingStatus {\n  RECEIVED // 已接收\n  INSPECTING // 检查中\n  PROCESSING // 处理中\n  CLEANED // 已清洁\n  REPAIRED // 已维修\n  READY // 准备就绪\n  REJECTED // 已拒收\n}\n\nenum CheckType {\n  INITIAL // 初检\n  DETAILED // 详检\n  FINAL // 终检\n  RANDOM // 抽检\n}\n\nenum CheckResult {\n  PASSED // 通过\n  FAILED // 不通过\n  CONDITIONAL // 有条件通过\n}\n\n// 新增枚举定义\nenum WarehouseType {\n  MAIN // 主仓库\n  BRANCH // 分仓库\n  TRANSIT // 中转仓\n  RETURN // 退货仓\n}\n\nenum WarehouseStatus {\n  ACTIVE // 启用\n  INACTIVE // 停用\n  MAINTENANCE // 维护中\n}\n\n// 库存预订表\nmodel Reservation {\n  id          BigInt            @id @default(autoincrement())\n  itemId      BigInt            @map(\"item_id\")\n  orderId     String            @map(\"order_id\") @db.VarChar(50)\n  quantity    Decimal           @db.Decimal(12, 2)\n  status      ReservationStatus @default(PENDING)\n  reservedAt  DateTime          @default(now()) @map(\"reserved_at\")\n  expiresAt   DateTime?         @map(\"expires_at\")\n  confirmedAt DateTime?         @map(\"confirmed_at\")\n  cancelledAt DateTime?         @map(\"cancelled_at\")\n  notes       String?           @db.VarChar(500)\n  createdAt   DateTime          @default(now()) @map(\"created_at\")\n  updatedAt   DateTime          @updatedAt @map(\"updated_at\")\n\n  // 关联\n  item InventoryItem @relation(fields: [itemId], references: [id])\n\n  @@index([itemId, status])\n  @@index([orderId])\n  @@index([status, expiresAt])\n  @@map(\"reservations\")\n}\n\n// 库存变动记录表\nmodel InventoryMovement {\n  id            BigInt            @id @default(autoincrement())\n  itemId        BigInt            @map(\"item_id\")\n  warehouseId   BigInt            @map(\"warehouse_id\")\n  categoryId    BigInt            @map(\"category_id\")\n  movementType  MovementType      @map(\"movement_type\")\n  direction     MovementDirection // 入库/出库\n  quantity      Decimal           @db.Decimal(12, 2) // 变动数量\n  unitPrice     Decimal?          @map(\"unit_price\") @db.Decimal(10, 2) // 单价\n  totalAmount   Decimal?          @map(\"total_amount\") @db.Decimal(12, 2) // 总金额\n  beforeQty     Decimal           @map(\"before_qty\") @db.Decimal(12, 2) // 变动前数量\n  afterQty      Decimal           @map(\"after_qty\") @db.Decimal(12, 2) // 变动后数量\n  referenceType String?           @map(\"reference_type\") @db.VarChar(50) // 关联单据类型\n  referenceId   BigInt?           @map(\"reference_id\") // 关联单据ID\n  referenceNo   String?           @map(\"reference_no\") @db.VarChar(50) // 关联单据号\n  operatorId    BigInt?           @map(\"operator_id\") // 操作人ID\n  operatorName  String?           @map(\"operator_name\") @db.VarChar(50) // 操作人姓名\n  remark        String?           @db.VarChar(500) // 备注\n  createdAt     DateTime          @default(now()) @map(\"created_at\")\n\n  // 关联\n  item      InventoryItem @relation(fields: [itemId], references: [id])\n  warehouse Warehouse     @relation(fields: [warehouseId], references: [id])\n  category  ItemCategory  @relation(fields: [categoryId], references: [id])\n\n  @@index([itemId, createdAt])\n  @@index([warehouseId, movementType])\n  @@index([referenceType, referenceId])\n  @@index([createdAt])\n  @@map(\"inventory_movements\")\n}\n\n// 定价规则表\nmodel PricingRule {\n  id             BigInt    @id @default(autoincrement())\n  categoryId     BigInt    @map(\"category_id\")\n  regionCode     String?   @map(\"region_code\") @db.VarChar(20) // 地区编码\n  priceType      PriceType @map(\"price_type\") // 定价类型\n  basePrice      Decimal   @map(\"base_price\") @db.Decimal(10, 2) // 基础价格\n  unit           String    @default(\"kg\") @db.VarChar(10) // 计价单位\n  weightTiers    Json?     @map(\"weight_tiers\") // 重量阶梯定价\n  qualityFactors Json?     @map(\"quality_factors\") // 品质系数\n  seasonFactors  Json?     @map(\"season_factors\") // 季节系数\n  enabled        Boolean   @default(true)\n  validFrom      DateTime  @map(\"valid_from\") // 生效时间\n  validTo        DateTime? @map(\"valid_to\") // 失效时间\n  createdAt      DateTime  @default(now()) @map(\"created_at\")\n  updatedAt      DateTime  @updatedAt @map(\"updated_at\")\n\n  // 关联\n  category ItemCategory @relation(fields: [categoryId], references: [id])\n\n  @@index([categoryId, enabled])\n  @@index([validFrom, validTo])\n  @@map(\"pricing_rules\")\n}\n\n// 库存预警记录表\nmodel InventoryAlert {\n  id            BigInt      @id @default(autoincrement())\n  itemId        BigInt      @map(\"item_id\")\n  alertType     AlertType   @map(\"alert_type\")\n  alertLevel    AlertLevel  @map(\"alert_level\")\n  currentQty    Decimal     @map(\"current_qty\") @db.Decimal(12, 2)\n  thresholdQty  Decimal     @map(\"threshold_qty\") @db.Decimal(12, 2)\n  message       String      @db.VarChar(500)\n  status        AlertStatus @default(PENDING)\n  handledBy     BigInt?     @map(\"handled_by\") // 处理人ID\n  handledAt     DateTime?   @map(\"handled_at\")\n  handlerRemark String?     @map(\"handler_remark\") @db.VarChar(500)\n  createdAt     DateTime    @default(now()) @map(\"created_at\")\n  updatedAt     DateTime    @updatedAt @map(\"updated_at\")\n\n  @@index([status, alertLevel])\n  @@index([createdAt])\n  @@map(\"inventory_alerts\")\n}\n\nenum MovementType {\n  PURCHASE // 采购入库\n  RECYCLE_IN // 回收入库\n  SALE_OUT // 销售出库\n  TRANSFER_IN // 调拨入库\n  TRANSFER_OUT // 调拨出库\n  ADJUST_IN // 盘盈\n  ADJUST_OUT // 盘亏\n  DAMAGE_OUT // 报损出库\n  RETURN_IN // 退货入库\n  RETURN_OUT // 退货出库\n}\n\nenum MovementDirection {\n  IN // 入库\n  OUT // 出库\n}\n\nenum PriceType {\n  RECYCLE // 回收价格\n  SALE // 销售价格\n  WHOLESALE // 批发价格\n}\n\nenum AlertType {\n  LOW_STOCK // 低库存\n  HIGH_STOCK // 高库存\n  EXPIRY // 即将过期\n  ZERO_STOCK // 零库存\n}\n\nenum AlertLevel {\n  INFO // 信息\n  WARNING // 警告\n  CRITICAL // 严重\n}\n\nenum AlertStatus {\n  PENDING // 待处理\n  HANDLED // 已处理\n  IGNORED // 已忽略\n}\n\nenum ReservationStatus {\n  PENDING // 待确认\n  CONFIRMED // 已确认\n  EXPIRED // 已过期\n  CANCELLED // 已取消\n}\n",
  "inlineSchemaHash": "8a7bf5b337cab33e1e5c6bcb80344a874110d2aa3748e4231f93bac4b06147dc",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "prisma/generated/client",
    "generated/client",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Warehouse\":{\"dbName\":\"warehouses\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"WarehouseType\",\"default\":\"MAIN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"address\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactName\",\"dbName\":\"contact_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactPhone\",\"dbName\":\"contact_phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"capacity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"WarehouseStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"inventoryItems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryItem\",\"relationName\":\"InventoryItemToWarehouse\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"movements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryMovement\",\"relationName\":\"InventoryMovementToWarehouse\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ItemCategory\":{\"dbName\":\"item_categories\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentId\",\"dbName\":\"parent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"iconUrl\",\"dbName\":\"icon_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"parent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ItemCategory\",\"relationName\":\"CategoryHierarchy\",\"relationFromFields\":[\"parentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"children\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ItemCategory\",\"relationName\":\"CategoryHierarchy\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"inventoryItems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryItem\",\"relationName\":\"InventoryItemToItemCategory\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"movements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryMovement\",\"relationName\":\"InventoryMovementToItemCategory\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pricingRules\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PricingRule\",\"relationName\":\"ItemCategoryToPricingRule\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"InventoryItem\":{\"dbName\":\"inventory_items\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"warehouseId\",\"dbName\":\"warehouse_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryId\",\"dbName\":\"category_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reservedQty\",\"dbName\":\"reserved_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"availableQty\",\"dbName\":\"available_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Decimal\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unitPrice\",\"dbName\":\"unit_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalPrice\",\"dbName\":\"total_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"location\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"InventoryStatus\",\"default\":\"IN_STOCK\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemType\",\"dbName\":\"item_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ItemType\",\"default\":\"RECYCLED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"condition\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ItemCondition\",\"default\":\"GOOD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceOrderId\",\"dbName\":\"source_order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityGrade\",\"dbName\":\"quality_grade\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"processingStatus\",\"dbName\":\"processing_status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProcessingStatus\",\"default\":\"RECEIVED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiryDate\",\"dbName\":\"expiry_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"batchNumber\",\"dbName\":\"batch_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"minStockLevel\",\"dbName\":\"min_stock_level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxStockLevel\",\"dbName\":\"max_stock_level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"warehouse\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Warehouse\",\"relationName\":\"InventoryItemToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ItemCategory\",\"relationName\":\"InventoryItemToItemCategory\",\"relationFromFields\":[\"categoryId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transactions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryTransaction\",\"relationName\":\"InventoryItemToInventoryTransaction\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"salesRecords\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SalesRecord\",\"relationName\":\"InventoryItemToSalesRecord\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityChecks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"QualityCheck\",\"relationName\":\"InventoryItemToQualityCheck\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"movements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryMovement\",\"relationName\":\"InventoryItemToInventoryMovement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reservations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Reservation\",\"relationName\":\"InventoryItemToReservation\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"InventoryTransaction\":{\"dbName\":\"inventory_transactions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"dbName\":\"item_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TransactionType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unitPrice\",\"dbName\":\"unit_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalPrice\",\"dbName\":\"total_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceId\",\"dbName\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryItem\",\"relationName\":\"InventoryItemToInventoryTransaction\",\"relationFromFields\":[\"itemId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SalesRecord\":{\"dbName\":\"sales_records\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"dbName\":\"item_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unitPrice\",\"dbName\":\"unit_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalPrice\",\"dbName\":\"total_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customerId\",\"dbName\":\"customer_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"soldAt\",\"dbName\":\"sold_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryItem\",\"relationName\":\"InventoryItemToSalesRecord\",\"relationFromFields\":[\"itemId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"QualityCheck\":{\"dbName\":\"quality_checks\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"dbName\":\"item_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"checkerId\",\"dbName\":\"checker_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"checkType\",\"dbName\":\"check_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CheckType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"result\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CheckResult\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"images\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"checkedAt\",\"dbName\":\"checked_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryItem\",\"relationName\":\"InventoryItemToQualityCheck\",\"relationFromFields\":[\"itemId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Reservation\":{\"dbName\":\"reservations\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"dbName\":\"item_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"orderId\",\"dbName\":\"order_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ReservationStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reservedAt\",\"dbName\":\"reserved_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confirmedAt\",\"dbName\":\"confirmed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cancelledAt\",\"dbName\":\"cancelled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"item\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryItem\",\"relationName\":\"InventoryItemToReservation\",\"relationFromFields\":[\"itemId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"InventoryMovement\":{\"dbName\":\"inventory_movements\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"dbName\":\"item_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"warehouseId\",\"dbName\":\"warehouse_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryId\",\"dbName\":\"category_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"movementType\",\"dbName\":\"movement_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"MovementType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"direction\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"MovementDirection\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unitPrice\",\"dbName\":\"unit_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalAmount\",\"dbName\":\"total_amount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"beforeQty\",\"dbName\":\"before_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"afterQty\",\"dbName\":\"after_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceType\",\"dbName\":\"reference_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceId\",\"dbName\":\"reference_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"referenceNo\",\"dbName\":\"reference_no\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"operatorId\",\"dbName\":\"operator_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"operatorName\",\"dbName\":\"operator_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remark\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"item\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"InventoryItem\",\"relationName\":\"InventoryItemToInventoryMovement\",\"relationFromFields\":[\"itemId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"warehouse\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Warehouse\",\"relationName\":\"InventoryMovementToWarehouse\",\"relationFromFields\":[\"warehouseId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ItemCategory\",\"relationName\":\"InventoryMovementToItemCategory\",\"relationFromFields\":[\"categoryId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PricingRule\":{\"dbName\":\"pricing_rules\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"categoryId\",\"dbName\":\"category_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"regionCode\",\"dbName\":\"region_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priceType\",\"dbName\":\"price_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PriceType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"basePrice\",\"dbName\":\"base_price\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unit\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"kg\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weightTiers\",\"dbName\":\"weight_tiers\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"qualityFactors\",\"dbName\":\"quality_factors\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seasonFactors\",\"dbName\":\"season_factors\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"validFrom\",\"dbName\":\"valid_from\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"validTo\",\"dbName\":\"valid_to\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"category\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ItemCategory\",\"relationName\":\"ItemCategoryToPricingRule\",\"relationFromFields\":[\"categoryId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"InventoryAlert\":{\"dbName\":\"inventory_alerts\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"BigInt\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"dbName\":\"item_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alertType\",\"dbName\":\"alert_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AlertType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alertLevel\",\"dbName\":\"alert_level\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AlertLevel\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentQty\",\"dbName\":\"current_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thresholdQty\",\"dbName\":\"threshold_qty\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AlertStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"handledBy\",\"dbName\":\"handled_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"handledAt\",\"dbName\":\"handled_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"handlerRemark\",\"dbName\":\"handler_remark\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"InventoryStatus\":{\"values\":[{\"name\":\"IN_STOCK\",\"dbName\":null},{\"name\":\"LOW_STOCK\",\"dbName\":null},{\"name\":\"OUT_OF_STOCK\",\"dbName\":null}],\"dbName\":null},\"TransactionType\":{\"values\":[{\"name\":\"INBOUND\",\"dbName\":null},{\"name\":\"OUTBOUND\",\"dbName\":null},{\"name\":\"ADJUSTMENT\",\"dbName\":null},{\"name\":\"TRANSFER_OUT\",\"dbName\":null},{\"name\":\"TRANSFER_IN\",\"dbName\":null}],\"dbName\":null},\"ItemType\":{\"values\":[{\"name\":\"RECYCLED\",\"dbName\":null},{\"name\":\"PURCHASED\",\"dbName\":null},{\"name\":\"RETURNED\",\"dbName\":null}],\"dbName\":null},\"ItemCondition\":{\"values\":[{\"name\":\"EXCELLENT\",\"dbName\":null},{\"name\":\"GOOD\",\"dbName\":null},{\"name\":\"FAIR\",\"dbName\":null},{\"name\":\"POOR\",\"dbName\":null},{\"name\":\"DAMAGED\",\"dbName\":null}],\"dbName\":null},\"ProcessingStatus\":{\"values\":[{\"name\":\"RECEIVED\",\"dbName\":null},{\"name\":\"INSPECTING\",\"dbName\":null},{\"name\":\"PROCESSING\",\"dbName\":null},{\"name\":\"CLEANED\",\"dbName\":null},{\"name\":\"REPAIRED\",\"dbName\":null},{\"name\":\"READY\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null}],\"dbName\":null},\"CheckType\":{\"values\":[{\"name\":\"INITIAL\",\"dbName\":null},{\"name\":\"DETAILED\",\"dbName\":null},{\"name\":\"FINAL\",\"dbName\":null},{\"name\":\"RANDOM\",\"dbName\":null}],\"dbName\":null},\"CheckResult\":{\"values\":[{\"name\":\"PASSED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"CONDITIONAL\",\"dbName\":null}],\"dbName\":null},\"WarehouseType\":{\"values\":[{\"name\":\"MAIN\",\"dbName\":null},{\"name\":\"BRANCH\",\"dbName\":null},{\"name\":\"TRANSIT\",\"dbName\":null},{\"name\":\"RETURN\",\"dbName\":null}],\"dbName\":null},\"WarehouseStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null},{\"name\":\"MAINTENANCE\",\"dbName\":null}],\"dbName\":null},\"MovementType\":{\"values\":[{\"name\":\"PURCHASE\",\"dbName\":null},{\"name\":\"RECYCLE_IN\",\"dbName\":null},{\"name\":\"SALE_OUT\",\"dbName\":null},{\"name\":\"TRANSFER_IN\",\"dbName\":null},{\"name\":\"TRANSFER_OUT\",\"dbName\":null},{\"name\":\"ADJUST_IN\",\"dbName\":null},{\"name\":\"ADJUST_OUT\",\"dbName\":null},{\"name\":\"DAMAGE_OUT\",\"dbName\":null},{\"name\":\"RETURN_IN\",\"dbName\":null},{\"name\":\"RETURN_OUT\",\"dbName\":null}],\"dbName\":null},\"MovementDirection\":{\"values\":[{\"name\":\"IN\",\"dbName\":null},{\"name\":\"OUT\",\"dbName\":null}],\"dbName\":null},\"PriceType\":{\"values\":[{\"name\":\"RECYCLE\",\"dbName\":null},{\"name\":\"SALE\",\"dbName\":null},{\"name\":\"WHOLESALE\",\"dbName\":null}],\"dbName\":null},\"AlertType\":{\"values\":[{\"name\":\"LOW_STOCK\",\"dbName\":null},{\"name\":\"HIGH_STOCK\",\"dbName\":null},{\"name\":\"EXPIRY\",\"dbName\":null},{\"name\":\"ZERO_STOCK\",\"dbName\":null}],\"dbName\":null},\"AlertLevel\":{\"values\":[{\"name\":\"INFO\",\"dbName\":null},{\"name\":\"WARNING\",\"dbName\":null},{\"name\":\"CRITICAL\",\"dbName\":null}],\"dbName\":null},\"AlertStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"HANDLED\",\"dbName\":null},{\"name\":\"IGNORED\",\"dbName\":null}],\"dbName\":null},\"ReservationStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"CONFIRMED\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-darwin.dylib.node");
path.join(process.cwd(), "prisma/generated/client/libquery_engine-darwin.dylib.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "prisma/generated/client/schema.prisma")
