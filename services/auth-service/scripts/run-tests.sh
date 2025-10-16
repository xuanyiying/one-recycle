#!/bin/bash

# API测试运行脚本
# 用于运行所有API测试用例

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

# 检查Node.js和npm是否安装
check_dependencies() {
    print_message $BLUE "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        print_message $RED "错误: Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_message $RED "错误: npm 未安装"
        exit 1
    fi
    
    print_message $GREEN "✓ 依赖检查通过"
}

# 安装依赖
install_dependencies() {
    print_message $BLUE "安装依赖..."
    npm install
    print_message $GREEN "✓ 依赖安装完成"
}

# 设置测试环境
setup_test_env() {
    print_message $BLUE "设置测试环境..."
    
    # 检查.env.test文件是否存在
    if [ ! -f ".env.test" ]; then
        print_message $YELLOW "警告: .env.test 文件不存在，将使用默认配置"
    fi
    
    # 设置NODE_ENV
    export NODE_ENV=test
    
    print_message $GREEN "✓ 测试环境设置完成"
}

# 运行特定测试套件
run_test_suite() {
    local test_file=$1
    local test_name=$2
    
    print_message $BLUE "运行 ${test_name} 测试..."
    
    if npm test -- --testPathPattern="${test_file}" --verbose; then
        print_message $GREEN "✓ ${test_name} 测试通过"
        return 0
    else
        print_message $RED "✗ ${test_name} 测试失败"
        return 1
    fi
}

# 运行所有测试
run_all_tests() {
    print_message $BLUE "运行所有测试..."
    
    if npm test -- --verbose --coverage; then
        print_message $GREEN "✓ 所有测试通过"
        return 0
    else
        print_message $RED "✗ 部分测试失败"
        return 1
    fi
}

# 生成测试报告
generate_report() {
    print_message $BLUE "生成测试报告..."
    
    # 运行测试并生成覆盖率报告
    npm test -- --coverage --coverageReporters=html --coverageReporters=text
    
    if [ -d "coverage" ]; then
        print_message $GREEN "✓ 测试报告已生成在 coverage/ 目录"
        print_message $YELLOW "可以打开 coverage/lcov-report/index.html 查看详细报告"
    fi
}

# 清理测试环境
cleanup() {
    print_message $BLUE "清理测试环境..."
    
    # 清理临时文件
    if [ -d "coverage" ]; then
        rm -rf coverage
    fi
    
    # 重置环境变量
    unset NODE_ENV
    
    print_message $GREEN "✓ 清理完成"
}

# 显示帮助信息
show_help() {
    echo "API测试运行脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -a, --all           运行所有测试 (默认)"
    echo "  -u, --auth          只运行认证测试"
    echo "  -s, --users         只运行用户测试"
    echo "  -o, --orders        只运行订单测试"
    echo "  -c, --coverage      运行测试并生成覆盖率报告"
    echo "  -w, --watch         监视模式运行测试"
    echo "  --clean             清理测试环境"
    echo "  --setup             只设置测试环境"
    echo ""
    echo "示例:"
    echo "  $0                  # 运行所有测试"
    echo "  $0 -u               # 只运行认证测试"
    echo "  $0 -c               # 运行测试并生成覆盖率报告"
    echo "  $0 -w               # 监视模式"
}

# 主函数
main() {
    local option=${1:-"--all"}
    
    case $option in
        -h|--help)
            show_help
            exit 0
            ;;
        --clean)
            cleanup
            exit 0
            ;;
        --setup)
            check_dependencies
            install_dependencies
            setup_test_env
            exit 0
            ;;
        -w|--watch)
            check_dependencies
            setup_test_env
            print_message $BLUE "启动监视模式..."
            npm test -- --watch --verbose
            ;;
        -c|--coverage)
            check_dependencies
            setup_test_env
            generate_report
            ;;
        -u|--auth)
            check_dependencies
            setup_test_env
            run_test_suite "auth.test.ts" "认证API"
            ;;
        -s|--users)
            check_dependencies
            setup_test_env
            run_test_suite "users.test.ts" "用户API"
            ;;
        -o|--orders)
            check_dependencies
            setup_test_env
            run_test_suite "orders.test.ts" "订单API"
            ;;
        -a|--all|*)
            check_dependencies
            setup_test_env
            
            local failed_tests=0
            
            # 运行各个测试套件
            run_test_suite "auth.test.ts" "认证API" || ((failed_tests++))
            run_test_suite "users.test.ts" "用户API" || ((failed_tests++))
            run_test_suite "orders.test.ts" "订单API" || ((failed_tests++))
            
            if [ $failed_tests -eq 0 ]; then
                print_message $GREEN "🎉 所有测试套件都通过了！"
                exit 0
            else
                print_message $RED "❌ 有 $failed_tests 个测试套件失败"
                exit 1
            fi
            ;;
    esac
}

# 捕获中断信号
trap cleanup EXIT

# 运行主函数
main "$@"