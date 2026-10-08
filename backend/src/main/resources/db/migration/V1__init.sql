-- Baseline migration for FinMan
-- This is a placeholder migration to establish Flyway baseline
-- Future phases will add actual schema migrations

-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create extension for citext (case-insensitive text) if not exists
CREATE EXTENSION IF NOT EXISTS "citext";

-- Set timezone for the database session
SET timezone = 'UTC';

-- Comment on database
COMMENT ON DATABASE finman_db IS 'FinMan Financial Management Database';

-- This migration establishes the baseline version 1
-- All future migrations should be versioned V2__, V3__, etc.