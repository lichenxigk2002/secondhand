-- 为“熙子”买家视角补充同地址附近商品。
-- 说明：
-- 1. 熙子不会作为这些商品的卖家。
-- 2. 脚本会取熙子最近发布的一条商品位置作为参考地址，让这些商品出现在同一位置附近。
-- 3. 可重复执行；同一卖家同一标题已存在时不会重复插入。

USE lbs_secondhand;

SET @xizi_id := (
  SELECT id
  FROM `user`
  WHERE nick_name = '熙子'
  ORDER BY id DESC
  LIMIT 1
);

SET @ref_lat := COALESCE((
  SELECT lat
  FROM goods
  WHERE user_id = @xizi_id
  ORDER BY create_time DESC
  LIMIT 1
), 23.1291630);

SET @ref_lng := COALESCE((
  SELECT lng
  FROM goods
  WHERE user_id = @xizi_id
  ORDER BY create_time DESC
  LIMIT 1
), 113.2644350);

SET @ref_address := COALESCE((
  SELECT NULLIF(address, '')
  FROM goods
  WHERE user_id = @xizi_id
  ORDER BY create_time DESC
  LIMIT 1
), '宿舍区门口');

INSERT INTO `user` (openid, nick_name, avatar, phone, campus, credit_score, status, create_time, update_time)
SELECT 'demo_nearby_seller_yiran', '许亦然', 'https://i.pravatar.cc/160?img=32', '13800020001', @ref_address, 98, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'demo_nearby_seller_yiran');

INSERT INTO `user` (openid, nick_name, avatar, phone, campus, credit_score, status, create_time, update_time)
SELECT 'demo_nearby_seller_chenmo', '陈墨', 'https://i.pravatar.cc/160?img=15', '13800020002', @ref_address, 96, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'demo_nearby_seller_chenmo');

INSERT INTO `user` (openid, nick_name, avatar, phone, campus, credit_score, status, create_time, update_time)
SELECT 'demo_nearby_seller_zhixia', '周知夏', 'https://i.pravatar.cc/160?img=47', '13800020003', @ref_address, 99, 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `user` WHERE openid = 'demo_nearby_seller_zhixia');

SET @seller_yiran := (SELECT id FROM `user` WHERE openid = 'demo_nearby_seller_yiran' LIMIT 1);
SET @seller_chenmo := (SELECT id FROM `user` WHERE openid = 'demo_nearby_seller_chenmo' LIMIT 1);
SET @seller_zhixia := (SELECT id FROM `user` WHERE openid = 'demo_nearby_seller_zhixia' LIMIT 1);

SET @cat_digital := COALESCE((SELECT id FROM category WHERE name = '数码' LIMIT 1), 0);
SET @cat_book := COALESCE((SELECT id FROM category WHERE name = '书籍' LIMIT 1), 0);
SET @cat_life := COALESCE((SELECT id FROM category WHERE name = '生活用品' LIMIT 1), 0);

INSERT INTO goods (
  user_id, category_id, title, description, price, images,
  lat, lng, address, status, audit_status, view_count, create_time, update_time
)
SELECT
  @seller_yiran, @cat_digital, '九成新 iPad Air 5 64G',
  '自用平板，屏幕无明显划痕，主要用于记笔记和看课件，带保护壳。',
  2480.00,
  JSON_ARRAY('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80'),
  @ref_lat, @ref_lng, @ref_address, 1, 1, 86, NOW() - INTERVAL 35 MINUTE, NOW()
WHERE @xizi_id IS NOT NULL
  AND @seller_yiran <> @xizi_id
  AND NOT EXISTS (SELECT 1 FROM goods WHERE user_id = @seller_yiran AND title = '九成新 iPad Air 5 64G');

INSERT INTO goods (
  user_id, category_id, title, description, price, images,
  lat, lng, address, status, audit_status, view_count, create_time, update_time
)
SELECT
  @seller_chenmo, @cat_digital, '机械键盘 87 键热插拔',
  '茶轴，附备用键帽和拔轴器，宿舍学习办公都可以，功能正常。',
  168.00,
  JSON_ARRAY('https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80'),
  @ref_lat, @ref_lng, @ref_address, 1, 1, 64, NOW() - INTERVAL 50 MINUTE, NOW()
WHERE @xizi_id IS NOT NULL
  AND @seller_chenmo <> @xizi_id
  AND NOT EXISTS (SELECT 1 FROM goods WHERE user_id = @seller_chenmo AND title = '机械键盘 87 键热插拔');

INSERT INTO goods (
  user_id, category_id, title, description, price, images,
  lat, lng, address, status, audit_status, view_count, create_time, update_time
)
SELECT
  @seller_zhixia, @cat_book, '高等数学教材和习题册',
  '同济版高数教材配套习题册，少量笔记，适合期末复习。',
  26.00,
  JSON_ARRAY('https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80'),
  @ref_lat, @ref_lng, @ref_address, 1, 1, 51, NOW() - INTERVAL 70 MINUTE, NOW()
WHERE @xizi_id IS NOT NULL
  AND @seller_zhixia <> @xizi_id
  AND NOT EXISTS (SELECT 1 FROM goods WHERE user_id = @seller_zhixia AND title = '高等数学教材和习题册');

INSERT INTO goods (
  user_id, category_id, title, description, price, images,
  lat, lng, address, status, audit_status, view_count, create_time, update_time
)
SELECT
  @seller_yiran, @cat_life, '宿舍折叠桌和护眼台灯',
  '折叠桌稳定，台灯三档亮度，搬宿舍整理闲置，一起出更方便。',
  45.00,
  JSON_ARRAY('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80'),
  @ref_lat, @ref_lng, @ref_address, 1, 1, 39, NOW() - INTERVAL 95 MINUTE, NOW()
WHERE @xizi_id IS NOT NULL
  AND @seller_yiran <> @xizi_id
  AND NOT EXISTS (SELECT 1 FROM goods WHERE user_id = @seller_yiran AND title = '宿舍折叠桌和护眼台灯');

INSERT INTO goods (
  user_id, category_id, title, description, price, images,
  lat, lng, address, status, audit_status, view_count, create_time, update_time
)
SELECT
  @seller_chenmo, @cat_digital, 'Sony 降噪耳机 WH-1000XM4',
  '功能正常，耳罩去年换过，适合自习室和通勤使用。',
  899.00,
  JSON_ARRAY('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'),
  @ref_lat, @ref_lng, @ref_address, 1, 1, 72, NOW() - INTERVAL 120 MINUTE, NOW()
WHERE @xizi_id IS NOT NULL
  AND @seller_chenmo <> @xizi_id
  AND NOT EXISTS (SELECT 1 FROM goods WHERE user_id = @seller_chenmo AND title = 'Sony 降噪耳机 WH-1000XM4');

SELECT
  @xizi_id AS xizi_user_id,
  @ref_address AS demo_address,
  @ref_lat AS demo_lat,
  @ref_lng AS demo_lng,
  COUNT(*) AS nearby_goods_count
FROM goods
WHERE user_id IN (@seller_yiran, @seller_chenmo, @seller_zhixia)
  AND address = @ref_address
  AND status = 1
  AND audit_status = 1;
