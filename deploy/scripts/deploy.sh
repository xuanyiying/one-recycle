#!/bin/bash
# ============================================================================
# OneRecycle 部署脚本
# 使用方法: ./deploy.sh [environment]
# 示例: ./deploy.sh production
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_DIR="$PROJECT_ROOT/deploy"

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.$ENVIRONMENT.yml"

echo "=========================================="
echo "  OneRecycle 部署脚本"
echo "  环境: $ENVIRONMENT"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查 docker-compose 文件
if [ ! -f "$DEPLOY_DIR/docker/$COMPOSE_FILE" ]; then
    echo -e "${RED}错误: 找不到 $COMPOSE_FILE${NC}"
    exit 1
fi

# 检查环境变量文件
ENV_FILE="$DEPLOY_DIR/config/.env.production"
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}警告: 找不到 $ENV_FILE${NC}"
        echo -e "${YELLOW}请先复制 .env.production.example 并配置${NC}"
        echo -e "${YELLOW}cp $ENV_FILE.example $ENV_FILE${NC}"
    fi
fi

cd "$DEPLOY_DIR"

# 拉取最新代码（如果使用 git）
if [ -d "$PROJECT_ROOT/.git" ]; then
    echo -e "${YELLOW}正在拉取最新代码...${NC}"
    cd "$PROJECT_ROOT"
    git pull origin main || true
    cd "$DEPLOY_DIR"
fi

# 构建镜像
echo -e "${YELLOW}正在构建镜像...${NC}"
docker-compose -f docker/$COMPOSE_FILE build

# 停止旧服务
echo -e "${YELLOW}正在停止旧服务...${NC}"
docker-compose -f docker/$COMPOSE_FILE down || true

# 启动服务
echo -e "${YELLOW}正在启动服务...${NC}"
docker-compose -f docker/$COMPOSE_FILE up -d

# 等待服务健康
echo -e "${YELLOW}正在等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${YELLOW}检查服务状态...${NC}"
docker-compose -f docker/$COMPOSE_FILE ps

echo -e "${GREEN}=========================================="
echo -e "  部署完成！"
echo -e "==========================================${NC}"

# 显示日志
echo -e "${YELLOW}查看日志: docker-compose -f $COMPOSE_FILE logs -f${NC}"
