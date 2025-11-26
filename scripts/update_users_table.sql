-- Add admin and draw_chances columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS draw_chances INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Create prizes table
CREATE TABLE IF NOT EXISTS prizes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  probability DECIMAL(5,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create draw_history table
CREATE TABLE IF NOT EXISTS draw_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  prize_name VARCHAR(255) NOT NULL,
  draw_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default prizes
INSERT INTO prizes (name, probability, image_url) VALUES
  ('荣耀奖品已封仓', 70.00, '/images/blocked-prize.png'),
  ('小奖品', 20.00, '/images/small-prize.png'),
  ('中奖品', 8.00, '/images/medium-prize.png'),
  ('大奖品', 2.00, '/images/big-prize.png')
ON CONFLICT DO NOTHING;
