-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    draw_chances INTEGER DEFAULT 0,
    total_draws INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建奖品表
CREATE TABLE IF NOT EXISTS prizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    probability DECIMAL(5,4) DEFAULT 0.0000,
    image_url VARCHAR(255),
    value DECIMAL(10,2) DEFAULT 0.00,
    stock INTEGER DEFAULT -1,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建抽奖记录表
CREATE TABLE IF NOT EXISTS draw_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prize_id INTEGER NOT NULL,
    prize_name VARCHAR(255) NOT NULL,
    draw_type ENUM('single', 'multi') DEFAULT 'single',
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (prize_id) REFERENCES prizes(id)
);

-- 创建抽奖机会记录表
CREATE TABLE IF NOT EXISTS draw_chance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    chances_added INTEGER NOT NULL,
    reason VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- 插入默认管理员账号 (密码: admin123)
INSERT OR IGNORE INTO admins (username, password, email, role) VALUES 
('admin', '$2b$10$rOzJqQZJqQZJqQZJqQZJqOzJqQZJqQZJqQZJqQZJqQZJqQZJqQZJq', 'admin@jaytin.com', 'super_admin');

-- 插入默认奖品
INSERT OR IGNORE INTO prizes (name, description, probability, value, stock) VALUES 
('AirPods Pro 2', '苹果无线耳机', 0.0001, 1299.00, 5),
('IPHONE 16 PRO MAX', '苹果最新手机', 0.0001, 9999.00, 2),
('Apple Watch S10', '苹果智能手表', 0.0002, 2999.00, 3),
('手机支架', '便携手机支架', 0.02, 29.90, 100),
('蓝牙音箱', '便携蓝牙音箱', 0.005, 199.00, 50),
('氛围灯', 'RGB氛围灯', 0.01, 89.00, 80),
('投影仪', '便携投影仪', 0.001, 1999.00, 10),
('钥匙扣(自选 限5令吉)', '定制钥匙扣', 0.01, 5.00, 200),
('零食', '精选零食包', 0.02, 25.00, 300),
('创意收纳盒', '多功能收纳盒', 0.01, 39.90, 150),
('RM1000 TNG', '电子钱包充值', 0.0001, 1000.00, 5),
('限量版高端礼盒（价值RM599)', '精美礼品盒', 0.0002, 599.00, 10),
('下单送小礼物', '购物优惠', 0.02, 0.00, -1),
('RM0.01 TNG', '电子钱包充值', 0.05, 0.01, -1),
('DJI Goggles N3', 'DJI飞行眼镜', 0.0001, 2999.00, 3),
('RM0.10 TNG', '电子钱包充值', 0.03, 0.10, -1),
('POP MART 盲盒（可选）', '潮流盲盒', 0.005, 59.00, 100),
('获取奖品只是次数问题 继续期待！', '鼓励奖', 0.80, 0.00, -1);
