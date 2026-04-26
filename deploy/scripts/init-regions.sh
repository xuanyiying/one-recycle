#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REGIONS_SQL="$SCRIPT_DIR/seed-regions.sql"

echo "=== OneRecycle 行政区划数据初始化 ==="

if [ ! -f "$REGIONS_SQL" ]; then
    echo "[ERROR] 找不到 seed-regions.sql 文件: $REGIONS_SQL"
    exit 1
fi

# 检查 PostgreSQL 容器是否存在
if ! docker ps --format '{{.Names}}' | grep -q "one-recycle-postgres"; then
    echo "[ERROR] PostgreSQL 容器未运行"
    exit 1
fi

echo "[1/3] 复制 SQL 文件到容器..."
docker cp "$REGIONS_SQL" one-recycle-postgres:/tmp/seed-regions.sql

echo "[2/3] 导入行政区划数据 (42176 条记录)..."
docker exec one-recycle-postgres psql -U one_recycle -d one_recycle -f /tmp/seed-regions.sql

echo "[3/3] 验证数据..."
COUNT=$(docker exec one-recycle-postgres psql -U one_recycle -d one_recycle -t -c "SELECT COUNT(*) FROM regions;")
echo "已导入 $COUNT 条记录"

echo ""
echo "=== 行政区划数据初始化完成 ==="
echo ""
echo "数据分布:"
docker exec one-recycle-postgres psql -U one_recycle -d one_recycle -c "
SELECT 
    CASE level 
        WHEN 1 THEN '省级' 
        WHEN 2 THEN '市级' 
        WHEN 3 THEN '区县级' 
        WHEN 4 THEN '街道级' 
    END AS 层级,
    COUNT(*) AS 数量
FROM regions 
GROUP BY level 
ORDER BY level;
"
