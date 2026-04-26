#!/bin/bash
# 直接在 postgres 容器上执行，无需 api-gateway 容器
# 用法: ./init-db-direct.sh [postgres_container_name]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[init-db]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
error() { echo -e "${RED}[error]${NC} $1"; exit 1; }

POSTGRES_CONTAINER="${1:-one-recycle-postgres}"

log "=== OneRecycle 数据库初始化 (直接模式) ==="
log "Postgres容器: $POSTGRES_CONTAINER"

# 检查 postgres 容器
if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    error "Postgres容器未运行: $POSTGRES_CONTAINER"
fi

# 获取数据库连接信息
DB_USER=$(docker exec "$POSTGRES_CONTAINER" printenv POSTGRES_USER 2>/dev/null || echo "one_recycle")
DB_NAME=$(docker exec "$POSTGRES_CONTAINER" printenv POSTGRES_DB 2>/dev/null || echo "one_recycle")
DB_PASS=$(docker exec "$POSTGRES_CONTAINER" printenv POSTGRES_PASSWORD 2>/dev/null)

log "数据库: $DB_NAME (用户: $DB_USER)"

# 检查 seed.sql 是否存在
SEED_SQL="./seed.sql"
if [ ! -f "$SEED_SQL" ]; then
    error "seed.sql 文件不存在，请确保在 deploy/scripts/ 目录下执行"
fi

# 复制 seed.sql 到临时位置
docker cp "$SEED_SQL" "$POSTGRES_CONTAINER:/tmp/seed.sql"

# 执行 SQL
log "执行种子数据 SQL..."
docker exec "$POSTGRES_CONTAINER" sh -c "
    PGPASSWORD='$DB_PASS' psql -U '$DB_USER' -d '$DB_NAME' -f /tmp/seed.sql
" || error "SQL 执行失败"

# 清理
docker exec "$POSTGRES_CONTAINER" sh -c "rm -f /tmp/seed.sql"

# 验证
log ""
log "=== 验证数据 ==="
docker exec "$POSTGRES_CONTAINER" sh -c "
    PGPASSWORD='$DB_PASS' psql -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'Tenant: ' || COUNT(*) FROM \\\"Tenant\\\";\"
    PGPASSWORD='$DB_PASS' psql -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'Category: ' || COUNT(*) FROM \\\"Category\\\";\"
    PGPASSWORD='$DB_PASS' psql -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'Staff: ' || COUNT(*) FROM \\\"Staff\\\";\"
    PGPASSWORD='$DB_PASS' psql -U '$DB_USER' -d '$DB_NAME' -c \"SELECT 'FAQ: ' || COUNT(*) FROM \\\"FAQ\\\";\"
" 2>/dev/null || true

log ""
log "=========================================="
log "种子数据初始化完成!"
log "=========================================="
log ""
log "管理员登录信息:"
log "  用户名: admin"
log "  密码: 123456"
log ""
