#!/bin/bash

# ============================================================
# 一键数据库初始化脚本
# 功能：自动完成迁移和种子数据初始化
# 使用：chmod +x init-database.sh && ./init-database.sh
# ============================================================

set -e  # 遇到错误立即退出

echo "🚀 开始数据库初始化..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查依赖
check_dependencies() {
    echo -e "${YELLOW}📋 检查运行环境...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        exit 1
    fi
    
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}⚠️  PostgreSQL 客户端未安装（可选）${NC}"
    fi

    echo -e "${GREEN}✅ 环境检查通过${NC}"
}

# 检查数据库连接
check_database() {
    echo -e "${YELLOW}🔍 检查数据库连接...${NC}"
    
    if [ -f ".env" ]; then
        source .env
        
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            echo -e "${GREEN}✅ 数据库服务运行中${NC}"
        else
            echo -e "${RED}❌ 数据库服务未启动${NC}"
            echo ""
            echo "请先启动 PostgreSQL："
            echo "  macOS: brew services start postgresql"
            echo "  Linux: sudo systemctl start postgresql"
            exit 1
        fi
    else
        echo -e "${RED}❌ .env 文件不存在${NC}"
        exit 1
    fi
}

# 步骤1：生成 Prisma Client
generate_client() {
    echo ""
    echo -e "${YELLOW}📦 步骤 1/3：生成 Prisma Client...${NC}"
    
    npm run prisma:generate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Prisma Client 生成成功${NC}"
    else
        echo -e "${RED}❌ Prisma Client 生成失败${NC}"
        exit 1
    fi
}

# 步骤2：运行数据库迁移
run_migration() {
    echo ""
    echo -e "${YELLOW}💾 步骤 2/3：运行数据库迁移...${NC}"
    
    read -p "是否继续？这将创建 Banner 和 Article 表 (y/n): " confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        echo "跳过迁移步骤"
        return
    fi
    
    npm run prisma:migrate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 数据库迁移成功${NC}"
    else
        echo -e "${RED}❌ 数据库迁移失败${NC}"
        exit 1
    fi
}

# 步骤3：运行种子数据
run_seed() {
    echo ""
    echo -e "${YELLOW}🌱 步骤 3/3：初始化种子数据...${NC}"
    
    read -p "是否继续？这将插入示例数据 (y/n): " confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        echo "跳过种子数据步骤"
        return
    fi
    
    npm run seed
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 种子数据初始化成功${NC}"
    else
        echo -e "${RED}❌ 种子数据初始化失败${NC}"
        exit 1
    fi
}

# 显示结果摘要
show_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🎉 数据库初始化完成！${NC}"
    echo ""
    echo "📊 已完成的操作："
    echo "  ✅ 生成 Prisma Client"
    echo "  ✅ 创建 Banner 表（5条初始数据）"
    echo "  ✅ 创建 Article 表（5篇初始文章）"
    echo "  ✅ 配置物流服务商（4家，含费率）"
    echo ""
    echo "🔗 下一步操作："
    echo "  1. 启动开发服务器：npm run dev"
    echo "  2. 测试 API 接口："
    echo "     curl http://localhost:3001/system/banners"
    echo "     curl http://localhost:3001/system/articles"
    echo "  3. 查看数据：npx prisma studio"
    echo ""
    echo "📖 详细文档：server/docs/DATABASE_MIGRATION_GUIDE.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 主流程
main() {
    cd "$(dirname "$0")/.." || exit 1
    
    check_dependencies
    check_database
    generate_client
    run_migration
    run_seed
    show_summary
}

main "$@"
