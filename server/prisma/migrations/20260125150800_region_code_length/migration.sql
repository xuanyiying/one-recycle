-- AlterTable
ALTER TABLE "regions" ALTER COLUMN "code" TYPE VARCHAR(6);
ALTER TABLE "regions" ALTER COLUMN "parent_code" TYPE VARCHAR(6);

-- Update existing data to ensure they are 6 characters long
UPDATE "regions" SET "code" = LEFT("code", 6) WHERE LENGTH("code") > 6;
UPDATE "regions" SET "parent_code" = LEFT("parent_code", 6) WHERE "parent_code" IS NOT NULL AND LENGTH("parent_code") > 6;