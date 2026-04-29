-- OneRecycle 种子数据 SQL
-- 可直接在服务器上执行: docker exec one-recycle-postgres psql -U one_recycle -d one_recycle -f /tmp/seed.sql

BEGIN;

-- 1. 创建默认租户
INSERT INTO tenants (id, name, code, contact_name, contact_phone, status, created_at, updated_at)
VALUES (1, '默认租户', 'DEFAULT', '管理员', '13812345678', 'ACTIVE', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
SELECT 'Tenant created' AS result;

-- 2. 创建管理员角色
INSERT INTO roles (id, tenant_id, name, code, is_admin, description, created_at, updated_at)
VALUES (1, 1, '超级管理员', 'ADMIN', true, '拥有所有权限的系统管理员', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;
SELECT 'Role ADMIN created' AS result;

-- 3. 创建管理员员工 (密码: 123456, SHA256 hash)
INSERT INTO staffs (id, tenant_id, role_id, username, password, real_name, status, created_at, updated_at)
VALUES (
    1,
    1,
    1,
    'admin',
    encode(sha256('123456'::bytea), 'hex'),
    '系统管理员',
    'ACTIVE',
    NOW(),
    NOW()
)
ON CONFLICT (username) DO UPDATE SET
    password = encode(sha256('123456'::bytea), 'hex'),
    tenant_id = EXCLUDED.tenant_id,
    role_id = EXCLUDED.role_id;
SELECT 'Staff admin created' AS result;

-- 4. 创建分类
INSERT INTO categories (id, name, description, type, price_info, seo, sort_order, level, path, created_at, updated_at)
VALUES
    (1, '旧书', '各类二手书籍回收', 'recycle', '{"type":"fixed","unitPrice":2.2,"unit":"kg","currency":"CNY"}', '{}', 1, 1, '0', NOW(), NOW()),
    (2, '旧衣', '各类旧衣物回收', 'recycle', '{"type":"fixed","unitPrice":3.5,"unit":"kg","currency":"CNY"}', '{}', 2, 1, '0', NOW(), NOW())
ON CONFLICT DO NOTHING;
SELECT 'Categories created' AS result;

-- 5. 创建回收定价规则
INSERT INTO recycle_pricing_rules (id, tenant_id, category_id, base_price, min_weight, max_weight, rule_json, is_active, created_at, updated_at)
VALUES
    (1, 1, 1, 2.2, 0.1, 200.0, '{"basePrice":2.2}', true, NOW(), NOW()),
    (2, 1, 2, 3.5, 0.1, 200.0, '{"basePrice":3.5}', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
SELECT 'RecyclePricingRules created' AS result;

-- 6. 创建 FAQ 数据
INSERT INTO faqs (question, answer, category, sort_order, created_at, updated_at)
VALUES
    ('旧书回收支持哪些书籍类型？', '我们支持教材教辅、小说文学、期刊杂志、少儿绘本等大部分书籍。但不回收破损严重、缺页、发霉、非法出版物或无ISBN号的内刊。', 'SERVICE', 1, NOW(), NOW()),
    ('上门回收是否收费？', '我们的上门回收服务是完全免费的。您只需要预约时间，回收员会按时上门进行称重和回收，不收取任何上门费或手续费。', 'SERVICE', 2, NOW(), NOW()),
    ('回收下单有重量要求吗？', '为了避免资源浪费，单次预约回收的物品总重量建议在 5kg 以上。对于旧家电、手机等高价值物品，无重量限制，单件即可下单。', 'SERVICE', 3, NOW(), NOW()),
    ('预约后可以修改或取消订单吗？', '在回收员接单前，您可以随时在"我的订单"中修改或取消。若回收员已接单或出发，请提前致电回收员沟通，避免空跑。', 'SERVICE', 4, NOW(), NOW()),
    ('回收价格是如何制定的？', '回收价格根据当前市场行情动态调整。您可以在首页"分类价格"中查看最新的单价。最终成交价以回收员上门称重后的系统计算为准。', 'PAYMENT', 5, NOW(), NOW()),
    ('回收款多久可以到账？', '订单完成后，回收款会即时打入您的平台余额。您可以随时申请提现到微信或支付宝，通常在 1-2 小时内到账，最快即时到账。', 'PAYMENT', 6, NOW(), NOW()),
    ('提现需要手续费吗？', '普通用户每月享有 3 次免费提现机会。超过次数后，每笔提现将收取 0.1% 的银行通道费（最低 0.1 元）。会员用户享有无限次免费提现权益。', 'PAYMENT', 7, NOW(), NOW()),
    ('旧衣回收有什么具体要求？', '旧衣需要清洗干净、晾干。我们接收四季衣物、鞋帽、家纺（床单被套）。不接收内衣裤、袜子、严重脏污油腻或发霉的衣物。', 'CATEGORY', 8, NOW(), NOW()),
    ('废旧手机回收要注意什么？', '回收前请务必退出 iCloud/账号锁，并备份重要数据。我们会有专业的数据清除流程，但建议您先自行恢复出厂设置以确保万无一失。', 'CATEGORY', 9, NOW(), NOW()),
    ('环保积分有什么用？', '积分可以在"积分商城"兑换环保周边、优惠券或捐赠给公益项目。积分也是计算"环保榜单"排名的重要依据。', 'POINTS', 10, NOW(), NOW()),
    ('如何获得环保积分？', '每完成一笔回收订单，根据物品重量和类型会获得相应积分。此外，每日签到、邀请好友、参与环保知识答题也能获得额外积分。', 'POINTS', 11, NOW(), NOW()),
    ('一个账号可以绑定多个地址吗？', '可以。您可以在"地址管理"中添加常用地址（如家、公司、父母家），下单时选择对应地址即可。', 'ACCOUNT', 12, NOW(), NOW()),
    ('忘记登录密码怎么办？', '目前支持手机号验证码快捷登录，无需记忆密码。如需设置或找回密码，可在"设置-账号安全"中通过手机验证进行操作。', 'ACCOUNT', 13, NOW(), NOW())
ON CONFLICT DO NOTHING;
SELECT 'FAQ data created' AS result;

COMMIT;

-- 验证
SELECT '验证数据:' AS result;
SELECT '租户:' AS info; SELECT * FROM tenants;
SELECT '角色:' AS info; SELECT id, name, code FROM roles;
SELECT '员工:' AS info; SELECT id, username, real_name FROM staffs;
SELECT '分类:' AS info; SELECT id, name, type FROM categories;
SELECT 'FAQ数量:' AS info; SELECT COUNT(*) FROM faqs;
