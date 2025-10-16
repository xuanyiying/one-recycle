
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
