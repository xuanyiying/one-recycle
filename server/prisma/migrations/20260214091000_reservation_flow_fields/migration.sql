ALTER TABLE "reservations"
ADD COLUMN IF NOT EXISTS "confirmed_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "expired_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "reservations_status_expires_at_idx" ON "reservations"("status", "expires_at");
CREATE INDEX IF NOT EXISTS "inventory_items_source_order_id_idx" ON "inventory_items"("source_order_id");
