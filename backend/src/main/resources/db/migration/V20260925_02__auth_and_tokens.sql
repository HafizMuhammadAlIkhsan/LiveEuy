-- ====================================================================
-- LiveEuy Streaming Platform - Authentication & Token Security Migration
-- Migration ID: V20260925_02__auth_and_tokens.sql
-- Database: PostgreSQL 15+
-- ====================================================================

-- 1. Alter Users Table with Auth & RBAC Columns
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role VARCHAR(16) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Add index on role for admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. REFRESH TOKENS TABLE (For Rotating Refresh Token Architecture)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    device_id VARCHAR(128),
    user_agent TEXT,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expiry ON refresh_tokens(expires_at);

-- 3. PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_hash ON password_reset_tokens(token_hash);

-- 4. SEED DEMO USERS (Hafiz Muhammad - Admin VIP Ultra & Budi Santoso - Member VIP Standard)
-- Default password for demo users: 'LiveEuy#2026'
-- BCrypt hash with 10 rounds: '$2a$10$tZ2E7HwR2qR9rK1jFvYd2OuPq6bO3B7M8oK4cZ9lW1vA3mE5sD7ye'
INSERT INTO users (id, name, email, password_hash, avatar_url, tier, role, member_since, watch_hours, max_devices, is_active)
VALUES 
    (
        'usr-hafiz-admin-01',
        'Hafiz Muhammad',
        'hafiz@liveeuy.id',
        '$2a$10$tZ2E7HwR2qR9rK1jFvYd2OuPq6bO3B7M8oK4cZ9lW1vA3mE5sD7ye',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
        'VIP Cinema Ultra',
        'admin',
        'Januari 2024',
        48.5,
        4,
        TRUE
    ),
    (
        'usr-budi-vip-02',
        'Budi Santoso',
        'budi@liveeuy.id',
        '$2a$10$tZ2E7HwR2qR9rK1jFvYd2OuPq6bO3B7M8oK4cZ9lW1vA3mE5sD7ye',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
        'VIP Standard',
        'user',
        'Agustus 2024',
        12.0,
        2,
        TRUE
    )
ON CONFLICT (email) DO UPDATE 
SET 
    role = EXCLUDED.role,
    tier = EXCLUDED.tier,
    is_active = EXCLUDED.is_active;
