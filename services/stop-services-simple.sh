#!/bin/bash

# 简化版微服务停止脚本
# 用于日常开发环境快速停止所有微服务

# 微服务列表
SERVICES=(
    "api-gateway"
    "auth-service"
    "account-service"
    "category-service"
    "order-service"
    "payment-service"
    "inventory-service"
    "courier-service"
    "dispatch-service"
    "notification-service"
)

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}停止所有微服务...${NC}"

# 停止所有服务
for service_name in "${SERVICES[@]}"; do
    # 检查PID文件是否存在
    if [[ -f "pids/$service_name.pid" ]]; then
        pid=$(cat "pids/$service_name.pid")
        
        # 检查进程是否仍在运行
        if kill -0 "$pid" 2>/dev/null; then
            # 停止进程
            kill "$pid"
            echo -e "${GREEN}✓ $service_name 已停止 (PID: $pid)${NC}"
        else
            echo -e "${YELLOW}⚠ $service_name 进程未运行 (PID: $pid)${NC}"
        fi
        
        # 删除PID文件
        rm -f "pids/$service_name.pid"
    else
        echo -e "${YELLOW}⚠ $service_name PID文件不存在${NC}"
    fi
done

echo -e "${GREEN}所有服务停止完成！${NC}"