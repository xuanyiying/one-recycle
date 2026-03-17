#!/bin/bash
# ============================================================================
# OneRecycle 服务管理脚本
# 使用方法: ./service.sh [command] [service]
# 示例: 
#   ./service.sh status
#   ./service.sh restart api-gateway
#   ./service.sh logs postgres
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$SCRIPT_DIR/.."

COMPOSE_FILE="docker-compose.production.yml"

show_usage() {
    echo "OneRecycle 服务管理脚本"
    echo ""
    echo "使用方法: $0 [command] [service]"
    echo ""
    echo "命令:"
    echo "  start [service]    启动服务"
    echo "  stop [service]     停止服务"
    echo "  restart [service]  重启服务"
    echo "  logs [service]     查看日志"
    echo "  status             查看状态"
    echo "  health             健康检查"
    echo "  backup             备份数据"
    echo ""
    echo "示例:"
    echo "  $0 start"
    echo "  $0 restart api-gateway"
    echo "  $0 logs postgres"
    echo "  $0 status"
}

COMMAND=${1:-status}
SERVICE=${2:-}

cd "$DEPLOY_DIR"

case "$COMMAND" in
    start)
        if [ -n "$SERVICE" ]; then
            docker-compose -f docker/$COMPOSE_FILE start "$SERVICE"
        else
            docker-compose -f docker/$COMPOSE_FILE start
        fi
        ;;
    stop)
        if [ -n "$SERVICE" ]; then
            docker-compose -f docker/$COMPOSE_FILE stop "$SERVICE"
        else
            docker-compose -f docker/$COMPOSE_FILE stop
        fi
        ;;
    restart)
        if [ -n "$SERVICE" ]; then
            docker-compose -f docker/$COMPOSE_FILE restart "$SERVICE"
        else
            docker-compose -f docker/$COMPOSE_FILE restart
        fi
        ;;
    logs)
        if [ -n "$SERVICE" ]; then
            docker-compose -f docker/$COMPOSE_FILE logs -f "$SERVICE"
        else
            echo "请指定服务名"
            echo "可用服务: postgres, redis, api-gateway, account-service, order-service, nginx"
            exit 1
        fi
        ;;
    status)
        docker-compose -f docker/$COMPOSE_FILE ps
        ;;
    health)
        echo "检查服务健康状态..."
        echo ""
        curl -sf http://localhost:3002/health && echo "✓ API Gateway" || echo "✗ API Gateway"
        docker exec one-recycle-postgres pg_isready -U one_recycle && echo "✓ PostgreSQL" || echo "✗ PostgreSQL"
        docker exec one-recycle-redis redis-cli ping > /dev/null 2>&1 && echo "✓ Redis" || echo "✗ Redis"
        ;;
    backup)
        echo "开始备份..."
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        
        # 备份数据库
        echo "备份数据库..."
        docker exec one-recycle-postgres pg_dump -U one_recycle one_recycle > "$DEPLOY_DIR/backup/backup_$TIMESTAMP.sql"
        
        # 备份 Redis
        echo "备份 Redis..."
        docker exec one-recycle-redis redis-cli -a "$(grep REDIS_PASSWORD $DEPLOY_DIR/config/.env.production | cut -d'=' -f2)" --no-auth-warning SAVE
        
        echo "备份完成: backup_$TIMESTAMP.sql"
        ;;
    *)
        show_usage
        ;;
esac
