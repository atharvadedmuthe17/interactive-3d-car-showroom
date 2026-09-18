-- =====================================================================
-- MIGRATION: Create Pending Registrations Table
-- =====================================================================
-- This migration creates a temporary table for storing registration data
-- before final user creation. This prevents polluting the users table
-- with incomplete registrations.
-- =====================================================================

-- 1. Create pending_registrations table
CREATE TABLE IF NOT EXISTS pending_registrations (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    otp VARCHAR(6) NOT NULL,
    otp_expiry TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resend_count INTEGER DEFAULT 0,
    last_resend_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT pending_registrations_email_unique UNIQUE (email),
    CONSTRAINT pending_registrations_username_check CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
    CONSTRAINT pending_registrations_otp_check CHECK (otp ~ '^\d{6}$')
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email 
ON pending_registrations(email);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_otp 
ON pending_registrations(otp) 
WHERE otp IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pending_registrations_expiry 
ON pending_registrations(otp_expiry);

-- 3. Create function to automatically delete expired pending registrations
CREATE OR REPLACE FUNCTION delete_expired_pending_registrations()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_registrations 
    WHERE otp_expiry < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to prevent too many resends (rate limiting)
CREATE OR REPLACE FUNCTION check_resend_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.resend_count > 5 THEN
        RAISE EXCEPTION 'Too many OTP resend attempts. Please try again later.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for resend limit
DROP TRIGGER IF EXISTS trigger_check_resend_limit ON pending_registrations;
CREATE TRIGGER trigger_check_resend_limit
    BEFORE UPDATE ON pending_registrations
    FOR EACH ROW
    WHEN (NEW.resend_count > OLD.resend_count)
    EXECUTE FUNCTION check_resend_limit();

-- 6. Clean up users table - remove PENDING passwords
-- This removes the old incomplete registration approach
UPDATE users 
SET password = NULL, reset_otp = NULL, reset_otp_expiry = NULL 
WHERE password = 'PENDING';

-- Optional: Delete users with PENDING password if you want a clean slate
-- Uncomment the line below if you want to remove incomplete registrations
-- DELETE FROM users WHERE password = 'PENDING' OR password IS NULL;

-- 7. Verify the schema
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pending_registrations' 
ORDER BY ordinal_position;

-- 8. Show indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'pending_registrations';

-- =====================================================================
-- CLEANUP INSTRUCTIONS
-- =====================================================================
-- To manually clean expired registrations, run:
-- SELECT delete_expired_pending_registrations();
--
-- To set up automatic cleanup (optional - requires pg_cron extension):
-- SELECT cron.schedule('cleanup-pending-registrations', '*/5 * * * *', 
--   'SELECT delete_expired_pending_registrations()');
-- =====================================================================
