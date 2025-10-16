-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "base_price" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "categories" ADD COLUMN     "unit" VARCHAR(20) NOT NULL DEFAULT 'kg';
ALTER TABLE "categories" ADD COLUMN     "is_hot" BOOLEAN NOT NULL DEFAULT false;

-- Insert default category data based on frontend definitions
INSERT INTO "categories" (name, description, icon, base_price, unit_price, unit, is_hot, sort_order, is_active) VALUES
('手机数码', '手机、平板、数码产品等电子设备回收', 'iphone', 50.00, 100.00, '件', true, 1, true),
('家用电器', '冰箱、洗衣机、空调等大型家电回收', 'home', 30.00, 50.00, 'kg', false, 2, true),
('电脑办公', '笔记本电脑、台式机、办公设备回收', 'laptop', 100.00, 200.00, '件', true, 3, true),
('服装鞋帽', '旧衣物、鞋子、包包等纺织品回收', 'shopping-bag', 2.00, 3.00, 'kg', false, 4, true),
('图书音像', '书籍、CD、DVD等文化用品回收', 'bookmark', 1.00, 2.00, 'kg', false, 5, true),
('运动户外', '运动器材、户外用品回收', 'heart', 5.00, 10.00, 'kg', false, 6, true),
('美妆护肤', '化妆品、护肤品包装回收', 'star', 3.00, 5.00, 'kg', false, 7, true),
('母婴用品', '婴儿用品、玩具等回收', 'gift', 4.00, 8.00, 'kg', false, 8, true),
('汽车用品', '汽车配件、轮胎等回收', 'map-pin', 10.00, 20.00, 'kg', false, 9, true),
('家居建材', '家具、建材等大件物品回收', 'settings', 15.00, 25.00, 'kg', false, 10, true),
('食品饮料', '食品包装、饮料瓶等回收', 'coffee', 1.50, 2.50, 'kg', false, 11, true),
('其他物品', '其他可回收物品', 'folder', 2.00, 4.00, 'kg', false, 12, true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    base_price = EXCLUDED.base_price,
    unit_price = EXCLUDED.unit_price,
    unit = EXCLUDED.unit,
    is_hot = EXCLUDED.is_hot,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();