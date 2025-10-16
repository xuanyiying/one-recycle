#!/bin/bash

# 检查所有微服务状态脚本
# 使用方法: ./check-services-status.sh

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 微服务列表和端口配置
SERVICES="api-gateway:3000 auth-service:3001 account-service:3002 category-service:3008 order-service:3003 payment-service:3004 inventory-service:3005 courier-service:3006 dispatch-service:3007 notification-service:3009"

# 获取服务端口
get_service_port() {
    local service_name=$1
    echo "$SERVICES" | tr ' ' '\n' | grep "^$service_name:" | cut -d':' -f2
}

# 获取所有服务名称
get_all_services() {
    echo "$SERVICES" | tr ' ' '\n' | cut -d':' -f1
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -i :$port &>/dev/null; then
        return 0  # 端口被占用
    else
        return 1  # 端口未被占用
    fi
}

# 检查服务健康状态
check_service_health() {
    local service=$1
    local port=$2
    
    # 检查端口是否被占用
    if check_port $port; then
        # 尝试访问健康检查端点
        if curl -s "http://localhost:$port/health" &>/dev/null; then
            echo -e "${GREEN}✓${NC} $service (端口 $port) - 健康"
        elif curl -s "http://localhost:$port" &>/dev/null; then
            echo -e "${YELLOW}⚠${NC} $service (端口 $port) - 运行中 (无健康检查)"
        else
            echo -e "${YELLOW}⚠${NC} $service (端口 $port) - 端口占用但无响应"
        fi
    else
        echo -e "${RED}✗${NC} $service (端口 $port) - 未运行"
    fi
}

# 检查 tmux 会话状态
check_tmux_status() {
    log_info "检查 tmux 会话状态..."
    
    if command -v tmux &> /dev/null; then
        if tmux has-session -t microservices 2>/dev/null; then
            log_success "microservices tmux 会话正在运行"
            echo "tmux 窗口列表:"
            tmux list-windows -t microservices | sed 's/^/  /'
        else
            log_warning "microservices tmux 会话未运行"
        fi
    else
        log_warning "tmux 未安装"
    fi
    echo ""
}

# 检查后台进程状态
check_background_processes() {
    log_info "检查后台进程状态..."
    
    if [ -d "pids" ]; then
        local running_count=0
        local total_count=0
        
        for pid_file in pids/*.pid; do
            if [ -f "$pid_file" ]; then
                service_name=$(basename "$pid_file" .pid)
                pid=$(cat "$pid_file")
                ((total_count++))
                
                if kill -0 "$pid" 2>/dev/null; then
                    echo -e "  ${GREEN}✓${NC} $service_name (PID: $pid)"
                    ((running_count++))
                else
                    echo -e "  ${RED}✗${NC} $service_name (PID: $pid) - 进程不存在"
                fi
            fi
        done
        
        if [ $total_count -eq 0 ]; then
            log_warning "未找到 PID 文件"
        else
            echo "  运行中: $running_count/$total_count"
        fi
    else
        log_warning "未找到 pids 目录"
    fi
    echo ""
}

# 显示端口占用情况
show_port_usage() {
    log_info "端口占用情况:"
    echo "=================================="
    
    for service_port in $SERVICES; do
        service=$(echo "$service_port" | cut -d':' -f1)
        port=$(echo "$service_port" | cut -d':' -f2)
        check_service_health "$service" "$port"
    done
    
    echo "=================================="
    echo ""
}

# 显示系统资源使用情况
show_system_resources() {
    log_info "系统资源使用情况:"
    
    # CPU 使用率
    if command -v top &> /dev/null; then
        echo "CPU 使用率:"
        top -l 1 | grep "CPU usage" | sed 's/^/  /'
    fi
    
    # 内存使用率
    if command -v vm_stat &> /dev/null; then
        echo "内存使用情况:"
        vm_stat | head -5 | sed 's/^/  /'
    fi
    
    # Node.js 进程
    echo "Node.js 进程:"
    ps aux | grep -E "(node|npm)" | grep -v grep | head -10 | awk '{print "  " $1, $2, $3, $4, $11}' || echo "  无 Node.js 进程"
    
    echo ""
}

# 显示日志文件信息
show_log_info() {
    if [ -d "logs" ]; then
        log_info "日志文件信息:"
        
        for log_file in logs/*.log; do
            if [ -f "$log_file" ]; then
                service_name=$(basename "$log_file" .log)
                file_size=$(du -h "$log_file" | cut -f1)
                last_modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$log_file")
                echo "  $service_name: $file_size (最后修改: $last_modified)"
            fi
        done
        echo ""
    fi
}

# 快速健康检查
quick_health_check() {
    log_info "快速健康检查..."
    
    local healthy_count=0
    local total_count=0
    
    for service_port in $SERVICES; do
        service=$(echo "$service_port" | cut -d':' -f1)
        port=$(echo "$service_port" | cut -d':' -f2)
        ((total_count++))
        if check_port $port; then
            ((healthy_count++))
        fi
    done
    
    if [ $healthy_count -eq $total_count ]; then
        log_success "所有服务 ($healthy_count/$total_count) 都在运行"
    elif [ $healthy_count -gt 0 ]; then
        log_warning "部分服务 ($healthy_count/$total_count) 在运行"
    else
        log_error "没有服务在运行 ($healthy_count/$total_count)"
    fi
    
    echo ""
}

# 主函数
main() {
    echo "========================================"
    echo "        微服务状态检查报告"
    echo "========================================"
    echo ""
    
    # 检查当前目录
    if [ ! -f "package.json" ]; then
        log_error "请在 services 目录下运行此脚本"
        exit 1
    fi
    
    # 快速健康检查
    quick_health_check
    
    # 详细状态检查
    show_port_usage
    check_tmux_status
    check_background_processes
    show_log_info
    show_system_resources
    
    echo "========================================"
    echo "检查完成 - $(date)"
    echo "========================================"
}

# 运行主函数
main "$@"