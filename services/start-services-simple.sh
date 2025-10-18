#!/bin/bash

# 简化版微服务启动脚本
# 用于日常开发环境快速启动所有微服务

# 微服务列表和端口映射
SERVICES=(
    "api-gateway:3000"
    "auth-service:3001"
    "account-service:3002"
    "category-service:3008"
    "order-service:3003"
    "payment-service:3004"
    "inventory-service:3005"
    "courier-service:3006"
    "dispatch-service:3007"
    "notification-service:3009"
)

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}开始启动所有微服务...${NC}"

# 创建日志目录
mkdir -p logs pids

# 启动所有服务
for service_info in "${SERVICES[@]}"; do
    service_name="${service_info%:*}"
    port="${service_info#*:}"
    
    # 检查服务目录是否存在
    if [[ ! -d "$service_name" ]]; then
        echo -e "${YELLOW}警告: 服务目录不存在 $service_name${NC}"
        continue
    fi
    
    # 检查端口是否已被占用
    if lsof -i ":$port" >/dev/null 2>&1; then
        echo -e "${YELLOW}警告: 端口 $port 已被占用，跳过启动 $service_name${NC}"
        continue
    fi
    
    echo -e "启动 $service_name (端口: $port)..."
    
    # 进入服务目录并启动服务
    cd "$service_name" || continue
    
    # 清空日志文件
    > "../logs/$service_name.log"
    
    # 启动服务（后台运行）
    npm run start:dev > "../logs/$service_name.log" 2>&1 &
    pid=$!
    
    # 保存PID
    echo "$pid" > "../pids/$service_name.pid"
    
    echo -e "${GREEN}✓ $service_name 已启动 (PID: $pid)${NC}"
    
    cd ..
done

echo -e "${GREEN}所有服务启动完成！${NC}"
echo "使用 './check-services-simple.sh' 检查服务状态"
echo "使用 './stop-services-simple.sh' 停止所有服务"