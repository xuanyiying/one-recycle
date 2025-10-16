#!/bin/bash

# 停止所有微服务脚本
# 使用方法: ./stop-all-services.sh

set -e

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

# 停止 tmux 会话中的服务
stop_tmux_services() {
    log_info "检查 tmux 会话..."
    
    if tmux has-session -t microservices 2>/dev/null; then
        log_info "停止 tmux 会话中的所有服务..."
        tmux kill-session -t microservices
        log_success "tmux 会话已停止"
    else
        log_warning "未找到 microservices tmux 会话"
    fi
}

# 停止后台进程服务
stop_background_services() {
    log_info "停止后台进程服务..."
    
    if [ -d "pids" ]; then
        for pid_file in pids/*.pid; do
            if [ -f "$pid_file" ]; then
                service_name=$(basename "$pid_file" .pid)
                pid=$(cat "$pid_file")
                
                if kill -0 "$pid" 2>/dev/null; then
                    log_info "停止 $service_name (PID: $pid)..."
                    kill "$pid"
                    
                    # 等待进程停止
                    sleep 2
                    
                    # 如果进程仍在运行，强制停止
                    if kill -0 "$pid" 2>/dev/null; then
                        log_warning "强制停止 $service_name..."
                        kill -9 "$pid"
                    fi
                    
                    log_success "$service_name 已停止"
                else
                    log_warning "$service_name 进程不存在 (PID: $pid)"
                fi
                
                rm -f "$pid_file"
            fi
        done
        
        # 清理 PID 目录
        rmdir pids 2>/dev/null || true
    else
        log_warning "未找到 pids 目录"
    fi
}

# 停止所有 Node.js 进程（谨慎使用）
stop_all_node_processes() {
    log_warning "这将停止所有 Node.js 进程，包括非微服务进程"
    read -p "确定要继续吗? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        log_info "停止所有 Node.js 进程..."
        pkill -f "node.*nest start" || log_warning "未找到相关 Node.js 进程"
        pkill -f "npm run start" || log_warning "未找到相关 npm 进程"
        log_success "所有相关进程已停止"
    fi
}

# 清理日志文件
cleanup_logs() {
    read -p "是否清理日志文件? (y/N): " cleanup
    
    if [[ $cleanup =~ ^[Yy]$ ]]; then
        if [ -d "logs" ]; then
            log_info "清理日志文件..."
            rm -rf logs
            log_success "日志文件已清理"
        else
            log_warning "未找到 logs 目录"
        fi
    fi
}

# 显示运行中的相关进程
show_running_processes() {
    log_info "检查运行中的相关进程..."
    
    echo "Node.js 进程:"
    ps aux | grep -E "(node|npm)" | grep -v grep || echo "  无相关进程"
    
    echo ""
    echo "端口占用情况:"
    for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
        if lsof -i :$port &>/dev/null; then
            echo "  端口 $port: $(lsof -i :$port | tail -n 1 | awk '{print $1, $2}')"
        fi
    done
}

# 主函数
main() {
    log_info "开始停止所有微服务..."
    
    # 检查当前目录
    if [ ! -f "package.json" ]; then
        log_error "请在 services 目录下运行此脚本"
        exit 1
    fi
    
    # 停止 tmux 服务
    stop_tmux_services
    
    # 停止后台服务
    stop_background_services
    
    # 显示运行中的进程
    show_running_processes
    
    # 询问是否要停止所有 Node.js 进程
    if ps aux | grep -E "(node|npm)" | grep -v grep &>/dev/null; then
        echo ""
        log_warning "仍有 Node.js 进程在运行"
        stop_all_node_processes
    fi
    
    # 清理日志
    cleanup_logs
    
    log_success "所有微服务已停止！"
}

# 运行主函数
main "$@"