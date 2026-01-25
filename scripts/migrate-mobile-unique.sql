-- 数据库迁移脚本：为mobile字段添加唯一约束
-- 执行前请确保备份数据库

-- 1. 检查是否存在重复的mobile数据
SELECT mobile, COUNT(*) as count 
FROM users 
WHERE mobile IS NOT NULL 
GROUP BY mobile 
HAVING COUNT(*) > 1;

-- 2. 如果存在重复数据，需要先清理
-- 保留最早创建的用户，删除重复的用户
-- 注意：这个操作会删除数据，请谨慎执行
/*
DELETE FROM users 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM users 
    WHERE mobile IS NOT NULL 
    GROUP BY mobile
);
*/

-- 3. 为mobile字段添加唯一约束
ALTER TABLE users ADD CONSTRAINT users_mobile_unique UNIQUE (mobile);

-- 4. 创建索引以提高查询性能（如果还没有的话）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_mobile ON users (mobile);

-- 验证约束是否创建成功
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE 
    tc.constraint_type = 'UNIQUE' 
    AND tc.table_name = 'users'
    AND kcu.column_name = 'mobile';

    -- Seed data for categories
INSERT INTO "categories" ("name", "description", "price_info", "seo", "updated_at")
SELECT '旧书', '各类二手书籍回收', '{}', '{}', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = '旧书');

INSERT INTO "categories" ("name", "description", "price_info", "seo", "updated_at")
SELECT '旧衣', '各类旧衣物回收', '{}', '{}', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "categories" WHERE "name" = '旧衣');
