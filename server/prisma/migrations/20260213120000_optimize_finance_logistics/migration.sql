DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'OrderStatus'
  ) THEN
    CREATE TYPE "OrderStatus" AS ENUM (
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
      'REFUNDED',
      'CANCELLED'
    );
  END IF;
END $$;

ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

-- CreateEnum
CREATE TYPE "LogisticsStatus" AS ENUM ('CREATED', 'ORDERED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "LogisticsApiAction" AS ENUM ('PRECHECK', 'CREATE_ORDER', 'SUBSCRIBE_TRACE', 'QUERY_TRACE', 'CANCEL_ORDER');

-- CreateEnum
CREATE TYPE "InventoryTxnType" AS ENUM ('IN', 'OUT', 'ADJUST', 'RESERVE', 'RELEASE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('WALLET', 'PAYOUT');

-- CreateEnum
CREATE TYPE "InboundStatus" AS ENUM ('RECEIVED', 'INSPECTING', 'INSPECTED', 'INBOUNDED');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PASS', 'FAIL', 'EXCEPTION');

-- AlterTable
ALTER TABLE "users"
ALTER COLUMN "balance" TYPE DECIMAL(12,2) USING "balance"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "orders"
ALTER COLUMN "estimated_amount" TYPE DECIMAL(12,2) USING "estimated_amount"::DECIMAL(12,2),
ALTER COLUMN "settlement_amount" TYPE DECIMAL(12,2) USING "settlement_amount"::DECIMAL(12,2),
ALTER COLUMN "pay_amount" TYPE DECIMAL(12,2) USING "pay_amount"::DECIMAL(12,2),
ALTER COLUMN "discount_amount" TYPE DECIMAL(12,2) USING "discount_amount"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "order_items"
ALTER COLUMN "unit_price" TYPE DECIMAL(12,2) USING "unit_price"::DECIMAL(12,2),
ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING "amount"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "payments"
ALTER COLUMN "total" TYPE DECIMAL(12,2) USING "total"::DECIMAL(12,2);

-- DropIndex
DROP INDEX IF EXISTS "payment_logs_transaction_id_key";

-- AlterTable
ALTER TABLE "payment_logs"
ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING "amount"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "refunds"
ALTER COLUMN "refund_amount" TYPE DECIMAL(12,2) USING "refund_amount"::DECIMAL(12,2);

-- DataMigration
UPDATE "logistics_orders"
SET "status" = CASE
  WHEN "status" IS NULL THEN 'CREATED'
  WHEN UPPER("status") IN ('CREATED','ORDERED','ACCEPTED','PICKED_UP','IN_TRANSIT','DELIVERED','CANCELLED','FAILED') THEN UPPER("status")
  WHEN UPPER("status") IN ('PENDING','WAITING') THEN 'CREATED'
  WHEN UPPER("status") IN ('SIGNED','RECEIVED') THEN 'DELIVERED'
  ELSE 'FAILED'
END;

-- AlterTable
ALTER TABLE "logistics_orders"
ADD COLUMN     "provider_status" VARCHAR(50),
ALTER COLUMN   "delivery_fee" TYPE DECIMAL(12,2) USING "delivery_fee"::DECIMAL(12,2),
ALTER COLUMN   "status" TYPE "LogisticsStatus" USING "status"::"LogisticsStatus";

-- CreateIndex
CREATE UNIQUE INDEX "logistics_orders_order_id_key" ON "logistics_orders"("order_id");

-- DataMigration
UPDATE "inventory_transactions"
SET "type" = CASE
  WHEN "type" IS NULL THEN 'ADJUST'
  WHEN UPPER("type") IN ('IN','OUT','ADJUST','RESERVE','RELEASE') THEN UPPER("type")
  ELSE 'ADJUST'
END;

-- AlterTable
ALTER TABLE "inventory_transactions"
ALTER COLUMN "type" TYPE "InventoryTxnType" USING "type"::"InventoryTxnType",
ALTER COLUMN "unit_price" TYPE DECIMAL(12,2) USING "unit_price"::DECIMAL(12,2),
ALTER COLUMN "total_price" TYPE DECIMAL(12,2) USING "total_price"::DECIMAL(12,2);

-- DataMigration
UPDATE "accounts"
SET "account_type" = CASE
  WHEN "account_type" IS NULL THEN 'WALLET'
  WHEN UPPER("account_type") IN ('WALLET','PAYOUT') THEN UPPER("account_type")
  ELSE 'WALLET'
END;

-- AlterTable
ALTER TABLE "accounts"
ALTER COLUMN "available_balance" TYPE DECIMAL(12,2) USING "available_balance"::DECIMAL(12,2),
ALTER COLUMN "frozen_balance" TYPE DECIMAL(12,2) USING "frozen_balance"::DECIMAL(12,2),
ALTER COLUMN "total_income" TYPE DECIMAL(12,2) USING "total_income"::DECIMAL(12,2),
ALTER COLUMN "total_withdrawal" TYPE DECIMAL(12,2) USING "total_withdrawal"::DECIMAL(12,2),
ALTER COLUMN "account_type" TYPE "AccountType" USING "account_type"::"AccountType";

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_id_account_type_key" ON "accounts"("user_id", "account_type");

-- AlterTable
ALTER TABLE "withdrawals"
ADD COLUMN     "idempotency_key" VARCHAR(64),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_idempotency_key_key" ON "withdrawals"("idempotency_key");

-- Preconditions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT "type", "order_id"
      FROM "transactions"
      WHERE "order_id" IS NOT NULL
      GROUP BY "type", "order_id"
      HAVING COUNT(*) > 1
    ) t
  ) THEN
    RAISE EXCEPTION 'Duplicate transactions detected for (type, order_id)';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      SELECT "type", "withdrawal_id"
      FROM "transactions"
      WHERE "withdrawal_id" IS NOT NULL
      GROUP BY "type", "withdrawal_id"
      HAVING COUNT(*) > 1
    ) t
  ) THEN
    RAISE EXCEPTION 'Duplicate transactions detected for (type, withdrawal_id)';
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_type_order_id_key" ON "transactions"("type", "order_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_type_withdrawal_id_key" ON "transactions"("type", "withdrawal_id");

