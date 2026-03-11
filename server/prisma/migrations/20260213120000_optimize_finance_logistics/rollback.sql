-- DropForeignKey
ALTER TABLE "inbound_receipts" DROP CONSTRAINT IF EXISTS "inbound_receipts_staff_id_fkey";
ALTER TABLE "inbound_receipts" DROP CONSTRAINT IF EXISTS "inbound_receipts_warehouse_id_fkey";
ALTER TABLE "inbound_receipts" DROP CONSTRAINT IF EXISTS "inbound_receipts_order_id_fkey";
ALTER TABLE "logistics_callback_logs" DROP CONSTRAINT IF EXISTS "logistics_callback_logs_logistics_order_id_fkey";
ALTER TABLE "logistics_callback_logs" DROP CONSTRAINT IF EXISTS "logistics_callback_logs_order_id_fkey";
ALTER TABLE "logistics_api_calls" DROP CONSTRAINT IF EXISTS "logistics_api_calls_logistics_order_id_fkey";
ALTER TABLE "logistics_api_calls" DROP CONSTRAINT IF EXISTS "logistics_api_calls_order_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "inbound_receipts";
DROP TABLE IF EXISTS "logistics_callback_logs";
DROP TABLE IF EXISTS "logistics_api_calls";

-- DropIndex
DROP INDEX IF EXISTS "tenant_transactions_tenant_id_type_related_id_key";
DROP INDEX IF EXISTS "transactions_type_withdrawal_id_key";
DROP INDEX IF EXISTS "transactions_type_order_id_key";
DROP INDEX IF EXISTS "withdrawals_idempotency_key_key";
DROP INDEX IF EXISTS "logistics_orders_order_id_key";
DROP INDEX IF EXISTS "accounts_user_id_account_type_key";

-- AlterTable
ALTER TABLE "withdrawals"
DROP COLUMN IF EXISTS "idempotency_key",
DROP COLUMN IF EXISTS "version";

-- AlterTable
ALTER TABLE "tenants"
DROP COLUMN IF EXISTS "version",
ALTER COLUMN "balance" TYPE DOUBLE PRECISION USING "balance"::DOUBLE PRECISION,
ALTER COLUMN "frozen_balance" TYPE DOUBLE PRECISION USING "frozen_balance"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "settlement_records"
ALTER COLUMN "total_amount" TYPE DOUBLE PRECISION USING "total_amount"::DOUBLE PRECISION,
ALTER COLUMN "goods_amount" TYPE DOUBLE PRECISION USING "goods_amount"::DOUBLE PRECISION,
ALTER COLUMN "express_fee" TYPE DOUBLE PRECISION USING "express_fee"::DOUBLE PRECISION,
ALTER COLUMN "platform_fee" TYPE DOUBLE PRECISION USING "platform_fee"::DOUBLE PRECISION,
ALTER COLUMN "subsidy_amount" TYPE DOUBLE PRECISION USING "subsidy_amount"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "tenant_transactions"
ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION,
ALTER COLUMN "balance_after" TYPE DOUBLE PRECISION USING "balance_after"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "recharge_plans"
ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION,
ALTER COLUMN "bonus" TYPE DOUBLE PRECISION USING "bonus"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "recharge_orders"
ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "platform_transactions"
ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION,
ALTER COLUMN "balance_before" TYPE DOUBLE PRECISION USING "balance_before"::DOUBLE PRECISION,
ALTER COLUMN "balance_after" TYPE DOUBLE PRECISION USING "balance_after"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "platform_wallets"
ALTER COLUMN "balance" TYPE DOUBLE PRECISION USING "balance"::DOUBLE PRECISION,
ALTER COLUMN "frozen_amount" TYPE DOUBLE PRECISION USING "frozen_amount"::DOUBLE PRECISION,
ALTER COLUMN "total_recharge" TYPE DOUBLE PRECISION USING "total_recharge"::DOUBLE PRECISION,
ALTER COLUMN "total_payout" TYPE DOUBLE PRECISION USING "total_payout"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "accounts"
ALTER COLUMN "available_balance" TYPE DOUBLE PRECISION USING "available_balance"::DOUBLE PRECISION,
ALTER COLUMN "frozen_balance" TYPE DOUBLE PRECISION USING "frozen_balance"::DOUBLE PRECISION,
ALTER COLUMN "total_income" TYPE DOUBLE PRECISION USING "total_income"::DOUBLE PRECISION,
ALTER COLUMN "total_withdrawal" TYPE DOUBLE PRECISION USING "total_withdrawal"::DOUBLE PRECISION,
ALTER COLUMN "account_type" TYPE TEXT USING "account_type"::TEXT;

