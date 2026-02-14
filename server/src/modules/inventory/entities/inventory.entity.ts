import {
  InventoryStatus,
  ItemType,
  ItemCondition,
  ProcessingStatus,
  ReservationStatus,
  WarehouseStatus,
  WarehouseType,
  CourierStatus,
  TaskStatus,
  InventoryTxnType,
  WithdrawalStatus,
  InventoryItem,
  InventoryTransaction,
  Reservation,
  QualityCheck,
  Warehouse,
} from '@prisma/client';

export {
  InventoryStatus,
  ItemType,
  ItemCondition,
  ProcessingStatus,
  ReservationStatus,
  WarehouseStatus,
  WarehouseType,
  CourierStatus,
  TaskStatus,
  InventoryTxnType,
  WithdrawalStatus,
};

export { InventoryItem as InventoryItemEntity };
export { InventoryTransaction as InventoryTransactionEntity };
export { Reservation as InventoryReservationEntity };
export { QualityCheck as QualityCheckEntity };
export { Warehouse as WarehouseEntity };

// Define missing types that are just strings in Prisma Schema
export const CheckType = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
  ROUTINE: 'ROUTINE',
  ADHOC: 'ADHOC',
} as const;
export type CheckType = (typeof CheckType)[keyof typeof CheckType];

export const CheckResult = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  WARNING: 'WARNING',
} as const;
export type CheckResult = (typeof CheckResult)[keyof typeof CheckResult];

export const AlertType = {
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  EXPIRY: 'EXPIRY',
  QUALITY: 'QUALITY',
} as const;
export type AlertType = (typeof AlertType)[keyof typeof AlertType];

export const AlertLevel = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;
export type AlertLevel = (typeof AlertLevel)[keyof typeof AlertLevel];

export interface InventorySearchResultEntity {
  items: any[]; // InventoryItemEntity[] but loose typing to avoid circular deps if any
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface InventoryStatsEntity {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  inStockItems: number;
  expiringSoonItems: number;
  averageValue: number;
}
