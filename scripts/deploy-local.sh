#!/bin/bash
# OneRecycle 本地构建部署脚本
# 支持 server 和 admin-web 的构建、推送和部署
#
# 用法:
#   ./deploy-local.sh build       # 仅构建
#   ./deploy-local.sh push        # 构建 + 推送
#   ./deploy-local.sh deploy     # 构建 + 推送 + 部署到服务器
#   ./deploy-local.sh all        # 完整流程 (build + push + deploy)
#
# 选项:
#   --server-only    仅构建/部署 server
#   --web-only       仅构建/部署 admin-web
#   --microservices  使用微服务模式部署 (docker-compose.production.yml)
#   --monolith       使用单体模式部署 (docker-compose.yml)
#   -h, --help       显示帮助

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[deploy]${NC} $1"; }
info() { echo -e "${BLUE}[info]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
error() { echo -e "${RED}[error]${NC} $1"; exit 1; }

# 默认配置
REGISTRY="ghcr.io"
IMAGE_PREFIX="xuanyiying/one-recycle"
DEPLOY_MODE="monolith"
TARGET_SERVER=""
TARGET_USER=""
BUILD_SERVER=true
BUILD_WEB=true

# 解析参数
ACTION="${1:-all}"
shift || true

while [[ $# -gt 0 ]]; do
    case $1 in
        --server-only)
            BUILD_WEB=false
            shift
            ;;
        --web-only)
            BUILD_SERVER=false
            shift
            ;;
        --microservices)
            DEPLOY_MODE="microservices"
            shift
            ;;
        --monolith)
            DEPLOY_MODE="monolith"
            shift
            ;;
        -h|--help)
            echo "OneRecycle 本地部署脚本"
            echo ""
            echo "用法: $0 <action> [options]"
            echo ""
            echo "Action:"
            echo "  build    仅构建镜像"
            echo "  push     构建 + 推送镜像"
            echo "  deploy   构建 + 推送 + 部署到服务器"
            echo "  all      完整流程 (同 deploy)"
            echo ""
            echo "Options:"
            echo "  --server-only      仅处理 server"
            echo "  --web-only         仅处理 admin-web"
            echo "  --microservices    使用微服务模式"
            echo "  --monolith         使用单体模式"
            echo "  -h, --help         显示帮助"
            exit 0
            ;;
        *)
            error "未知参数: $1"
            ;;
    esac
done

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

log "=== OneRecycle 部署脚本 ==="
info "项目目录: $PROJECT_ROOT"
info "Registry: $REGISTRY"
info "部署模式: $DEPLOY_MODE"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    error "Docker 未安装或未运行"
fi

# 检查 docker buildx
if ! docker buildx version &> /dev/null; then
    warn "docker buildx 不可用，使用默认构建器"
fi

# 读取服务器配置 (可选)
if [ -f "$SCRIPT_DIR/deploy.conf" ]; then
    source "$SCRIPT_DIR/deploy.conf"
fi

# 构建 Server 镜像
build_server() {
    log "=== 构建 Server 镜像 ==="

    if [ ! -d "server" ]; then
        error "server 目录不存在"
    fi

    local tag="$REGISTRY/$IMAGE_PREFIX/server:latest"

    docker build -t "$tag" ./server || error "Server 构建失败"

    log "✅ Server 镜像构建完成: $tag"
}

# 构建 Admin Web 镜像
build_web() {
    log "=== 构建 Admin Web 镜像 ==="

    if [ ! -d "apps/admin-web" ]; then
        error "apps/admin-web 目录不存在"
    fi

    local tag="$REGISTRY/$IMAGE_PREFIX/admin-web:latest"

    docker build -t "$tag" ./apps/admin-web || error "Admin Web 构建失败"

    log "✅ Admin Web 镜像构建完成: $tag"
}

