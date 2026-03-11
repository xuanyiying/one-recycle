-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "payment_password" VARCHAR(255);

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "brand_model" VARCHAR(100),
ADD COLUMN     "condition" VARCHAR(50),
ADD COLUMN     "notes" VARCHAR(500),
ADD COLUMN     "photos" JSONB,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "regions" ALTER COLUMN "code" SET DATA TYPE VARCHAR(12),
ALTER COLUMN "parent_code" SET DATA TYPE VARCHAR(12);

-- CreateTable
CREATE TABLE "logistics_providers" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "api_url" VARCHAR(255),
    "tenant_id" VARCHAR(100),
    "app_id" VARCHAR(100),
    "app_secret" VARCHAR(255),
    "config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logistics_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_wallets" (
    "id" SERIAL NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "frozen_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_recharge" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_payout" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_password" VARCHAR(255),
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_transactions" (
    "id" BIGSERIAL NOT NULL,
    "wallet_id" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_before" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "related_order_no" VARCHAR(64),
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recharge_orders" (
    "id" BIGSERIAL NOT NULL,
    "order_no" VARCHAR(64) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recharge_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "logistics_providers_code_key" ON "logistics_providers"("code");

-- CreateIndex
CREATE INDEX "platform_transactions_wallet_id_idx" ON "platform_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "platform_transactions_type_idx" ON "platform_transactions"("type");

-- CreateIndex
CREATE INDEX "platform_transactions_created_at_idx" ON "platform_transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "recharge_orders_order_no_key" ON "recharge_orders"("order_no");

-- CreateIndex
CREATE INDEX "recharge_orders_status_idx" ON "recharge_orders"("status");
