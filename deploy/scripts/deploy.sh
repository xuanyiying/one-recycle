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
        cat > "$CONFIG" << 'EOF'
DOMAIN=backbuy.cn
EMAIL=admin@backbuy.cn
# 域名分配:
#   - backbuy.cn: 官网/小程序端（隐私政策/用户协议/引导页）
#   - admin.backbuy.cn: 管理端
#   - api.backbuy.cn: API 服务

DB_PASSWORD=change_me
REDIS_PASSWORD=change_me

DEPLOY_DATA_DIR=./data
EOF
        error "Please edit $CONFIG and run again"
    fi

    source "$CONFIG"

    if [[ -z "$DB_PASSWORD" || -z "$REDIS_PASSWORD" ]]; then
        error "DB_PASSWORD and REDIS_PASSWORD must be set in $CONFIG"
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
    cd "$DEPLOY_DIR"
    export DOMAIN EMAIL DB_PASSWORD REDIS_PASSWORD
    docker compose -f docker-compose.yml up -d --build
    log "Services started"
}

stop() {
    cd "$DEPLOY_DIR"
    docker compose down
    log "Services stopped"
}

update() {
    cd "$ROOT"
    log "Pulling latest code..."
    git pull

    cd "$DEPLOY_DIR"
    export DOMAIN EMAIL DB_PASSWORD REDIS_PASSWORD
    log "Building images..."
    docker compose build --parallel api-gateway admin-web
    log "Restarting services..."
    docker compose up -d
    log "Cleaning up old images..."
    docker image prune -f
    log "Services updated"
}

logs() {
    cd "$DEPLOY_DIR"
    docker compose logs -f "$@"
}

migrate() {
    cd "$DEPLOY_DIR"
    docker compose exec api-gateway npx prisma db push
}

status() {
    cd "$DEPLOY_DIR"
    docker compose ps
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
