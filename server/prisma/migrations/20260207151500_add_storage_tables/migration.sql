-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "OssType" AS ENUM ('MINIO', 'AWS_S3', 'ALIYUN_OSS', 'TENCENT_COS', 'LOCAL');

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "storages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "hashMd5" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "category" TEXT,
    "thumbnailUrl" TEXT,
    "ossType" "OssType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_photos" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "storage_id" UUID NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "photo_url" VARCHAR(2048) NOT NULL,
    "file_path" VARCHAR(512) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "hash_md5" VARCHAR(32) NOT NULL,
    "file_type" "FileType" NOT NULL DEFAULT 'IMAGE',
    "category" VARCHAR(50),
    "thumbnail_url" VARCHAR(2048),
    "oss_type" "OssType" NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "storages_userId_idx" ON "storages"("userId");

-- CreateIndex
CREATE INDEX "storages_fileType_idx" ON "storages"("fileType");

-- CreateIndex
CREATE INDEX "storages_hashMd5_idx" ON "storages"("hashMd5");

-- CreateIndex
CREATE INDEX "order_photos_order_id_idx" ON "order_photos"("order_id");

-- CreateIndex
CREATE INDEX "order_photos_storage_id_idx" ON "order_photos"("storage_id");

-- CreateIndex
CREATE INDEX "order_photos_uploaded_at_idx" ON "order_photos"("uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "order_photos_order_id_file_path_key" ON "order_photos"("order_id", "file_path");

-- AddForeignKey
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_storage_id_fkey" FOREIGN KEY ("storage_id") REFERENCES "storages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
