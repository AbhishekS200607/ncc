-- Seed: Default admin account
-- Password: Admin@NCC2024 (change after first login)
-- Hash generated with bcrypt rounds=12

INSERT INTO admins (username, email, password_hash)
VALUES (
  'admin',
  'admin@nccunit.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRSm6E8mHqxqxqxqxqxq'
)
ON CONFLICT (username) DO NOTHING;

-- Note: Replace the password_hash above with a real bcrypt hash.
-- Generate one using: node -e "const b=require('bcrypt');b.hash('Admin@NCC2024',12).then(console.log)"
