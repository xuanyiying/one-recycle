ALTER TABLE "order_timelines"
ADD COLUMN IF NOT EXISTS "from_status" "OrderStatus",
ADD COLUMN IF NOT EXISTS "to_status" "OrderStatus",
ADD COLUMN IF NOT EXISTS "operator_type" VARCHAR(20),
ADD COLUMN IF NOT EXISTS "operator_id" BIGINT,
ADD COLUMN IF NOT EXISTS "reason" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "raw_snapshot" JSONB;

CREATE INDEX IF NOT EXISTS "order_timelines_to_status_idx" ON "order_timelines"("to_status");
