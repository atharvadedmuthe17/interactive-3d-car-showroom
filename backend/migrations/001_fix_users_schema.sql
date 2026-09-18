-- =====================================================================
-- MIGRATION: Fix Users Table Schema for OTP Authentication
-- =====================================================================
-- This migration adds missing columns needed for OTP-based registration
-- and password reset functionality.
-- =====================================================================

-- 1. Add reset_otp column (missing column causing the crash)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6);

-- 2. Ensure email has unique constraint (already exists, but safe to check)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    END IF;
END $$;

-- 3. Ensure username has unique constraint (already exists, but safe to check)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;

-- 4. Add index on reset_otp for faster lookups during verification
CREATE INDEX IF NOT EXISTS idx_users_reset_otp ON users(reset_otp) 
WHERE reset_otp IS NOT NULL;

-- 5. Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 6. Verify the schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
