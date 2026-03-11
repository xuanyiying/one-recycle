DROP INDEX IF EXISTS "reservations_status_expires_at_idx";
DROP INDEX IF EXISTS "inventory_items_source_order_id_idx";

ALTER TABLE "reservations"
DROP COLUMN IF EXISTS "confirmed_at",
DROP COLUMN IF EXISTS "cancelled_at",
DROP COLUMN IF EXISTS "expired_at";
