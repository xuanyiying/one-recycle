#!/bin/bash
# ============================================================================
# OneRecycle 部署脚本
# 使用方法: ./deploy.sh [environment]
# 示例: ./deploy.sh production
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DEPLOY_DIR="$PROJECT_ROOT/deploy"

ENVIRONMENT=${1:-production}
COMPOSE_FILE="$DEPLOY_DIR/docker/docker-compose.$ENVIRONMENT.yml"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo -e "  OneRecycle 部署脚本"
echo -e "  环境: $ENVIRONMENT"
echo -e "==========================================${NC}"

# 检查 docker-compose 文件
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}错误: 找不到 $COMPOSE_FILE${NC}"
    exit 1
fi

# 检查环境变量文件
ENV_FILE="$DEPLOY_DIR/config/.env.$ENVIRONMENT"
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${YELLOW}警告: 找不到 $ENV_FILE${NC}"
        echo -e "${YELLOW}请从 .env.production 复制并配置:${NC}"
        echo -e "${YELLOW}  cp $DEPLOY_DIR/config/.env.production $ENV_FILE${NC}"
        echo ""
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

cd "$PROJECT_ROOT"

# 拉取最新代码（如果使用 git）
if [ -d "$PROJECT_ROOT/.git" ]; then
    echo -e "${YELLOW}[1/6] 正在拉取最新代码...${NC}"
    git pull origin main || true
else
    echo -e "${YELLOW}[1/6] 跳过代码更新 (非 Git 仓库)${NC}"
fi

# 构建镜像
echo -e "${YELLOW}[2/6] 正在构建 Docker 镜像...${NC}"
cd "$DEPLOY_DIR"
docker-compose -f "$COMPOSE_FILE" build --no-cache

# 停止旧服务
echo -e "${YELLOW}[3/6] 正在停止旧服务...${NC}"
docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true

# 启动服务
echo -e "${YELLOW}[4/6] 正在启动服务...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# 等待服务健康
echo -e "${YELLOW}[5/6] 正在等待服务启动...${NC}"
sleep 15

# 检查服务状态
echo -e "${YELLOW}[6/6] 检查服务状态...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

# 数据库迁移 (仅生产环境)
if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    echo -e "${YELLOW}是否执行数据库迁移? (y/N): ${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}执行数据库迁移...${NC}"
        docker exec one-recycle-api-gateway npx prisma migrate deploy || true
        echo -e "${GREEN}数据库迁移完成${NC}"
    fi
fi

# 健康检查
echo ""
echo -e "${YELLOW}执行健康检查...${NC}"
sleep 5

# 检查 API Gateway
if curl -sf http://localhost:3002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API Gateway 健康检查通过${NC}"
else
    echo -e "${RED}✗ API Gateway 健康检查失败${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo -e "  部署完成！"
echo -e "==========================================${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo -e "  主站:     ${YELLOW}https://backbuy.cn${NC}"
echo -e "  API:      ${YELLOW}https://api.backbuy.cn${NC}"
echo -e "  管理后台: ${YELLOW}https://admin.backbuy.cn${NC}"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo -e "  查看日志: ${YELLOW}docker-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  查看状态: ${YELLOW}docker-compose -f $COMPOSE_FILE ps${NC}"
echo -e "  重启服务: ${YELLOW}docker-compose -f $COMPOSE_FILE restart${NC}"
echo -e "  停止服务: ${YELLOW}docker-compose -f $COMPOSE_FILE down${NC}"
