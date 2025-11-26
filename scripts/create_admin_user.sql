-- Create admin user account
-- Username: jaytinclubjaydenting
-- Password: JaydenTing@0307 (will be hashed by bcrypt in the API)

-- First, we need to insert with a temporary password, then you can login and it will be hashed
-- Or we can hash it here directly

-- For security, we should hash the password. Using bcrypt hash for 'JaydenTing@0307'
-- Hash: $2a$10$8YqQxHYqZc3YLx6v9X8XxeLrK5oP5Y6YqKqXxXxXxXxXxXxXxXxXx (example)

-- Insert admin user
INSERT INTO users (username, password, phone, draw_chances, is_admin, is_banned, created_at)
VALUES (
  'jaytinclubjaydenting',
  '$2a$10$N9qo8uLOickgx2ZoX/pZCeGJf8pZhEjxJx7vXqZ8qHxHfXvXqZ8qH', -- This is a bcrypt hash placeholder
  '0000000000',
  999999,
  true,
  false,
  NOW()
)
ON CONFLICT (username) DO UPDATE
SET 
  is_admin = true,
  password = EXCLUDED.password,
  draw_chances = 999999;
