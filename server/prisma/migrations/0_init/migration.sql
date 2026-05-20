npm warn Unknown project config "public-hoist-pattern". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown project config "shamefully-hoist". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
npm warn Unknown project config "strict-dep-builds". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PENDING_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'PENDING_RECEIPT', 'INSPECTING', 'INSPECTED', 'INSPECTION_EXCEPTION', 'MANUAL_PROCESSING', 'PENDING_INBOUND', 'INBOUNDED', 'PENDING_SETTLEMENT', 'COMPLETED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LogisticsStatus" AS ENUM ('CREATED', 'ORDERED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "LogisticsApiAction" AS ENUM ('PRECHECK', 'CREATE_ORDER', 'SUBSCRIBE_TRACE', 'QUERY_TRACE', 'CANCEL_ORDER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('WECHAT', 'ALIPAY', 'UNIONPAY', 'BALANCE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SMS', 'EMAIL', 'PUSH', 'IN_APP', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('ORDER_CONFIRMATION', 'PAYMENT_SUCCESS', 'DELIVERY_UPDATE', 'SYSTEM_ALERT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "InventoryTxnType" AS ENUM ('IN', 'OUT', 'ADJUST', 'RESERVE', 'RELEASE');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'RESERVED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('RECYCLED', 'NEW', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('RECEIVED', 'INSPECTING', 'CLEANING', 'REPAIRING', 'READY_FOR_SALE', 'SOLD');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('MAIN', 'BRANCH', 'DISTRIBUTION');

-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "CourierStatus" AS ENUM ('OFFLINE', 'AVAILABLE', 'BUSY', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('WALLET', 'PAYOUT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ORDER_INCOME', 'WITHDRAWAL_FREEZE', 'WITHDRAWAL_SUCCESS', 'WITHDRAWAL_FAILED', 'WITHDRAWAL_REJECTED', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REJECTED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'DISABLED', 'DELETED');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('BUSINESS', 'RETURN', 'INVOICE', 'RECEIPT');

-- CreateEnum
CREATE TYPE "SettlementCycle" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "TenantTransactionType" AS ENUM ('ORDER_INCOME', 'EXPRESS_DEDUCTION', 'PLATFORM_FEE', 'WITHDRAWAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "InboundStatus" AS ENUM ('RECEIVED', 'INSPECTING', 'INSPECTED', 'INBOUNDED');

-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PASS', 'FAIL', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "OssType" AS ENUM ('MINIO', 'AWS_S3', 'ALIYUN_OSS', 'TENCENT_COS', 'LOCAL');

-- CreateEnum
CREATE TYPE "ChatSessionType" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "ChatSessionStatus" AS ENUM ('ACTIVE', 'WAITING', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChatSenderType" AS ENUM ('USER', 'AGENT', 'SYSTEM', 'AI');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'IMAGE', 'VOICE', 'ORDER_CARD', 'TICKET_CARD', 'QUICK_ACTION', 'SYSTEM_NOTICE');

-- CreateEnum
CREATE TYPE "ChatMessageStatus" AS ENUM ('SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('ORDER', 'RECYCLE', 'PAYMENT', 'LOGISTICS', 'ACCOUNT', 'GENERAL');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('ORDER_CANCEL', 'ORDER_MODIFY', 'REFUND_REQUEST', 'LOGISTICS_ISSUE', 'RECYCLE_ISSUE', 'PRICE_DISPUTE', 'TIME_RESCHEDULE', 'COMPLAINT', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'PROCESSING', 'RESOLVED', 'CLOSED', 'REOPENED');

-- CreateEnum
CREATE TYPE "TicketAction" AS ENUM ('CREATE', 'ASSIGN', 'UPDATE', 'RESOLVE', 'CLOSE', 'REOPEN');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('VIRTUAL', 'PHYSICAL');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PointsOrderStatus" AS ENUM ('PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PointsType" AS ENUM ('ORDER_REWARD', 'SIGN_IN', 'INVITE', 'TASK', 'EXCHANGE', 'ADJUST', 'REFUND');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PROFILE_COMPLETE', 'FIRST_ORDER', 'REVIEW', 'SHARE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TaskRecordStatus" AS ENUM ('COMPLETED');

-- CreateEnum
CREATE TYPE "ReferralRewardStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FAQCategory" AS ENUM ('SERVICE', 'PAYMENT', 'CATEGORY', 'POINTS', 'ACCOUNT', 'GENERAL');

-- CreateEnum
CREATE TYPE "RecycleRuleCategory" AS ENUM ('SERVICE_TYPE', 'SERVICE_SCOPE', 'PROCESS', 'STANDARD', 'POINTS_RULE', 'NOTICE');

-- CreateTable
CREATE TABLE "system_configs" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "app_id" TEXT NOT NULL,
    "app_secret" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_versions" (
    "id" SERIAL NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "build_number" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "force_update" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PRODUCT',
    "parent_id" INTEGER,
    "icon" TEXT,
    "price_info" TEXT NOT NULL,
    "seo" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "attributes" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "mobile" VARCHAR(20),
    "email" VARCHAR(100),
    "nickname" VARCHAR(50),
    "real_name" VARCHAR(50),
    "avatar_url" VARCHAR(255),
    "password" VARCHAR(255),
    "gender" TEXT,
    "birthday" TIMESTAMP(3),
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "level" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "mobile" VARCHAR(20) NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "town" VARCHAR(50) NOT NULL,
    "street" VARCHAR(50) NOT NULL,
    "zip_code" VARCHAR(10) NOT NULL,
    "detail" VARCHAR(255) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_identities" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "provider" VARCHAR(20) NOT NULL,
    "app_id" VARCHAR(100) NOT NULL,
    "openid" VARCHAR(100) NOT NULL,
    "unionid" VARCHAR(100),
    "session_key" VARCHAR(100),
    "access_token" TEXT,
    "refresh_token" TEXT,
    "expires_in" INTEGER,
    "scope" VARCHAR(200),
    "extra_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGSERIAL NOT NULL,
    "order_no" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "address_id" BIGINT NOT NULL,
    "order_type" TEXT NOT NULL DEFAULT 'RECYCLE',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "expect_pickup_time" TIMESTAMP(3),
    "actual_pickup_time" TIMESTAMP(3),
    "expect_delivery_time" TIMESTAMP(3),
    "actual_delivery_time" TIMESTAMP(3),
    "estimated_amount" DECIMAL(12,2) NOT NULL,
    "settlement_amount" DECIMAL(12,2) NOT NULL,
    "pay_amount" DECIMAL(12,2) NOT NULL,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "coupon_id" TEXT,
    "channel" TEXT NOT NULL,
    "remark" TEXT,
    "source" TEXT,
    "source_app_version" TEXT,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "cancel_reason" TEXT,
    "cancel_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tenant_id" BIGINT,
    "target_warehouse_id" BIGINT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logistics_orders" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "logistics_no" TEXT,
    "logistics_company" TEXT,
    "status" "LogisticsStatus" NOT NULL DEFAULT 'CREATED',
    "provider_status" VARCHAR(50),
    "sender_name" TEXT,
    "sender_phone" TEXT,
    "sender_address" TEXT,
    "receiver_name" TEXT,
    "receiver_phone" TEXT,
    "receiver_address" TEXT,
    "estimated_pickup_time" TIMESTAMP(3),
    "actual_pickup_time" TIMESTAMP(3),
    "estimated_delivery_time" TIMESTAMP(3),
    "actual_delivery_time" TIMESTAMP(3),
    "delivery_fee" DECIMAL(12,2),
    "provider_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logistics_orders_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "order_assignments" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "courier_id" TEXT NOT NULL,
    "task_id" TEXT,
    "order_no" TEXT NOT NULL,
    "waybill_no" TEXT,
    "pickup_code" TEXT,
    "status" "TaskStatus" NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "arrived_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "notes" TEXT,
    "estimated_duration" INTEGER,
    "actual_duration" INTEGER,
    "pickup_location" JSONB,
    "delivery_location" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "estimated_weight" DECIMAL(10,2) NOT NULL,
    "actual_weight" DECIMAL(10,2),
    "unit_price" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" VARCHAR(50),
    "photos" JSONB,
    "brand_model" VARCHAR(100),
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "out_trade_no" TEXT NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "notify_raw" TEXT,
    "paid_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_logs" (
    "id" BIGSERIAL NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "order_id" BIGINT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "raw_data" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(12) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "level" INTEGER NOT NULL,
    "parent_code" VARCHAR(12),
    "pinyin" VARCHAR(100),
    "abbr" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "out_refund_no" TEXT NOT NULL,
    "refund_amount" DECIMAL(12,2) NOT NULL,
    "status" "RefundStatus" NOT NULL,
    "reason" TEXT,
    "notify_raw" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGINT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "priority" "NotificationPriority" NOT NULL,
    "recipient" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "delivery_options" JSONB,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TemplateType" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_batches" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "total_count" INTEGER NOT NULL,
    "sent_count" INTEGER NOT NULL,
    "delivered_count" INTEGER NOT NULL,
    "failed_count" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" BIGSERIAL NOT NULL,
    "warehouse_id" BIGINT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "reserved_qty" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "available_qty" DECIMAL(12,2) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "location" TEXT,
    "status" "InventoryStatus" NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "condition" "ItemCondition" NOT NULL,
    "source_order_id" BIGINT,
    "quality_grade" TEXT,
    "processing_status" "ProcessingStatus" NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "batch_number" TEXT,
    "min_stock_level" DOUBLE PRECISION,
    "max_stock_level" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "brand" TEXT,
    "model" TEXT,
    "images" TEXT[],
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" BIGSERIAL NOT NULL,
    "item_id" BIGINT NOT NULL,
    "type" "InventoryTxnType" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "reference_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" BIGSERIAL NOT NULL,
    "item_id" BIGINT NOT NULL,
    "order_id" BIGINT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "reserved_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_checks" (
    "id" BIGSERIAL NOT NULL,
    "item_id" BIGINT NOT NULL,
    "checker_id" BIGINT NOT NULL,
    "check_type" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "score" INTEGER,
    "notes" TEXT,
    "images" TEXT[],
    "checked_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "WarehouseType" NOT NULL,
    "address" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "capacity" INTEGER,
    "status" "WarehouseStatus" NOT NULL,
    "description" TEXT,
    "tenant_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couriers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "id_card" TEXT,
    "avatar_url" TEXT,
    "status" "CourierStatus" NOT NULL DEFAULT 'OFFLINE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "workingHours" JSONB,
    "serviceAreas" TEXT[],
    "vehicle_type" TEXT,
    "vehicle_plate" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "cancelled_orders" INTEGER NOT NULL DEFAULT 0,
    "rejected_orders" INTEGER NOT NULL DEFAULT 0,
    "last_online_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "couriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pickup_notifications" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "order_id" BIGINT NOT NULL,
    "order_no" TEXT NOT NULL,
    "courier_id" TEXT NOT NULL,
    "waybill_no" TEXT,
    "pickup_code" TEXT,
    "sender_info" JSONB NOT NULL,
    "receiver_info" JSONB NOT NULL,
    "priority" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "response" JSONB,

    CONSTRAINT "pickup_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorites" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "item_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_feedbacks" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "order_id" BIGINT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reply" TEXT,
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_timelines" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus",
    "message" TEXT NOT NULL,
    "operator" TEXT,
    "operator_type" VARCHAR(20),
    "operator_id" BIGINT,
    "reason" VARCHAR(255),
    "raw_snapshot" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_feedbacks" (
    "id" BIGSERIAL NOT NULL,
    "courier_id" TEXT NOT NULL,
    "user_id" BIGINT,
    "order_id" BIGINT,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_feedbacks" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "courier_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,
    "images" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "available_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "frozen_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_income" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_withdrawal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 0,
    "account_type" "AccountType" NOT NULL DEFAULT 'WALLET',
    "account_details" JSONB NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "payment_password" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" BIGSERIAL NOT NULL,
    "account_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "out_trade_no" VARCHAR(128) NOT NULL,
    "idempotency_key" VARCHAR(64),
    "transaction_id" BIGINT,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "account_info" JSONB NOT NULL,
    "admin_id" BIGINT,
    "processed_at" TIMESTAMP(3),
    "rejected_reason" VARCHAR(255),
    "callback_data" JSONB,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" BIGSERIAL NOT NULL,
    "account_id" BIGINT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "balance_before" DECIMAL(10,2) NOT NULL,
    "balance_after" DECIMAL(10,2) NOT NULL,
    "order_id" VARCHAR(64),
    "withdrawal_id" BIGINT,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

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
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "frozen_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_recharge" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_payout" DECIMAL(12,2) NOT NULL DEFAULT 0,
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
    "amount" DECIMAL(12,2) NOT NULL,
    "balance_before" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "related_order_no" VARCHAR(64),
    "description" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recharge_orders" (
    "id" BIGSERIAL NOT NULL,
    "order_no" VARCHAR(64) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recharge_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recharge_plans" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recharge_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "contact_name" VARCHAR(50),
    "contact_phone" VARCHAR(20),
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "frozen_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "settlement_cycle" "SettlementCycle" NOT NULL DEFAULT 'MONTHLY',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "tenant_id" BIGINT,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "parent_id" INTEGER,
    "description" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "staffs" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "role_id" INTEGER NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "real_name" VARCHAR(50),
    "mobile" VARCHAR(20),
    "email" VARCHAR(100),
    "avatar_url" VARCHAR(255),
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_addresses" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "type" "AddressType" NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "street" VARCHAR(100),
    "detail" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(50) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recycle_pricing_rules" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "min_weight" DECIMAL(10,2),
    "max_weight" DECIMAL(10,2),
    "rule_json" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recycle_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_transactions" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "type" "TenantTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "related_type" TEXT,
    "related_id" TEXT,
    "remark" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlement_records" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "order_id" BIGINT NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "goods_amount" DECIMAL(12,2) NOT NULL,
    "express_fee" DECIMAL(12,2) NOT NULL,
    "platform_fee" DECIMAL(12,2) NOT NULL,
    "subsidy_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "settled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settlement_records_pkey" PRIMARY KEY ("id")
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
    "photos" TEXT[],
    "received_at" TIMESTAMP(3),
    "inspected_at" TIMESTAMP(3),
    "inbounded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbound_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "hash_md5" TEXT NOT NULL,
    "file_type" "FileType" NOT NULL,
    "category" TEXT,
    "thumbnail_url" TEXT,
    "oss_type" "OssType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_photos" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "storage_id" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "agent_id" BIGINT,
    "type" "ChatSessionType" NOT NULL DEFAULT 'AUTO',
    "status" "ChatSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "topic" VARCHAR(200),
    "context" JSONB,
    "satisfaction_rating" INTEGER,
    "feedback" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "sender_type" "ChatSenderType" NOT NULL,
    "sender_id" BIGINT,
    "message_type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "media_url" VARCHAR(512),
    "extra_data" JSONB,
    "status" "ChatMessageStatus" NOT NULL DEFAULT 'SENT',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" BIGSERIAL NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT[],
    "intent" VARCHAR(100),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_tickets" (
    "id" BIGSERIAL NOT NULL,
    "ticket_no" VARCHAR(32) NOT NULL,
    "session_id" BIGINT,
    "user_id" BIGINT NOT NULL,
    "order_id" BIGINT,
    "type" "TicketType" NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "attachments" TEXT[],
    "assigned_to" BIGINT,
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "service_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_histories" (
    "id" BIGSERIAL NOT NULL,
    "ticket_id" BIGINT NOT NULL,
    "operator_id" BIGINT,
    "action" "TicketAction" NOT NULL,
    "from_status" "TicketStatus",
    "to_status" "TicketStatus",
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_replies" (
    "id" BIGSERIAL NOT NULL,
    "agent_id" BIGINT,
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quick_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_service_stats" (
    "id" BIGSERIAL NOT NULL,
    "date" DATE NOT NULL,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "auto_sessions" INTEGER NOT NULL DEFAULT 0,
    "manual_sessions" INTEGER NOT NULL DEFAULT 0,
    "total_tickets" INTEGER NOT NULL DEFAULT 0,
    "resolved_tickets" INTEGER NOT NULL DEFAULT 0,
    "avg_response_time" INTEGER,
    "avg_satisfaction" DECIMAL(3,2),
    "ai_resolve_rate" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_service_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_products" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "cover_image" VARCHAR(500),
    "images" TEXT[],
    "type" "ProductType" NOT NULL DEFAULT 'VIRTUAL',
    "points" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sold_count" INTEGER NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "category_id" INTEGER,
    "extra_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_product_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "icon" VARCHAR(200),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_orders" (
    "id" BIGSERIAL NOT NULL,
    "order_no" VARCHAR(64) NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "product_name" VARCHAR(100) NOT NULL,
    "product_image" VARCHAR(500),
    "product_type" "ProductType" NOT NULL,
    "points" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "PointsOrderStatus" NOT NULL DEFAULT 'PENDING',
    "address_id" BIGINT,
    "address_snapshot" JSONB,
    "logistics_no" VARCHAR(100),
    "logistics_company" VARCHAR(50),
    "remark" VARCHAR(255),
    "shipped_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_records" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" "PointsType" NOT NULL,
    "points" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "source_type" VARCHAR(20),
    "source_id" VARCHAR(64),
    "description" VARCHAR(255) NOT NULL,
    "operator_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sign_in_records" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "sign_in_date" DATE NOT NULL,
    "continuous_days" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sign_in_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_tasks" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "type" "TaskType" NOT NULL,
    "points" INTEGER NOT NULL,
    "icon" VARCHAR(200),
    "config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_records" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "task_id" BIGINT NOT NULL,
    "status" "TaskRecordStatus" NOT NULL DEFAULT 'COMPLETED',
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_records" (
    "id" BIGSERIAL NOT NULL,
    "inviter_id" BIGINT NOT NULL,
    "invitee_id" BIGINT NOT NULL,
    "reward_points" INTEGER NOT NULL DEFAULT 0,
    "total_order_rewards" INTEGER NOT NULL DEFAULT 0,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_rewards" (
    "id" BIGSERIAL NOT NULL,
    "invite_record_id" BIGINT NOT NULL,
    "order_id" BIGINT NOT NULL,
    "inviter_id" BIGINT NOT NULL,
    "invitee_id" BIGINT NOT NULL,
    "reward_points" INTEGER NOT NULL,
    "order_amount" DECIMAL(12,2) NOT NULL,
    "reward_type" VARCHAR(20) NOT NULL,
    "reward_value" DECIMAL(12,2) NOT NULL,
    "status" "ReferralRewardStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" BIGSERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" "FAQCategory" NOT NULL DEFAULT 'GENERAL',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recycle_rules" (
    "id" BIGSERIAL NOT NULL,
    "category" "RecycleRuleCategory" NOT NULL DEFAULT 'SERVICE_TYPE',
    "title" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "extra" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recycle_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_warehouse_configs" (
    "id" BIGSERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "warehouse_id" BIGINT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_warehouse_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PointsProductToPointsProductCategory" (
    "A" BIGINT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PointsProductToPointsProductCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_code_key" ON "platforms"("code");

-- CreateIndex
CREATE INDEX "app_versions_platform_id_idx" ON "app_versions"("platform_id");

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_mobile_idx" ON "users"("mobile");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "user_identities_user_id_idx" ON "user_identities"("user_id");

-- CreateIndex
CREATE INDEX "user_identities_unionid_idx" ON "user_identities"("unionid");

-- CreateIndex
CREATE UNIQUE INDEX "user_identities_provider_openid_key" ON "user_identities"("provider", "openid");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_no_key" ON "orders"("order_no");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_order_type_idx" ON "orders"("order_type");

-- CreateIndex
CREATE INDEX "orders_channel_idx" ON "orders"("channel");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_target_warehouse_id_idx" ON "orders"("target_warehouse_id");

-- CreateIndex
CREATE INDEX "orders_user_id_status_idx" ON "orders"("user_id", "status");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "orders_tenant_id_idx" ON "orders"("tenant_id");

-- CreateIndex
CREATE INDEX "orders_completed_at_idx" ON "orders"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "logistics_orders_logistics_no_key" ON "logistics_orders"("logistics_no");

-- CreateIndex
CREATE UNIQUE INDEX "logistics_orders_order_id_key" ON "logistics_orders"("order_id");

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
CREATE INDEX "order_assignments_courier_id_idx" ON "order_assignments"("courier_id");

-- CreateIndex
CREATE INDEX "order_assignments_order_id_idx" ON "order_assignments"("order_id");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_category_id_idx" ON "order_items"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_out_trade_no_key" ON "payments"("out_trade_no");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_provider_idx" ON "payments"("provider");

-- CreateIndex
CREATE INDEX "payment_logs_transaction_id_idx" ON "payment_logs"("transaction_id");

-- CreateIndex
CREATE INDEX "payment_logs_order_id_idx" ON "payment_logs"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE INDEX "regions_parent_code_idx" ON "regions"("parent_code");

-- CreateIndex
CREATE INDEX "regions_level_idx" ON "regions"("level");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_out_refund_no_key" ON "refunds"("out_refund_no");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "inventory_items_warehouse_id_idx" ON "inventory_items"("warehouse_id");

-- CreateIndex
CREATE INDEX "inventory_items_category_id_idx" ON "inventory_items"("category_id");

-- CreateIndex
CREATE INDEX "inventory_items_status_idx" ON "inventory_items"("status");

-- CreateIndex
CREATE INDEX "inventory_items_processing_status_idx" ON "inventory_items"("processing_status");

-- CreateIndex
CREATE INDEX "inventory_items_source_order_id_idx" ON "inventory_items"("source_order_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_item_id_idx" ON "inventory_transactions"("item_id");

-- CreateIndex
CREATE INDEX "reservations_item_id_idx" ON "reservations"("item_id");

-- CreateIndex
CREATE INDEX "reservations_order_id_idx" ON "reservations"("order_id");

-- CreateIndex
CREATE INDEX "reservations_status_expires_at_idx" ON "reservations"("status", "expires_at");

-- CreateIndex
CREATE INDEX "quality_checks_item_id_idx" ON "quality_checks"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE INDEX "warehouses_tenant_id_idx" ON "warehouses"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "couriers_phone_key" ON "couriers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "couriers_email_key" ON "couriers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "couriers_id_card_key" ON "couriers"("id_card");

-- CreateIndex
CREATE INDEX "couriers_status_idx" ON "couriers"("status");

-- CreateIndex
CREATE INDEX "couriers_phone_idx" ON "couriers"("phone");

-- CreateIndex
CREATE INDEX "pickup_notifications_courier_id_idx" ON "pickup_notifications"("courier_id");

-- CreateIndex
CREATE INDEX "pickup_notifications_order_id_idx" ON "pickup_notifications"("order_id");

-- CreateIndex
CREATE INDEX "user_favorites_user_id_idx" ON "user_favorites"("user_id");

-- CreateIndex
CREATE INDEX "user_favorites_item_id_idx" ON "user_favorites"("item_id");

-- CreateIndex
CREATE INDEX "user_feedbacks_user_id_idx" ON "user_feedbacks"("user_id");

-- CreateIndex
CREATE INDEX "user_feedbacks_order_id_idx" ON "user_feedbacks"("order_id");

-- CreateIndex
CREATE INDEX "user_feedbacks_status_idx" ON "user_feedbacks"("status");

-- CreateIndex
CREATE INDEX "order_timelines_order_id_idx" ON "order_timelines"("order_id");

-- CreateIndex
CREATE INDEX "order_timelines_status_idx" ON "order_timelines"("status");

-- CreateIndex
CREATE INDEX "order_timelines_to_status_idx" ON "order_timelines"("to_status");

-- CreateIndex
CREATE INDEX "courier_feedbacks_courier_id_idx" ON "courier_feedbacks"("courier_id");

-- CreateIndex
CREATE INDEX "courier_feedbacks_user_id_idx" ON "courier_feedbacks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_feedbacks_order_id_key" ON "order_feedbacks"("order_id");

-- CreateIndex
CREATE INDEX "order_feedbacks_user_id_idx" ON "order_feedbacks"("user_id");

-- CreateIndex
CREATE INDEX "order_feedbacks_courier_id_idx" ON "order_feedbacks"("courier_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "accounts_account_type_idx" ON "accounts"("account_type");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_id_account_type_key" ON "accounts"("user_id", "account_type");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_out_trade_no_key" ON "withdrawals"("out_trade_no");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawals_idempotency_key_key" ON "withdrawals"("idempotency_key");

-- CreateIndex
CREATE INDEX "withdrawals_account_id_idx" ON "withdrawals"("account_id");

-- CreateIndex
CREATE INDEX "withdrawals_user_id_idx" ON "withdrawals"("user_id");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- CreateIndex
CREATE INDEX "withdrawals_created_at_idx" ON "withdrawals"("created_at");

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");

-- CreateIndex
CREATE INDEX "transactions_order_id_idx" ON "transactions"("order_id");

-- CreateIndex
CREATE INDEX "transactions_withdrawal_id_idx" ON "transactions"("withdrawal_id");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_account_id_type_idx" ON "transactions"("account_id", "type");

-- CreateIndex
CREATE INDEX "transactions_account_id_created_at_idx" ON "transactions"("account_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_type_order_id_key" ON "transactions"("type", "order_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_type_withdrawal_id_key" ON "transactions"("type", "withdrawal_id");

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

-- CreateIndex
CREATE UNIQUE INDEX "tenants_code_key" ON "tenants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_tenant_id_idx" ON "roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_parent_id_idx" ON "permissions"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "staffs_username_key" ON "staffs"("username");

-- CreateIndex
CREATE INDEX "staffs_tenant_id_idx" ON "staffs"("tenant_id");

-- CreateIndex
CREATE INDEX "staffs_role_id_idx" ON "staffs"("role_id");

-- CreateIndex
CREATE INDEX "tenant_addresses_tenant_id_idx" ON "tenant_addresses"("tenant_id");

-- CreateIndex
CREATE INDEX "recycle_pricing_rules_tenant_id_idx" ON "recycle_pricing_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "recycle_pricing_rules_category_id_idx" ON "recycle_pricing_rules"("category_id");

-- CreateIndex
CREATE INDEX "tenant_transactions_tenant_id_idx" ON "tenant_transactions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_transactions_tenant_id_type_related_id_key" ON "tenant_transactions"("tenant_id", "type", "related_id");

-- CreateIndex
CREATE UNIQUE INDEX "settlement_records_order_id_key" ON "settlement_records"("order_id");

-- CreateIndex
CREATE INDEX "settlement_records_tenant_id_idx" ON "settlement_records"("tenant_id");

-- CreateIndex
CREATE INDEX "settlement_records_status_idx" ON "settlement_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_receipts_order_id_key" ON "inbound_receipts"("order_id");

-- CreateIndex
CREATE INDEX "inbound_receipts_warehouse_id_idx" ON "inbound_receipts"("warehouse_id");

-- CreateIndex
CREATE INDEX "inbound_receipts_status_idx" ON "inbound_receipts"("status");

-- CreateIndex
CREATE INDEX "storages_user_id_idx" ON "storages"("user_id");

-- CreateIndex
CREATE INDEX "storages_file_type_idx" ON "storages"("file_type");

-- CreateIndex
CREATE INDEX "storages_hash_md5_idx" ON "storages"("hash_md5");

-- CreateIndex
CREATE INDEX "order_photos_order_id_idx" ON "order_photos"("order_id");

-- CreateIndex
CREATE INDEX "order_photos_storage_id_idx" ON "order_photos"("storage_id");

-- CreateIndex
CREATE INDEX "order_photos_uploaded_at_idx" ON "order_photos"("uploaded_at");

-- CreateIndex
CREATE UNIQUE INDEX "order_photos_order_id_file_path_key" ON "order_photos"("order_id", "file_path");

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");

-- CreateIndex
CREATE INDEX "chat_sessions_agent_id_idx" ON "chat_sessions"("agent_id");

-- CreateIndex
CREATE INDEX "chat_sessions_status_idx" ON "chat_sessions"("status");

-- CreateIndex
CREATE INDEX "chat_sessions_created_at_idx" ON "chat_sessions"("created_at");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages"("session_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at");

-- CreateIndex
CREATE INDEX "chat_messages_sender_type_idx" ON "chat_messages"("sender_type");

-- CreateIndex
CREATE INDEX "chat_messages_session_id_created_at_idx" ON "chat_messages"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "knowledge_base_category_idx" ON "knowledge_base"("category");

-- CreateIndex
CREATE INDEX "knowledge_base_is_active_idx" ON "knowledge_base"("is_active");

-- CreateIndex
CREATE INDEX "knowledge_base_intent_idx" ON "knowledge_base"("intent");

-- CreateIndex
CREATE UNIQUE INDEX "service_tickets_ticket_no_key" ON "service_tickets"("ticket_no");

-- CreateIndex
CREATE INDEX "service_tickets_user_id_idx" ON "service_tickets"("user_id");

-- CreateIndex
CREATE INDEX "service_tickets_order_id_idx" ON "service_tickets"("order_id");

-- CreateIndex
CREATE INDEX "service_tickets_status_idx" ON "service_tickets"("status");

-- CreateIndex
CREATE INDEX "service_tickets_type_idx" ON "service_tickets"("type");

-- CreateIndex
CREATE INDEX "service_tickets_assigned_to_idx" ON "service_tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "service_tickets_created_at_idx" ON "service_tickets"("created_at");

-- CreateIndex
CREATE INDEX "service_tickets_user_id_status_idx" ON "service_tickets"("user_id", "status");

-- CreateIndex
CREATE INDEX "ticket_histories_ticket_id_idx" ON "ticket_histories"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_histories_created_at_idx" ON "ticket_histories"("created_at");

-- CreateIndex
CREATE INDEX "quick_replies_agent_id_idx" ON "quick_replies"("agent_id");

-- CreateIndex
CREATE INDEX "quick_replies_category_idx" ON "quick_replies"("category");

-- CreateIndex
CREATE UNIQUE INDEX "customer_service_stats_date_key" ON "customer_service_stats"("date");

-- CreateIndex
CREATE INDEX "points_products_status_sort_order_idx" ON "points_products"("status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "points_orders_order_no_key" ON "points_orders"("order_no");

-- CreateIndex
CREATE INDEX "points_orders_user_id_idx" ON "points_orders"("user_id");

-- CreateIndex
CREATE INDEX "points_orders_status_idx" ON "points_orders"("status");

-- CreateIndex
CREATE INDEX "points_orders_created_at_idx" ON "points_orders"("created_at");

-- CreateIndex
CREATE INDEX "points_orders_product_id_idx" ON "points_orders"("product_id");

-- CreateIndex
CREATE INDEX "points_records_user_id_created_at_idx" ON "points_records"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "points_records_type_idx" ON "points_records"("type");

-- CreateIndex
CREATE INDEX "sign_in_records_user_id_idx" ON "sign_in_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sign_in_records_user_id_sign_in_date_key" ON "sign_in_records"("user_id", "sign_in_date");

-- CreateIndex
CREATE INDEX "points_tasks_is_active_sort_order_idx" ON "points_tasks"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "task_records_user_id_idx" ON "task_records"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "task_records_user_id_task_id_key" ON "task_records"("user_id", "task_id");

-- CreateIndex
CREATE INDEX "invite_records_inviter_id_idx" ON "invite_records"("inviter_id");

-- CreateIndex
CREATE UNIQUE INDEX "invite_records_invitee_id_key" ON "invite_records"("invitee_id");

-- CreateIndex
CREATE INDEX "referral_rewards_inviter_id_idx" ON "referral_rewards"("inviter_id");

-- CreateIndex
CREATE INDEX "referral_rewards_invitee_id_idx" ON "referral_rewards"("invitee_id");

-- CreateIndex
CREATE INDEX "referral_rewards_invite_record_id_idx" ON "referral_rewards"("invite_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_rewards_order_id_key" ON "referral_rewards"("order_id");

-- CreateIndex
CREATE INDEX "faqs_category_idx" ON "faqs"("category");

-- CreateIndex
CREATE INDEX "faqs_is_active_sort_order_idx" ON "faqs"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "recycle_rules_category_idx" ON "recycle_rules"("category");

-- CreateIndex
CREATE INDEX "recycle_rules_is_active_sort_order_idx" ON "recycle_rules"("is_active", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "category_warehouse_configs_category_id_key" ON "category_warehouse_configs"("category_id");

-- CreateIndex
CREATE INDEX "category_warehouse_configs_warehouse_id_idx" ON "category_warehouse_configs"("warehouse_id");

-- CreateIndex
CREATE INDEX "category_warehouse_configs_is_active_idx" ON "category_warehouse_configs"("is_active");

-- CreateIndex
CREATE INDEX "_PointsProductToPointsProductCategory_B_index" ON "_PointsProductToPointsProductCategory"("B");

-- AddForeignKey
ALTER TABLE "app_versions" ADD CONSTRAINT "app_versions_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_target_warehouse_id_fkey" FOREIGN KEY ("target_warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_orders" ADD CONSTRAINT "logistics_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_api_calls" ADD CONSTRAINT "logistics_api_calls_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_api_calls" ADD CONSTRAINT "logistics_api_calls_logistics_order_id_fkey" FOREIGN KEY ("logistics_order_id") REFERENCES "logistics_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_callback_logs" ADD CONSTRAINT "logistics_callback_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logistics_callback_logs" ADD CONSTRAINT "logistics_callback_logs_logistics_order_id_fkey" FOREIGN KEY ("logistics_order_id") REFERENCES "logistics_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_assignments" ADD CONSTRAINT "order_assignments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_assignments" ADD CONSTRAINT "order_assignments_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "couriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payments"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_checks" ADD CONSTRAINT "quality_checks_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedbacks" ADD CONSTRAINT "user_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_feedbacks" ADD CONSTRAINT "user_feedbacks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_timelines" ADD CONSTRAINT "order_timelines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_feedbacks" ADD CONSTRAINT "courier_feedbacks_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "couriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_feedbacks" ADD CONSTRAINT "courier_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_feedbacks" ADD CONSTRAINT "courier_feedbacks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_feedbacks" ADD CONSTRAINT "order_feedbacks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_feedbacks" ADD CONSTRAINT "order_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_feedbacks" ADD CONSTRAINT "order_feedbacks_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "couriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_withdrawal_id_fkey" FOREIGN KEY ("withdrawal_id") REFERENCES "withdrawals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "permissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffs" ADD CONSTRAINT "staffs_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_addresses" ADD CONSTRAINT "tenant_addresses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recycle_pricing_rules" ADD CONSTRAINT "recycle_pricing_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recycle_pricing_rules" ADD CONSTRAINT "recycle_pricing_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_transactions" ADD CONSTRAINT "tenant_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_records" ADD CONSTRAINT "settlement_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_records" ADD CONSTRAINT "settlement_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_receipts" ADD CONSTRAINT "inbound_receipts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_receipts" ADD CONSTRAINT "inbound_receipts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_receipts" ADD CONSTRAINT "inbound_receipts_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_photos" ADD CONSTRAINT "order_photos_storage_id_fkey" FOREIGN KEY ("storage_id") REFERENCES "storages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_tickets" ADD CONSTRAINT "service_tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_histories" ADD CONSTRAINT "ticket_histories_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "service_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_histories" ADD CONSTRAINT "ticket_histories_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_replies" ADD CONSTRAINT "quick_replies_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_orders" ADD CONSTRAINT "points_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_orders" ADD CONSTRAINT "points_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "points_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_orders" ADD CONSTRAINT "points_orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_records" ADD CONSTRAINT "points_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sign_in_records" ADD CONSTRAINT "sign_in_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_records" ADD CONSTRAINT "task_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_records" ADD CONSTRAINT "task_records_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "points_tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_records" ADD CONSTRAINT "invite_records_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_records" ADD CONSTRAINT "invite_records_invitee_id_fkey" FOREIGN KEY ("invitee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_invite_record_id_fkey" FOREIGN KEY ("invite_record_id") REFERENCES "invite_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_rewards" ADD CONSTRAINT "referral_rewards_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_warehouse_configs" ADD CONSTRAINT "category_warehouse_configs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_warehouse_configs" ADD CONSTRAINT "category_warehouse_configs_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PointsProductToPointsProductCategory" ADD CONSTRAINT "_PointsProductToPointsProductCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "points_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PointsProductToPointsProductCategory" ADD CONSTRAINT "_PointsProductToPointsProductCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "points_product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

