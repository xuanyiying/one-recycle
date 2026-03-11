ALTER TABLE "order_timelines"
ADD COLUMN IF NOT EXISTS "from_status" "OrderStatus",
ADD COLUMN IF NOT EXISTS "to_status" "OrderStatus",
ADD COLUMN IF NOT EXISTS "operator_type" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "operator_id" BIGINT,
ADD COLUMN IF NOT EXISTS "reason" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "raw_snapshot" JSONB;

CREATE INDEX IF NOT EXISTS "order_timelines_to_status_idx" ON "order_timelines"("to_status");

ALTER TABLE "reservations"
ADD COLUMN IF NOT EXISTS "confirmed_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "expired_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "reservations_status_expires_at_idx" ON "reservations"("status", "expires_at");
CREATE INDEX IF NOT EXISTS "inventory_items_source_order_id_idx" ON "inventory_items"("source_order_id");
