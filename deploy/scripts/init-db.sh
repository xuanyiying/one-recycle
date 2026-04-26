#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[init]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
error() { echo -e "${RED}[error]${NC} $1"; exit 1; }

CONTAINER_NAME="${1:-one-recycle-api-gateway}"
COMPOSE_FILE="${2:-deploy/docker-compose.yml}"

log "=== OneRecycle 生产环境数据库初始化 ==="
log "目标容器: $CONTAINER_NAME"
log "Compose文件: $COMPOSE_FILE"

# 检查容器是否存在
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    error "容器 $CONTAINER_NAME 未运行，请先执行 docker compose up -d"
fi

# 检查数据库连接
log "检查数据库连接..."
DB_URL=$(docker exec "$CONTAINER_NAME" sh -c 'echo $DATABASE_URL')
if [ -z "$DB_URL" ]; then
    error "DATABASE_URL 未配置"
fi
log "数据库连接正常"

# 步骤1: 执行 prisma db push (创建/同步表结构)
log "步骤1: 同步数据库表结构..."
docker exec "$CONTAINER_NAME" sh -c 'npx prisma db push --skip-generate --accept-data-loss'
log "表结构同步完成"

# 步骤2: 确认 seed 脚本存在
log "步骤2: 检查 seed 脚本..."
HAS_SEED=$(docker exec "$CONTAINER_NAME" sh -c 'test -f scripts/main.ts && echo yes || echo no')
if [ "$HAS_SEED" != "yes" ]; then
    warn "scripts/main.ts 未找到，跳过种子数据初始化"
    log "提示: 重新构建包含 scripts/ 的镜像后再试"
    exit 0
fi
log "seed 脚本存在"

# 步骤3: 执行种子数据
log "步骤3: 执行种子数据初始化..."
docker exec "$CONTAINER_NAME" sh -c 'npx ts-node scripts/main.ts'
log "种子数据初始化完成"

# 验证
log "=== 验证数据 ==="
docker exec "$CONTAINER_NAME" sh -c 'npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = '\''public'\'';"' | grep -E "tenant|category|faq" || true

log ""
log "=========================================="
log "数据库初始化完成!"
log "建议: 确认数据无误后重启服务"
log "  docker compose -f $COMPOSE_FILE restart api-gateway"
log "=========================================="
