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
    mkdir -p "$DEPLOY_DIR"/{ssl,certbot-webroot,data/{postgres,redis}}
}

start() {
    cd "$DEPLOY_DIR"
    export DOMAIN EMAIL DB_PASSWORD REDIS_PASSWORD
    docker compose up -d --build
    log "Services started"
}

stop() {
    cd "$DEPLOY_DIR"
    docker compose down
    log "Services stopped"
}

update() {
    cd "$DEPLOY_DIR"
    docker compose pull
    docker compose up -d --build
    log "Services updated"
}

logs() {
    cd "$DEPLOY_DIR"
    docker compose logs -f "$@"
}

migrate() {
    cd "$DEPLOY_DIR"
    docker compose exec backend npx prisma migrate deploy
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
