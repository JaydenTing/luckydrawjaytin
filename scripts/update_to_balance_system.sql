-- 更新数据库表结构：将 draw_chances 改为 balance（余额）
ALTER TABLE users RENAME COLUMN draw_chances TO balance;
ALTER TABLE users ALTER COLUMN balance TYPE NUMERIC(10, 2);
UPDATE users SET balance = 0 WHERE balance IS NULL;

-- 添加 cost 字段到 prizes 表，用于存储每个奖品的抽奖成本
ALTER TABLE prizes ADD COLUMN IF NOT EXISTS cost NUMERIC(10, 2) DEFAULT 1.00;
