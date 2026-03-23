#!/bin/bash
# ============================================================================
# OneRecycle 一键部署脚本
# 域名: backbuy.cn
# 用途: 快速部署后端服务和前端应用到生产环境
# ============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="backbuy.cn"
API_SUBDOMAIN="api.${DOMAIN}"
ADMIN_SUBDOMAIN="admin.${DOMAIN}"
DEPLOY_DIR="/opt/one-recycle"
BACKUP_DIR="/opt/backups/one-recycle"
LOG_FILE="/var/log/one-recycle-deploy.log"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# 日志函数
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 未安装，请先安装"
        exit 1
    fi
}

# 环境检查
check_environment() {
    log "检查部署环境..."
    
    check_command docker
    check_command docker-compose
    check_command nginx
    check_command node
    check_command npm
    
    # 检查 Docker 是否运行
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 创建必要的目录
setup_directories() {
    log "创建部署目录..."
    
    sudo mkdir -p "$DEPLOY_DIR"/{backend,frontend,nginx,ssl}
    sudo mkdir -p "$BACKUP_DIR"
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    
    # 设置权限
    sudo chown -R "$(whoami):$(whoami)" "$DEPLOY_DIR"
    sudo chown -R "$(whoami):$(whoami)" "$BACKUP_DIR"
    
    log_success "目录创建完成"
}

# 备份当前部署
backup_current() {
    if [ -d "$DEPLOY_DIR/backend" ] && [ "$(ls -A "$DEPLOY_DIR/backend")" ]; then
        log "备份当前部署..."
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        sudo mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
        sudo cp -r "$DEPLOY_DIR"/* "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true
        log_success "备份完成: $BACKUP_NAME"
    fi
}

# 部署后端服务
deploy_backend() {
    log "开始部署后端服务..."
    
    cd "$PROJECT_ROOT/server"
    
    # 安装依赖
    log "安装后端依赖..."
    npm install
    
    # 生成 Prisma Client
    log "生成 Prisma Client..."
    npm run prisma:generate
    
    # 构建应用
    log "构建后端应用..."
    npm run build
    
    # 复制到部署目录
    log "复制后端文件到部署目录..."
    rsync -av --delete \
        --exclude='node_modules' \
        --exclude='.env' \
        --exclude='dist' \
        --exclude='coverage' \
        --exclude='.git' \
        "$PROJECT_ROOT/server/" "$DEPLOY_DIR/backend/"
    
    # 复制构建产物
    cp -r "$PROJECT_ROOT/server/dist" "$DEPLOY_DIR/backend/"
    cp -r "$PROJECT_ROOT/server/node_modules" "$DEPLOY_DIR/backend/"
    
    log_success "后端部署完成"
}

# 部署前端管理后台
deploy_frontend() {
    log "开始部署前端管理后台..."
    
    cd "$PROJECT_ROOT/apps/admin-web"
    
    # 安装依赖
    log "安装前端依赖..."
    npm install
    
    # 构建应用
    log "构建前端应用..."
    npm run build
    
    # 复制到部署目录
    log "复制前端文件到部署目录..."
    sudo rm -rf "$DEPLOY_DIR/frontend/admin"
    sudo mkdir -p "$DEPLOY_DIR/frontend/admin"
    sudo cp -r "$PROJECT_ROOT/apps/admin-web/dist"/* "$DEPLOY_DIR/frontend/admin/"
    
    log_success "前端部署完成"
}

# 配置 Nginx
setup_nginx() {
    log "配置 Nginx..."
    
    # 创建 Nginx 配置文件
    sudo tee /etc/nginx/sites-available/one-recycle << 'EOF'
# API 后端服务
server {
    listen 80;
    server_name api.backbuy.cn;
    
    # 反向代理到后端服务
    location / {
        proxy_pass http://localhost:3008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查端点
    location /health {
        proxy_pass http://localhost:3008/health;
        access_log off;
    }
}

# 管理后台前端
server {
    listen 80;
    server_name admin.backbuy.cn;
    
    root /opt/one-recycle/frontend/admin;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3008/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 主域名重定向到管理后台
server {
    listen 80;
    server_name backbuy.cn www.backbuy.cn;
    return 301 http://admin.backbuy.cn$request_uri;
}
EOF

    # 启用站点配置
    sudo ln -sf /etc/nginx/sites-available/one-recycle /etc/nginx/sites-enabled/one-recycle
    
    # 删除默认配置
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试 Nginx 配置
    sudo nginx -t
    
    # 重载 Nginx
    sudo systemctl reload nginx
    
    log_success "Nginx 配置完成"
}

# 配置 SSL 证书 (使用 Certbot)
setup_ssl() {
    log "配置 SSL 证书..."
    
    # 检查 Certbot 是否安装
    if ! command -v certbot &> /dev/null; then
        log_warn "Certbot 未安装，跳过 SSL 配置"
        log_warn "如需 SSL，请运行: sudo apt install certbot python3-certbot-nginx"
        return 0
    fi
    
    # 申请证书
    sudo certbot --nginx -d "api.$DOMAIN" -d "admin.$DOMAIN" -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN 2>/dev/null || {
        log_warn "SSL 证书申请失败，请检查域名解析是否正确"
        return 0
    }
    
    log_success "SSL 证书配置完成"
}

# 创建系统服务
create_systemd_service() {
    log "创建系统服务..."
    
    sudo tee /etc/systemd/system/one-recycle.service << EOF
[Unit]
Description=OneRecycle Backend Service
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$DEPLOY_DIR/backend
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3008

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable one-recycle.service
    
    log_success "系统服务创建完成"
}

# 启动服务
start_services() {
    log "启动服务..."
    
    # 启动后端服务
    cd "$DEPLOY_DIR/backend"
    
    # 使用 PM2 启动（如果安装了 PM2）
    if command -v pm2 &> /dev/null; then
        log "使用 PM2 启动后端服务..."
        pm2 delete one-recycle-backend 2>/dev/null || true
        pm2 start dist/main.js --name one-recycle-backend --env production
        pm2 save
    else
        log "使用 Node 直接启动后端服务..."
        # 停止旧服务
        sudo systemctl stop one-recycle 2>/dev/null || true
        # 启动新服务
        sudo systemctl start one-recycle
    fi
    
    log_success "服务启动完成"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    sleep 5
    
    # 检查后端服务
    if curl -f http://localhost:3008/health &> /dev/null; then
        log_success "后端服务健康检查通过"
    else
        log_error "后端服务健康检查失败"
        return 1
    fi
    
    # 检查 Nginx
    if curl -f http://localhost &> /dev/null; then
        log_success "Nginx 服务正常"
    else
        log_warn "Nginx 服务可能未完全启动"
    fi
    
    log_success "健康检查完成"
}

# 清理旧备份
cleanup_old_backups() {
    log "清理旧备份..."
    
    # 保留最近 10 个备份
    cd "$BACKUP_DIR"
    ls -t | tail -n +11 | xargs -r rm -rf
    
    log_success "旧备份清理完成"
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    OneRecycle 部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  管理后台: ${YELLOW}http://admin.$DOMAIN${NC}"
    echo -e "  API 接口: ${YELLOW}http://api.$DOMAIN${NC}"
    echo ""
    echo -e "${BLUE}部署目录:${NC}"
    echo -e "  后端: $DEPLOY_DIR/backend"
    echo -e "  前端: $DEPLOY_DIR/frontend/admin"
    echo ""
    echo -e "${BLUE}常用命令:${NC}"
    echo -e "  查看日志: ${YELLOW}tail -f $LOG_FILE${NC}"
    echo -e "  重启服务: ${YELLOW}sudo systemctl restart one-recycle${NC}"
    echo -e "  查看状态: ${YELLOW}sudo systemctl status one-recycle${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  OneRecycle 一键部署脚本${NC}"
    echo -e "${GREEN}  域名: $DOMAIN${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # 检查是否为 root 用户
    if [ "$EUID" -eq 0 ]; then
        log_warn "不建议使用 root 用户运行此脚本"
        log_warn "建议使用具有 sudo 权限的普通用户"
    fi
    
    # 执行部署步骤
    check_environment
    setup_directories
    backup_current
    deploy_backend
    deploy_frontend
    setup_nginx
    setup_ssl
    create_systemd_service
    start_services
    health_check
    cleanup_old_backups
    
    # 显示部署信息
    show_deployment_info
    
    log_success "部署完成！"
}

# 处理命令行参数
case "${1:-}" in
    --backend|-b)
        deploy_backend
        start_services
        ;;
    --frontend|-f)
        deploy_frontend
        setup_nginx
        ;;
    --ssl|-s)
        setup_ssl
        ;;
    --help|-h)
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --backend, -b     仅部署后端"
        echo "  --frontend, -f    仅部署前端"
        echo "  --ssl, -s         仅配置 SSL"
        echo "  --help, -h        显示帮助信息"
        echo ""
        echo "无参数时执行完整部署"
        ;;
    *)
        main
        ;;
esac
