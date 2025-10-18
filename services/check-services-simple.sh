#!/bin/bash

# 简化版微服务状态检查脚本
# 用于日常开发环境快速检查微服务状态

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

echo -e "${GREEN}检查微服务状态...${NC}"
echo "========================================"

running_count=0
total_services=${#SERVICES[@]}

# 检查每个服务
for service_info in "${SERVICES[@]}"; do
    service_name="${service_info%:*}"
    port="${service_info#*:}"
    
    # 检查端口是否被占用
    if lsof -i ":$port" >/dev/null 2>&1; then
        # 获取进程信息
        port_info=$(lsof -i ":$port" | awk 'NR==2 {print $2}')
        echo -e "${GREEN}✓ $service_name: 运行中 (端口: $port, PID: $port_info)${NC}"
        ((running_count++))
    else
        echo -e "${RED}✗ $service_name: 未运行 (端口: $port)${NC}"
    fi
done

echo "========================================"
echo -e "${GREEN}运行状态: $running_count/$total_services 个服务正在运行${NC}"

if [ $running_count -eq $total_services ]; then
    echo -e "${GREEN}所有服务都在正常运行！${NC}"
elif [ $running_count -gt 0 ]; then
    echo -e "${YELLOW}部分服务正在运行${NC}"
else
    echo -e "${RED}没有服务在运行${NC}"
fi