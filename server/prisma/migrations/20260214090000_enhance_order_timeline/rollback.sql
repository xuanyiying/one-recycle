DROP INDEX IF EXISTS "order_timelines_to_status_idx";

ALTER TABLE "order_timelines"
DROP COLUMN IF EXISTS "from_status",
DROP COLUMN IF EXISTS "to_status",
DROP COLUMN IF EXISTS "operator_type",
DROP COLUMN IF EXISTS "operator_id",
DROP COLUMN IF EXISTS "reason",
DROP COLUMN IF EXISTS "raw_snapshot";