# 推送镜像
push_images() {
    log "=== 推送镜像 ==="

    # 登录 registry
    if [ -n "$GHCR_TOKEN" ]; then
        echo "$GHCR_TOKEN" | docker login "$REGISTRY" -u "$GHCR_USER" --password-stdin || warn "登录失败，请手动登录"
    else
        warn "未设置 GHCR_TOKEN，尝试匿名推送..."
    fi

    if [ "$BUILD_SERVER" = true ]; then
        local server_tag="$REGISTRY/$IMAGE_PREFIX/server:latest"
        docker push "$server_tag" || warn "推送 server 失败"
        log "✅ Server 镜像已推送"
    fi

    if [ "$BUILD_WEB" = true ]; then
        local web_tag="$REGISTRY/$IMAGE_PREFIX/admin-web:latest"
        docker push "$web_tag" || warn "推送 admin-web 失败"
        log "✅ Admin Web 镜像已推送"
    fi
}

# 部署到服务器
deploy_to_server() {
    log "=== 部署到服务器 ==="

    if [ -z "$DEPLOY_HOST" ]; then
        read -p "请输入服务器 IP 或主机名: " DEPLOY_HOST
    fi

    if [ -z "$DEPLOY_USER" ]; then
        read -p "请输入服务器用户名: " DEPLOY_USER
    fi

    if [ -z "$SSH_KEY" ] && [ -z "$HAS_SSH_KEY" ]; then
        if [ -f "$HOME/.ssh/id_rsa" ]; then
            SSH_KEY="$HOME/.ssh/id_rsa"
        elif [ -f "$HOME/.ssh/id_ed25519" ]; then
            SSH_KEY="$HOME/.ssh/id_ed25519"
        fi
    fi

    local remote="$DEPLOY_USER@$DEPLOY_HOST"
    info "部署到: $remote"

    # 确定 compose 文件
    local compose_file="deploy/docker-compose.yml"
    if [ "$DEPLOY_MODE" = "microservices" ]; then
        compose_file="deploy/docker/docker-compose.production.yml"
    fi

    # 执行远程部署
    ssh -o StrictHostKeyChecking=no "$remote" << 'ENDSSH'
        set -e

        PROJECT_DIR="$HOME/one-recycle"
        COMPOSE_FILE=""

        # 确定部署模式
        if [ -f "$PROJECT_DIR/deploy/docker/docker-compose.production.yml" ]; then
            COMPOSE_FILE="$PROJECT_DIR/deploy/docker/docker-compose.production.yml"
        else
            COMPOSE_FILE="$PROJECT_DIR/deploy/docker-compose.yml"
        fi

        echo "=== 连接到服务器 ==="
        echo "项目目录: $PROJECT_DIR"
        echo "Compose文件: $COMPOSE_FILE"

        cd "$PROJECT_DIR"

        # 登录 ghcr.io
        if [ -n "$GITHUB_TOKEN" ]; then
            echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin 2>/dev/null || true
        fi

        echo "=== 拉取最新镜像 ==="
        docker compose -f "$COMPOSE_FILE" pull || echo "部分镜像可能不存在"

        echo "=== 停止旧容器 ==="
        docker compose -f "$COMPOSE_FILE" down || true

        echo "=== 启动服务 ==="
        docker compose -f "$COMPOSE_FILE" up -d

        echo "=== 等待服务启动 ==="
        sleep 10

        echo "=== 服务状态 ==="
        docker compose -f "$COMPOSE_FILE" ps

        echo "=== 最近日志 ==="
        docker compose -f "$COMPOSE_FILE" logs --tail=30

        echo "=== 部署完成 ==="
    ENDSSH

    log "✅ 部署完成"
}

# 主流程
case $ACTION in
    build)
        if [ "$BUILD_SERVER" = true ]; then
            build_server
        fi
        if [ "$BUILD_WEB" = true ]; then
            build_web
        fi
        ;;
    push)
        if [ "$BUILD_SERVER" = true ]; then
            build_server
        fi
        if [ "$BUILD_WEB" = true ]; then
            build_web
        fi
        push_images
        ;;
    deploy|all)
        if [ "$BUILD_SERVER" = true ]; then
            build_server
        fi
        if [ "$BUILD_WEB" = true ]; then
            build_web
        fi
        push_images
        deploy_to_server
        ;;
    *)
        error "未知操作: $ACTION"
        ;;
esac

log "=== 完成 ==="