-- AlterTable
ALTER TABLE "platform_wallets"
ALTER COLUMN "balance" TYPE DECIMAL(12,2) USING "balance"::DECIMAL(12,2),
ALTER COLUMN "frozen_amount" TYPE DECIMAL(12,2) USING "frozen_amount"::DECIMAL(12,2),
ALTER COLUMN "total_recharge" TYPE DECIMAL(12,2) USING "total_recharge"::DECIMAL(12,2),
ALTER COLUMN "total_payout" TYPE DECIMAL(12,2) USING "total_payout"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "platform_transactions"
ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING "amount"::DECIMAL(12,2),
ALTER COLUMN "balance_before" TYPE DECIMAL(12,2) USING "balance_before"::DECIMAL(12,2),
ALTER COLUMN "balance_after" TYPE DECIMAL(12,2) USING "balance_after"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "recharge_orders"
ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING "amount"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "recharge_plans"
ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING "amount"::DECIMAL(12,2),
ALTER COLUMN "bonus" TYPE DECIMAL(12,2) USING "bonus"::DECIMAL(12,2);

-- AlterTable
ALTER TABLE "tenants"
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "balance" TYPE DECIMAL(12,2) USING "balance"::DECIMAL(12,2),
ALTER COLUMN "frozen_balance" TYPE DECIMAL(12,2) USING "frozen_balance"::DECIMAL(12,2);

-- Preconditions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT "tenant_id", "type", "related_id"
      FROM "tenant_transactions"
      WHERE "related_id" IS NOT NULL
      GROUP BY "tenant_id", "type", "related_id"
      HAVING COUNT(*) > 1
    ) t
  ) THEN
    RAISE EXCEPTION 'Duplicate tenant_transactions detected for (tenant_id, type, related_id)';
  END IF;
END $$;

-- AlterTable
ALTER TABLE "tenant_transactions"
ALTER COLUMN "amount" TYPE DECIMAL(12,2) USING "amount"::DECIMAL(12,2),
ALTER COLUMN "balance_after" TYPE DECIMAL(12,2) USING "balance_after"::DECIMAL(12,2);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_transactions_tenant_id_type_related_id_key" ON "tenant_transactions"("tenant_id", "type", "related_id");

