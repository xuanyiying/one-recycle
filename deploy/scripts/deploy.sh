#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DEPLOY_DIR="$ROOT/deploy"
CONFIG="$DEPLOY_DIR/deploy.conf"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
error() { echo -e "${RED}[error]${NC} $1"; exit 1; }

load_config() {
    if [[ ! -f "$CONFIG" ]]; then
        warn "Config not found, creating..."
        local db_pass=$(openssl rand -hex 16)
        local redis_pass=$(openssl rand -hex 16)
        cat > "$CONFIG" << EOF
DOMAIN=backbuy.cn
EMAIL=admin@backbuy.cn
# 域名分配:
#   - backbuy.cn: 官网/小程序端（隐私政策/用户协议/引导页）
#   - admin.backbuy.cn: 管理端
#   - api.backbuy.cn: API 服务

DB_PASSWORD=$db_pass
REDIS_PASSWORD=$redis_pass

DEPLOY_DATA_DIR=./data
EOF
        warn "Config created with random passwords. Please review $CONFIG and adjust DOMAIN/EMAIL if needed, then run again"
    fi

    source "$CONFIG"

    if [[ -z "$DB_PASSWORD" || -z "$REDIS_PASSWORD" ]]; then
        error "DB_PASSWORD and REDIS_PASSWORD must be set in $CONFIG"
    fi

    if [ "$DB_PASSWORD" = "change_me" ]; then
        error "DB_PASSWORD must be changed from default value"
    fi
    if [ "$REDIS_PASSWORD" = "change_me" ]; then
        error "REDIS_PASSWORD must be changed from default value"
    fi
}

check_deps() {
    command -v docker >/dev/null || error "Docker not installed"
    docker info >/dev/null 2>&1 || error "Docker not running"
}

setup_dirs() {
    mkdir -p "$DEPLOY_DIR"/{caddy,www/html,data/{postgres,redis}}
}

start() {
    if [ -z "$JWT_SECRET" ]; then
        echo "ERROR: JWT_SECRET must be set"
        exit 1
    fi
    cd "$DEPLOY_DIR"
    {
        echo "DOMAIN=$DOMAIN"
        echo "DB_PASSWORD=$DB_PASSWORD"
        echo "REDIS_PASSWORD=$REDIS_PASSWORD"
        echo "JWT_SECRET=$JWT_SECRET"
        echo "CORS_ORIGINS=${CORS_ORIGINS:-https://backbuy.cn,https://www.backbuy.cn,https://admin.backbuy.cn,https://api.backbuy.cn}"
        echo "WECHAT_APP_ID=${WECHAT_APP_ID:-}"
        echo "WECHAT_APP_SECRET=${WECHAT_APP_SECRET:-}"
    } > .env.production
    docker compose -f docker-compose.yml up -d --build
    log "Services started"
}

stop() {
    cd "$DEPLOY_DIR"
    docker compose -f docker-compose.yml down
    log "Services stopped"
}

update() {
    if [ -z "$JWT_SECRET" ]; then
        echo "ERROR: JWT_SECRET must be set"
        exit 1
    fi
    cd "$ROOT"
    log "Pulling latest code..."
    git pull

    cd "$DEPLOY_DIR"
    {
        echo "DOMAIN=$DOMAIN"
        echo "DB_PASSWORD=$DB_PASSWORD"
        echo "REDIS_PASSWORD=$REDIS_PASSWORD"
        echo "JWT_SECRET=$JWT_SECRET"
        echo "CORS_ORIGINS=${CORS_ORIGINS:-https://backbuy.cn,https://www.backbuy.cn,https://admin.backbuy.cn,https://api.backbuy.cn}"
        echo "WECHAT_APP_ID=${WECHAT_APP_ID:-}"
        echo "WECHAT_APP_SECRET=${WECHAT_APP_SECRET:-}"
    } > .env.production
    log "Building images..."
    docker compose -f docker-compose.yml build --parallel api-gateway admin-web
    log "Restarting services..."
    docker compose -f docker-compose.yml up -d
    log "Cleaning up old images..."
    docker image prune -f
    log "Services updated"
}

logs() {
    cd "$DEPLOY_DIR"
    docker compose -f docker-compose.yml logs -f "$@"
}

migrate() {
    cd "$DEPLOY_DIR"
    docker compose -f docker-compose.yml exec api-gateway npx prisma db push
}

status() {
    cd "$DEPLOY_DIR"
    docker compose -f docker-compose.yml ps
}

cmd=${1:-deploy}
case $cmd in
    deploy)
        load_config
        check_deps
        setup_dirs
        start
        log "Deployed: https://admin.$DOMAIN"
        ;;
    start)
        load_config
        start
        ;;
    stop)
        load_config
        stop
        ;;
    restart)
        load_config
        stop
        start
        ;;
    update)
        load_config
        check_deps
        update
        ;;
    logs)
        shift
        logs "$@"
        ;;
    migrate)
        migrate
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {deploy|start|stop|restart|update|logs|migrate|status}"
        exit 1
        ;;
esac
