#!/bin/bash

# 测试运行脚本
# 用于运行API测试套件

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查Node.js版本
check_node_version() {
    print_message $BLUE "检查Node.js版本..."
    if ! command -v node &> /dev/null; then
        print_message $RED "错误: 未找到Node.js，请先安装Node.js"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_message $RED "错误: Node.js版本过低，需要16.0.0或更高版本"
        exit 1
    fi
    
    print_message $GREEN "Node.js版本检查通过: $(node -v)"
}

# 安装依赖
install_dependencies() {
    print_message $BLUE "安装依赖..."
    if [ ! -d "node_modules" ]; then
        npm install
    else
        print_message $GREEN "依赖已安装"
    fi
}

# 设置测试环境
setup_test_env() {
    print_message $BLUE "设置测试环境..."
    
    # 检查.env.test文件是否存在
    if [ ! -f ".env.test" ]; then
        print_message $YELLOW "警告: .env.test文件不存在，使用默认配置"
        cp .env.example .env.test
    fi
    
    # 设置环境变量
    export NODE_ENV=test
    export JWT_SECRET=test-jwt-secret-key-for-testing-only
    export JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-testing-only
    
    print_message $GREEN "测试环境设置完成"
}

# 清理测试数据
cleanup_test_data() {
    print_message $BLUE "清理测试数据..."
    
    # 删除测试数据库文件（如果使用SQLite）
    if [ -f "test.db" ]; then
        rm test.db
        print_message $GREEN "测试数据库已清理"
    fi
    
    # 清理测试日志
    if [ -d "logs/test" ]; then
        rm -rf logs/test/*
        print_message $GREEN "测试日志已清理"
    fi
}

# 运行特定类型的测试
run_specific_tests() {
    local test_type=$1
    
    case $test_type in
        "auth")
            print_message $BLUE "运行认证API测试..."
            npm test -- tests/auth/auth.test.ts
            ;;
        "users")
            print_message $BLUE "运行用户管理API测试..."
            npm test -- tests/users/users.test.ts
            ;;
        "orders")
            print_message $BLUE "运行订单管理API测试..."
            npm test -- tests/orders/orders.test.ts
            ;;
        "unit")
            print_message $BLUE "运行单元测试..."
            npm test -- --testPathPattern="unit"
            ;;
        "integration")
            print_message $BLUE "运行集成测试..."
            npm test -- --testPathPattern="integration"
            ;;
        *)
            print_message $RED "未知的测试类型: $test_type"
            print_message $YELLOW "可用的测试类型: auth, users, orders, unit, integration"
            exit 1
            ;;
    esac
}

# 运行所有测试
run_all_tests() {
    print_message $BLUE "运行所有测试..."
    npm test
}

# 运行测试覆盖率
run_coverage() {
    print_message $BLUE "运行测试覆盖率分析..."
    npm run test:coverage
}

# 运行性能测试
run_performance_tests() {
    print_message $BLUE "运行性能测试..."
    if [ -d "tests/performance" ]; then
        npm test -- tests/performance/
    else
        print_message $YELLOW "性能测试目录不存在，跳过性能测试"
    fi
}

# 生成测试报告
generate_test_report() {
    print_message $BLUE "生成测试报告..."
    
    # 创建报告目录
    mkdir -p reports
    
    # 运行测试并生成报告
    npm test -- --reporters=default --reporters=jest-html-reporters
    
    if [ -f "reports/jest_html_reporters.html" ]; then
        print_message $GREEN "测试报告已生成: reports/jest_html_reporters.html"
    fi
}

# 监听模式
run_watch_mode() {
    print_message $BLUE "启动测试监听模式..."
    npm test -- --watch
}

# 显示帮助信息
show_help() {
    echo "API测试运行脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help              显示帮助信息"
    echo "  -a, --all               运行所有测试"
    echo "  -t, --type <type>       运行特定类型的测试 (auth|users|orders|unit|integration)"
    echo "  -c, --coverage          运行测试覆盖率分析"
    echo "  -p, --performance       运行性能测试"
    echo "  -r, --report            生成测试报告"
    echo "  -w, --watch             启动测试监听模式"
    echo "  --clean                 清理测试数据"
    echo "  --setup                 仅设置测试环境"
    echo ""
    echo "示例:"
    echo "  $0 -a                   运行所有测试"
    echo "  $0 -t auth              运行认证API测试"
    echo "  $0 -c                   运行测试覆盖率分析"
    echo "  $0 -w                   启动测试监听模式"
}

# 主函数
main() {
    # 检查是否在正确的目录
    if [ ! -f "package.json" ]; then
        print_message $RED "错误: 请在API项目根目录下运行此脚本"
        exit 1
    fi
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -a|--all)
                check_node_version
                install_dependencies
                setup_test_env
                cleanup_test_data
                run_all_tests
                exit 0
                ;;
            -t|--type)
                if [ -z "$2" ]; then
                    print_message $RED "错误: 请指定测试类型"
                    exit 1
                fi
                check_node_version
                install_dependencies
                setup_test_env
                cleanup_test_data
                run_specific_tests "$2"
                shift 2
                exit 0
                ;;
            -c|--coverage)
                check_node_version
                install_dependencies
                setup_test_env
                cleanup_test_data
                run_coverage
                exit 0
                ;;
            -p|--performance)
                check_node_version
                install_dependencies
                setup_test_env
                run_performance_tests
                exit 0
                ;;
            -r|--report)
                check_node_version
                install_dependencies
                setup_test_env
                cleanup_test_data
                generate_test_report
                exit 0
                ;;
            -w|--watch)
                check_node_version
                install_dependencies
                setup_test_env
                run_watch_mode
                exit 0
                ;;
            --clean)
                cleanup_test_data
                print_message $GREEN "测试数据清理完成"
                exit 0
                ;;
            --setup)
                check_node_version
                install_dependencies
                setup_test_env
                print_message $GREEN "测试环境设置完成"
                exit 0
                ;;
            *)
                print_message $RED "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有提供参数，显示帮助信息
    show_help
}

# 运行主函数
main "$@"