DROP INDEX IF EXISTS "reservations_status_expires_at_idx";
DROP INDEX IF EXISTS "inventory_items_source_order_id_idx";
DROP INDEX IF EXISTS "order_timelines_to_status_idx";

ALTER TABLE "reservations"
DROP COLUMN IF EXISTS "confirmed_at",
DROP COLUMN IF EXISTS "cancelled_at",
DROP COLUMN IF EXISTS "expired_at";

ALTER TABLE "order_timelines"
DROP COLUMN IF EXISTS "from_status",
DROP COLUMN IF EXISTS "to_status",
DROP COLUMN IF EXISTS "operator_type",
DROP COLUMN IF EXISTS "operator_id",
DROP COLUMN IF EXISTS "reason",
DROP COLUMN IF EXISTS "raw_snapshot";