-- AlterTable
ALTER TABLE "inventory_transactions"
ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT,
ALTER COLUMN "unit_price" TYPE DOUBLE PRECISION USING "unit_price"::DOUBLE PRECISION,
ALTER COLUMN "total_price" TYPE DOUBLE PRECISION USING "total_price"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "logistics_orders"
DROP COLUMN IF EXISTS "provider_status",
ALTER COLUMN "delivery_fee" TYPE DOUBLE PRECISION USING "delivery_fee"::DOUBLE PRECISION,
ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;

-- AlterTable
ALTER TABLE "refunds"
ALTER COLUMN "refund_amount" TYPE DOUBLE PRECISION USING "refund_amount"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "payment_logs"
ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "payment_logs_transaction_id_key" ON "payment_logs"("transaction_id");

-- AlterTable
ALTER TABLE "payments"
ALTER COLUMN "total" TYPE DOUBLE PRECISION USING "total"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "order_items"
ALTER COLUMN "unit_price" TYPE DOUBLE PRECISION USING "unit_price"::DOUBLE PRECISION,
ALTER COLUMN "amount" TYPE DOUBLE PRECISION USING "amount"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "orders"
ALTER COLUMN "estimated_amount" TYPE DOUBLE PRECISION USING "estimated_amount"::DOUBLE PRECISION,
ALTER COLUMN "settlement_amount" TYPE DOUBLE PRECISION USING "settlement_amount"::DOUBLE PRECISION,
ALTER COLUMN "pay_amount" TYPE DOUBLE PRECISION USING "pay_amount"::DOUBLE PRECISION,
ALTER COLUMN "discount_amount" TYPE DOUBLE PRECISION USING "discount_amount"::DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users"
ALTER COLUMN "balance" TYPE DOUBLE PRECISION USING "balance"::DOUBLE PRECISION;

-- RollbackEnum: OrderStatus (removes REFUNDED)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "orders" WHERE "status" = 'REFUNDED') THEN
    RAISE EXCEPTION 'Cannot rollback OrderStatus: orders contain status=REFUNDED';
  END IF;
END $$;

CREATE TYPE "OrderStatus_old" AS ENUM (
  'PENDING',
  'PENDING_PICKUP',
  'PICKED_UP',
  'IN_TRANSIT',
  'PENDING_RECEIPT',
  'INSPECTING',
  'INSPECTED',
  'INSPECTION_EXCEPTION',
  'MANUAL_PROCESSING',
  'PENDING_INBOUND',
  'INBOUNDED',
  'PENDING_SETTLEMENT',
  'COMPLETED',
  'CANCELLED'
);

ALTER TABLE "orders"
ALTER COLUMN "status" TYPE "OrderStatus_old" USING "status"::TEXT::"OrderStatus_old";

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_old" RENAME TO "OrderStatus";

-- DropEnum
DROP TYPE IF EXISTS "InspectionResult";
DROP TYPE IF EXISTS "InboundStatus";
DROP TYPE IF EXISTS "AccountType";
DROP TYPE IF EXISTS "InventoryTxnType";
DROP TYPE IF EXISTS "LogisticsApiAction";
DROP TYPE IF EXISTS "LogisticsStatus";
