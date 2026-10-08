-- V2__add_constraints_and_indexes.sql
-- Add Unique Constraints and Performance Indexes for FinMan

-- 1. Add Unique Constraint on users.email
ALTER TABLE users
    ADD CONSTRAINT uk_user_email UNIQUE (email);

-- 2. Add Partial Index on accounts for active accounts only
CREATE INDEX idx_accounts_user_active ON accounts(user_id) WHERE is_archived = FALSE;

-- 3. Add Performance Indexes on transactions
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_account ON transactions(user_id, account_id);

-- 4. Add Performance Index on budgets
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);

-- Note: The unique constraint uk_budget_user_category_month was already created in V1
-- via JPA @UniqueConstraint annotation on Budget entity