-- AlterTable
ALTER TABLE "settlement_records"
ALTER COLUMN "total_amount" TYPE DECIMAL(12,2) USING "total_amount"::DECIMAL(12,2),
ALTER COLUMN "goods_amount" TYPE DECIMAL(12,2) USING "goods_amount"::DECIMAL(12,2),
ALTER COLUMN "express_fee" TYPE DECIMAL(12,2) USING "express_fee"::DECIMAL(12,2),
ALTER COLUMN "platform_fee" TYPE DECIMAL(12,2) USING "platform_fee"::DECIMAL(12,2),
ALTER COLUMN "subsidy_amount" TYPE DECIMAL(12,2) USING "subsidy_amount"::DECIMAL(12,2);

-- CreateTable
CREATE TABLE "logistics_api_calls" (
    "id" BIGSERIAL NOT NULL,
    "logistics_order_id" BIGINT,
    "order_id" BIGINT NOT NULL,
    "provider_code" VARCHAR(20) NOT NULL,
    "action" "LogisticsApiAction" NOT NULL,
    "idempotency_key" VARCHAR(64),
    "request_payload" JSONB,
    "response_payload" JSONB,
    "http_status" INTEGER,
    "duration_ms" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error_code" VARCHAR(50),
    "error_message" VARCHAR(255),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logistics_api_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistics_callback_logs" (
    "id" BIGSERIAL NOT NULL,
    "logistics_order_id" BIGINT,
    "order_id" BIGINT,
    "provider_code" VARCHAR(20) NOT NULL,
    "headers" JSONB,
    "raw_body" TEXT NOT NULL,
    "parsed_body" JSONB,
    "signature_valid" BOOLEAN,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "process_error" VARCHAR(255),
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logistics_callback_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_receipts" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "warehouse_id" BIGINT NOT NULL,
    "staff_id" BIGINT,
    "status" "InboundStatus" NOT NULL DEFAULT 'RECEIVED',
    "inspection_result" "InspectionResult",
    "exception_reason" VARCHAR(255),
    "photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "received_at" TIMESTAMP(3),
    "inspected_at" TIMESTAMP(3),
    "inbounded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inbound_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "logistics_api_calls_idempotency_key_key" ON "logistics_api_calls"("idempotency_key");

-- CreateIndex
CREATE INDEX "logistics_api_calls_order_id_provider_code_action_idx" ON "logistics_api_calls"("order_id", "provider_code", "action");

-- CreateIndex
CREATE INDEX "logistics_api_calls_logistics_order_id_idx" ON "logistics_api_calls"("logistics_order_id");

-- CreateIndex
CREATE INDEX "logistics_api_calls_created_at_idx" ON "logistics_api_calls"("created_at");

-- CreateIndex
CREATE INDEX "logistics_callback_logs_provider_code_received_at_idx" ON "logistics_callback_logs"("provider_code", "received_at");

-- CreateIndex
CREATE INDEX "logistics_callback_logs_order_id_idx" ON "logistics_callback_logs"("order_id");

-- CreateIndex
CREATE INDEX "logistics_callback_logs_logistics_order_id_idx" ON "logistics_callback_logs"("logistics_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_receipts_order_id_key" ON "inbound_receipts"("order_id");

-- CreateIndex
CREATE INDEX "inbound_receipts_warehouse_id_idx" ON "inbound_receipts"("warehouse_id");

-- CreateIndex
CREATE INDEX "inbound_receipts_status_idx" ON "inbound_receipts"("status");

-- AddForeignKey
ALTER TABLE "logistics_api_calls" ADD CONSTRAINT "logistics_api_calls_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_api_calls" ADD CONSTRAINT "logistics_api_calls_logistics_order_id_fkey" FOREIGN KEY ("logistics_order_id") REFERENCES "logistics_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_callback_logs" ADD CONSTRAINT "logistics_callback_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_callback_logs" ADD CONSTRAINT "logistics_callback_logs_logistics_order_id_fkey" FOREIGN KEY ("logistics_order_id") REFERENCES "logistics_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_receipts" ADD CONSTRAINT "inbound_receipts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_receipts" ADD CONSTRAINT "inbound_receipts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_receipts" ADD CONSTRAINT "inbound_receipts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
