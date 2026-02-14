INSERT INTO users (id, mobile, nickname, status, balance, points, created_at, updated_at)
VALUES (9000001, '13800000001', '测试用户', 'ACTIVE', 0, 0, NOW(), NOW());

INSERT INTO addresses (id, user_id, name, mobile, province, city, district, town, street, zip_code, detail, is_default, created_at, updated_at)
VALUES (9100001, 9000001, '测试用户', '13800000001', '测试省', '测试市', '测试区', '测试镇', '测试街道', '100000', '测试地址', true, NOW(), NOW());

INSERT INTO categories (id, name, type, price_info, seo, path, level, created_at, updated_at)
VALUES (1001, '废纸', 'PRODUCT', '纸类', 'paper', '0', 0, NOW(), NOW());

INSERT INTO orders (id, order_no, user_id, address_id, order_type, status, channel, estimated_amount, settlement_amount, pay_amount, created_at, updated_at)
VALUES (9200001, 'ORD-TEST-9200001', 9000001, 9100001, 'RECYCLE', 'PENDING', 'APP', 50, 0, 0, NOW(), NOW());

INSERT INTO order_items (id, order_id, category_id, estimated_weight, unit_price, amount, quantity, created_at)
VALUES (9300001, 9200001, 1001, 5, 10, 50, 1, NOW());

INSERT INTO payments (id, order_id, transaction_id, out_trade_no, total, status, provider, created_at, updated_at)
VALUES (9400001, 9200001, 9400001001, 'OUT9400001001', 50, 'PENDING', 'ALIPAY', NOW(), NOW());

INSERT INTO payment_logs (id, transaction_id, order_id, amount, status, provider, raw_data, created_at)
VALUES (9500001, 9400001001, 9200001, 50, 'PENDING', 'ALIPAY', '{}', NOW());

INSERT INTO logistics_orders (id, order_id, logistics_no, logistics_company, status, created_at, updated_at)
VALUES (9600001, 9200001, 'JDTEST001', 'JD', 'CREATED', NOW(), NOW());

INSERT INTO order_timelines (id, order_id, status, message, operator, created_at)
VALUES (9700001, 9200001, 'PENDING', '订单创建', 'SYSTEM', NOW());
