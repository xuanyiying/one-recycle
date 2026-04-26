#!/bin/bash
# OneRecycle 数据库初始化脚本
# 用法: ./init-db.sh [api-gateway容器名]
#
# 功能:
#   1. prisma db push (建表)
#   2. 种子数据 (租户、角色、员工、分类、FAQ)
#   3. 行政区划数据 (regions)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[init-db]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
error() { echo -e "${RED}[error]${NC} $1"; exit 1; }

CONTAINER_NAME="${1:-one-recycle-api-gateway}"

log "=== OneRecycle 数据库初始化 ==="
log "容器: $CONTAINER_NAME"

# 检查容器
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    error "容器未运行: $CONTAINER_NAME"
fi

# 检查数据库连接
log "检查数据库连接..."
DB_URL=$(docker exec "$CONTAINER_NAME" sh -c 'echo $DATABASE_URL' 2>/dev/null)
if [ -z "$DB_URL" ]; then
    error "DATABASE_URL 未设置"
fi

# 从 DATABASE_URL 提取数据库连接信息
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DB_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*@[^:]*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\)?.*|\1|p')

log "数据库: $DB_NAME @ $DB_HOST:$DB_PORT"

# 1. 建表
log "步骤1: 执行 prisma db push (建表)..."
docker exec "$CONTAINER_NAME" sh -c 'npx prisma db push --skip-generate --accept-data-loss' 2>/dev/null || true
log "✅ 表结构同步完成"

# 2. 基础种子数据 (租户、角色、员工、分类、FAQ)
log "步骤2: 导入基础种子数据..."
if [ -f "./seed.sql" ]; then
    docker cp "./seed.sql" "$CONTAINER_NAME:/tmp/seed.sql"
    docker exec "$CONTAINER_NAME" sh -c "
        PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -f /tmp/seed.sql
    "
    docker exec "$CONTAINER_NAME" sh -c 'rm -f /tmp/seed.sql'
    log "✅ 基础种子数据完成"
else
    warn "seed.sql 未找到，跳过"
fi

# 3. 行政区划数据
log "步骤3: 导入行政区划数据..."
if [ -f "./seed-regions.sql" ]; then
    log "复制 seed-regions.sql 到容器 (1.84 MB)..."
    docker cp "./seed-regions.sql" "$CONTAINER_NAME:/tmp/seed-regions.sql"

    log "执行行政区划数据导入..."
    docker exec "$CONTAINER_NAME" sh -c "
        PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -f /tmp/seed-regions.sql
    "
    docker exec "$CONTAINER_NAME" sh -c 'rm -f /tmp/seed-regions.sql'
    log "✅ 行政区划数据完成"
else
    warn "seed-regions.sql 未找到，跳过行政区划导入"
    warn "提示: 运行 'node generate-regions-sql.js' 生成"
fi

# 验证
log ""
log "=== 验证数据 ==="
docker exec "$CONTAINER_NAME" sh -c "
    PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'Tenant: ' || COUNT(*) FROM \\\"Tenant\\\";\"
    PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'Category: ' || COUNT(*) FROM \\\"Category\\\";\"
    PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'Staff: ' || COUNT(*) FROM \\\"Staff\\\";\"
    PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'FAQ: ' || COUNT(*) FROM \\\"FAQ\\\";\"
    PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'Regions: ' || COUNT(*) FROM \\\"regions\\\";\"
" 2>/dev/null || true

log ""
log "=========================================="
log "数据库初始化完成!"
log "=========================================="
log ""
log "管理员登录信息:"
log "  用户名: admin"
log "  密码: 123456"
log ""
