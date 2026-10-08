-- V3__create_user_settings_table.sql
-- Create User Settings table with 1-to-1 relationship with users

CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    language VARCHAR(10) NOT NULL DEFAULT 'vi',
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_budget_alert_threshold INTEGER DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_settings_user_id UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
