#!/bin/bash
# ============================================================================
# OneRecycle Docker 一键部署脚本
# 域名: backbuy.cn
# 用途: 使用 Docker Compose 快速部署完整服务栈
# ============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
DOMAIN="backbuy.cn"
DEPLOY_DIR="/opt/one-recycle"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# 检查环境
check_environment() {
    log "检查 Docker 环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 创建部署目录
setup_directories() {
    log "创建部署目录..."
    
    sudo mkdir -p "$DEPLOY_DIR"/{data/postgres,data/redis,data/minio,ssl,logs}
    sudo chown -R "$(whoami):$(whoami)" "$DEPLOY_DIR"
    
    log_success "目录创建完成"
}

# 创建 Docker Compose 配置
create_docker_compose() {
    log "创建 Docker Compose 配置..."
    
    cat > "$DEPLOY_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: one-recycle-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USERNAME:-one_recycle}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-one_recycle}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - one-recycle-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-one_recycle}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: one-recycle-redis
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - ./data/redis:/data
    ports:
      - "6379:6379"
    networks:
      - one-recycle-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO 对象存储
  minio:
    image: minio/minio:latest
    container_name: one-recycle-minio
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${OSS_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${OSS_SECRET_KEY}
    volumes:
      - ./data/minio:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - one-recycle-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  # 后端 API 服务
  backend:
    build:
      context: ../../server
      dockerfile: Dockerfile
    container_name: one-recycle-backend
    restart: always
    ports:
      - "3008:3008"
    environment:
      - NODE_ENV=production
      - PORT=3008
      - DATABASE_URL=postgresql://${DB_USERNAME:-one_recycle}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-one_recycle}?schema=public
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - one-recycle-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3008/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: one-recycle-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
    networks:
      - one-recycle-network

networks:
  one-recycle-network:
    driver: bridge
EOF

    log_success "Docker Compose 配置创建完成"
}

# 创建 Nginx 配置
create_nginx_config() {
    log "创建 Nginx 配置..."
    
    mkdir -p "$DEPLOY_DIR/nginx/conf.d"
    
    cat > "$DEPLOY_DIR/nginx/conf.d/default.conf" << 'EOF'
# API 后端服务
server {
    listen 80;
    server_name api.backbuy.cn;
    
    location / {
        proxy_pass http://backend:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# 管理后台前端
server {
    listen 80;
    server_name admin.backbuy.cn;
    
    location / {
        proxy_pass http://backend:3008;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend:3008/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 主域名重定向
server {
    listen 80;
    server_name backbuy.cn www.backbuy.cn;
    return 301 http://admin.backbuy.cn$request_uri;
}
EOF

    log_success "Nginx 配置创建完成"
}

# 复制环境文件
copy_env_file() {
    log "复制环境配置文件..."
    
    if [ -f "$PROJECT_ROOT/deploy/config/.env.production" ]; then
        cp "$PROJECT_ROOT/deploy/config/.env.production" "$DEPLOY_DIR/.env.production"
        log_success "环境文件复制完成"
    else
        log_warn "未找到 .env.production 文件，请手动创建"
        log_warn "参考: $PROJECT_ROOT/deploy/config/.env.production.example"
    fi
}

# 启动服务
start_services() {
    log "启动 Docker 服务..."
    
    cd "$DEPLOY_DIR"
    
    # 拉取最新镜像
    docker-compose pull
    
    # 构建并启动
    docker-compose up -d --build
    
    log_success "服务启动完成"
}

# 执行数据库迁移
run_migrations() {
    log "执行数据库迁移..."
    
    cd "$DEPLOY_DIR"
    
    # 等待数据库就绪
    sleep 10
    
    # 执行迁移
    docker-compose exec -T backend npx prisma migrate deploy || {
        log_warn "数据库迁移失败，请手动执行"
        return 0
    }
    
    log_success "数据库迁移完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    sleep 10
    
    # 检查各服务状态
    services=("postgres" "redis" "backend" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "$service.*Up"; then
            log_success "$service 服务运行正常"
        else
            log_error "$service 服务可能未正常运行"
        fi
    done
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    Docker 部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  管理后台: ${YELLOW}http://admin.$DOMAIN${NC}"
    echo -e "  API 接口: ${YELLOW}http://api.$DOMAIN${NC}"
    echo -e "  MinIO 控制台: ${YELLOW}http://$DOMAIN:9001${NC}"
    echo ""
    echo -e "${BLUE}常用命令:${NC}"
    echo -e "  查看日志: ${YELLOW}cd $DEPLOY_DIR && docker-compose logs -f${NC}"
    echo -e "  重启服务: ${YELLOW}cd $DEPLOY_DIR && docker-compose restart${NC}"
    echo -e "  停止服务: ${YELLOW}cd $DEPLOY_DIR && docker-compose down${NC}"
    echo -e "  更新部署: ${YELLOW}cd $DEPLOY_DIR && docker-compose up -d --build${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  OneRecycle Docker 一键部署脚本${NC}"
    echo -e "${GREEN}  域名: $DOMAIN${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    check_environment
    setup_directories
    create_docker_compose
    create_nginx_config
    copy_env_file
    start_services
    run_migrations
    health_check
    show_deployment_info
    
    log_success "Docker 部署完成！"
}

# 处理命令行参数
case "${1:-}" in
    --stop)
        cd "$DEPLOY_DIR" && docker-compose down
        ;;
    --restart)
        cd "$DEPLOY_DIR" && docker-compose restart
        ;;
    --logs)
        cd "$DEPLOY_DIR" && docker-compose logs -f
        ;;
    --update)
        cd "$DEPLOY_DIR" && docker-compose up -d --build
        ;;
    --help|-h)
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --stop        停止服务"
        echo "  --restart     重启服务"
        echo "  --logs        查看日志"
        echo "  --update      更新部署"
        echo "  --help, -h    显示帮助信息"
        echo ""
        echo "无参数时执行完整部署"
        ;;
    *)
        main
        ;;
esac
