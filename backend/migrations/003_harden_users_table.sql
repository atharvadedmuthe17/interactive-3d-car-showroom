-- =====================================================================
-- MIGRATION: Harden Users Table - Database-Level Protection
-- =====================================================================
-- This migration adds strict database-level constraints and triggers
-- to prevent ANY incomplete or invalid user data from entering the
-- users table. This is the final layer of defense.
-- =====================================================================

-- =====================================================================
-- PART 1: ADD STRICT CONSTRAINTS
-- =====================================================================

-- 1. Ensure password is NOT NULL (if not already)
-- First, clean up any existing NULL passwords
UPDATE users SET password = 'INVALID_MUST_RESET' WHERE password IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE users 
ALTER COLUMN password SET NOT NULL;

-- 2. Add CHECK constraint for password length
-- Bcrypt hashes are 60 characters, so valid passwords should be at least 60 chars
-- This prevents storing plain text or weak passwords
ALTER TABLE users 
ADD CONSTRAINT users_password_length_check 
CHECK (LENGTH(password) >= 60);

-- 3. Add CHECK constraint for username format
-- Username must be 3-20 alphanumeric characters (matches application validation)
ALTER TABLE users 
ADD CONSTRAINT users_username_format_check 
CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- 4. Add CHECK constraint for email format
-- Basic email format validation
ALTER TABLE users 
ADD CONSTRAINT users_email_format_check 
CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 5. Ensure username is NOT NULL
ALTER TABLE users 
ALTER COLUMN username SET NOT NULL;

-- 6. Add CHECK constraint to prevent 'PENDING' or placeholder passwords
ALTER TABLE users 
ADD CONSTRAINT users_no_placeholder_password_check 
CHECK (password NOT IN ('PENDING', 'INVALID', 'INVALID_MUST_RESET', 'PLACEHOLDER'));

-- =====================================================================
-- PART 2: CREATE AUDIT LOG TABLE
-- =====================================================================

-- Create table to log invalid insert attempts
CREATE TABLE IF NOT EXISTS users_audit_log (
    id SERIAL PRIMARY KEY,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attempted_username VARCHAR(100),
    attempted_email VARCHAR(150),
    attempted_password_length INTEGER,
    error_type VARCHAR(100),
    error_message TEXT,
    source_ip VARCHAR(45),  -- For future use
    user_agent TEXT         -- For future use
);

-- Index for querying recent attempts
CREATE INDEX IF NOT EXISTS idx_users_audit_log_attempted_at 
ON users_audit_log(attempted_at DESC);

-- Index for finding repeated attempts by email
CREATE INDEX IF NOT EXISTS idx_users_audit_log_email 
ON users_audit_log(attempted_email);

-- =====================================================================
-- PART 3: CREATE DEFENSIVE TRIGGERS
-- =====================================================================

-- Function to validate user data before insert
CREATE OR REPLACE FUNCTION validate_user_before_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Check 1: Password must not be NULL
    IF NEW.password IS NULL THEN
        INSERT INTO users_audit_log (
            attempted_username, 
            attempted_email, 
            attempted_password_length,
            error_type, 
            error_message
        ) VALUES (
            NEW.username, 
            NEW.email, 
            0,
            'NULL_PASSWORD', 
            'Attempted to insert user with NULL password'
        );
        RAISE EXCEPTION 'Password cannot be NULL. Use pending_registrations table for incomplete registrations.';
    END IF;

    -- Check 2: Password must be hashed (bcrypt = 60 chars)
    IF LENGTH(NEW.password) < 60 THEN
        INSERT INTO users_audit_log (
            attempted_username, 
            attempted_email, 
            attempted_password_length,
            error_type, 
            error_message
        ) VALUES (
            NEW.username, 
            NEW.email, 
            LENGTH(NEW.password),
            'WEAK_PASSWORD', 
            'Attempted to insert user with password length < 60 characters'
        );
        RAISE EXCEPTION 'Password must be hashed (bcrypt). Length: %, Required: 60', LENGTH(NEW.password);
    END IF;

    -- Check 3: Password must not be placeholder
    IF NEW.password IN ('PENDING', 'INVALID', 'INVALID_MUST_RESET', 'PLACEHOLDER') THEN
        INSERT INTO users_audit_log (
            attempted_username, 
            attempted_email, 
            attempted_password_length,
            error_type, 
            error_message
        ) VALUES (
            NEW.username, 
            NEW.email, 
            LENGTH(NEW.password),
            'PLACEHOLDER_PASSWORD', 
            'Attempted to insert user with placeholder password: ' || NEW.password
        );
        RAISE EXCEPTION 'Password cannot be a placeholder value: %', NEW.password;
    END IF;

    -- Check 4: Username must not be NULL
    IF NEW.username IS NULL OR TRIM(NEW.username) = '' THEN
        INSERT INTO users_audit_log (
            attempted_username, 
            attempted_email, 
            attempted_password_length,
            error_type, 
            error_message
        ) VALUES (
            NEW.username, 
            NEW.email, 
            LENGTH(NEW.password),
            'NULL_USERNAME', 
            'Attempted to insert user with NULL or empty username'
        );
        RAISE EXCEPTION 'Username cannot be NULL or empty';
    END IF;

    -- Check 5: Email must not be NULL
    IF NEW.email IS NULL OR TRIM(NEW.email) = '' THEN
        INSERT INTO users_audit_log (
            attempted_username, 
            attempted_email, 
            attempted_password_length,
            error_type, 
            error_message
        ) VALUES (
            NEW.username, 
            NEW.email, 
            LENGTH(NEW.password),
            'NULL_EMAIL', 
            'Attempted to insert user with NULL or empty email'
        );
        RAISE EXCEPTION 'Email cannot be NULL or empty';
    END IF;

    -- Check 6: Username format validation
    IF NEW.username !~ '^[a-zA-Z0-9_]{3,20}$' THEN
        INSERT INTO users_audit_log (
            attempted_username, 
            attempted_email, 
            attempted_password_length,
            error_type, 
            error_message
        ) VALUES (
            NEW.username, 
            NEW.email, 
            LENGTH(NEW.password),
            'INVALID_USERNAME_FORMAT', 
            'Username does not match required format: ' || NEW.username
        );
        RAISE EXCEPTION 'Username must be 3-20 alphanumeric characters: %', NEW.username;
    END IF;

    -- Check 7: Email format validation
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        INSERT INTO users_audit_log (
            attempted_username, 
            attempted_email, 
            attempted_password_length,
            error_type, 
            error_message
        ) VALUES (
            NEW.username, 
            NEW.email, 
            LENGTH(NEW.password),
            'INVALID_EMAIL_FORMAT', 
            'Email does not match required format: ' || NEW.email
        );
        RAISE EXCEPTION 'Email format is invalid: %', NEW.email;
    END IF;

    -- All checks passed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS trigger_validate_user_before_insert ON users;
CREATE TRIGGER trigger_validate_user_before_insert
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_before_insert();

-- =====================================================================
-- PART 4: CREATE TRIGGER FOR UPDATE OPERATIONS
-- =====================================================================

-- Function to validate user data before update
CREATE OR REPLACE FUNCTION validate_user_before_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate if password is being changed
    IF NEW.password IS DISTINCT FROM OLD.password THEN
        
        -- Check 1: Password must not be NULL
        IF NEW.password IS NULL THEN
            INSERT INTO users_audit_log (
                attempted_username, 
                attempted_email, 
                attempted_password_length,
                error_type, 
                error_message
            ) VALUES (
                NEW.username, 
                NEW.email, 
                0,
                'UPDATE_NULL_PASSWORD', 
                'Attempted to update user password to NULL'
            );
            RAISE EXCEPTION 'Cannot update password to NULL';
        END IF;

        -- Check 2: Password must be hashed
        IF LENGTH(NEW.password) < 60 THEN
            INSERT INTO users_audit_log (
                attempted_username, 
                attempted_email, 
                attempted_password_length,
                error_type, 
                error_message
            ) VALUES (
                NEW.username, 
                NEW.email, 
                LENGTH(NEW.password),
                'UPDATE_WEAK_PASSWORD', 
                'Attempted to update user with unhashed password'
            );
            RAISE EXCEPTION 'Password must be hashed (bcrypt). Length: %, Required: 60', LENGTH(NEW.password);
        END IF;

        -- Check 3: Password must not be placeholder
        IF NEW.password IN ('PENDING', 'INVALID', 'INVALID_MUST_RESET', 'PLACEHOLDER') THEN
            INSERT INTO users_audit_log (
                attempted_username, 
                attempted_email, 
                attempted_password_length,
                error_type, 
                error_message
            ) VALUES (
                NEW.username, 
                NEW.email, 
                LENGTH(NEW.password),
                'UPDATE_PLACEHOLDER_PASSWORD', 
                'Attempted to update user with placeholder password'
            );
            RAISE EXCEPTION 'Cannot update password to placeholder value: %', NEW.password;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for UPDATE operations
DROP TRIGGER IF EXISTS trigger_validate_user_before_update ON users;
CREATE TRIGGER trigger_validate_user_before_update
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_before_update();

-- =====================================================================
-- PART 5: CREATE FUNCTION TO CLEAN UP AUDIT LOG
-- =====================================================================

-- Function to clean up old audit log entries (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_users_audit_log()
RETURNS void AS $$
BEGIN
    DELETE FROM users_audit_log 
    WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- PART 6: ADD COMMENTS FOR DOCUMENTATION
-- =====================================================================

COMMENT ON TABLE users IS 'Main users table. Only complete, validated users allowed. Use pending_registrations for incomplete registrations.';
COMMENT ON COLUMN users.password IS 'Bcrypt hashed password (60 characters). Must never be NULL or placeholder.';
COMMENT ON COLUMN users.username IS 'Unique username, 3-20 alphanumeric characters.';
COMMENT ON COLUMN users.email IS 'Unique email address, validated format.';

COMMENT ON TABLE users_audit_log IS 'Audit log for invalid user insert/update attempts. Auto-cleaned after 30 days.';

COMMENT ON CONSTRAINT users_password_length_check ON users IS 'Ensures password is hashed (bcrypt = 60 chars)';
COMMENT ON CONSTRAINT users_username_format_check ON users IS 'Ensures username is 3-20 alphanumeric characters';
COMMENT ON CONSTRAINT users_email_format_check ON users IS 'Ensures email has valid format';
COMMENT ON CONSTRAINT users_no_placeholder_password_check ON users IS 'Prevents placeholder passwords like PENDING';

-- =====================================================================
-- PART 7: VERIFY CONSTRAINTS
-- =====================================================================

-- Show all constraints on users table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass
ORDER BY contype, conname;

-- Show all triggers on users table
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
ORDER BY trigger_name;

-- =====================================================================
-- PART 8: TEST THE CONSTRAINTS (Optional - uncomment to test)
-- =====================================================================

-- Test 1: Try to insert user with NULL password (should fail)
-- INSERT INTO users (username, email, password) VALUES ('test', 'test@example.com', NULL);

-- Test 2: Try to insert user with short password (should fail)
-- INSERT INTO users (username, email, password) VALUES ('test', 'test@example.com', 'short');

-- Test 3: Try to insert user with PENDING password (should fail)
-- INSERT INTO users (username, email, password) VALUES ('test', 'test@example.com', 'PENDING');

-- Test 4: Try to insert user with invalid username (should fail)
-- INSERT INTO users (username, email, password) VALUES ('ab', 'test@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP');

-- Test 5: Try to insert user with invalid email (should fail)
-- INSERT INTO users (username, email, password) VALUES ('test', 'invalid-email', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP');

-- Test 6: Insert valid user (should succeed)
-- INSERT INTO users (username, email, password) VALUES ('validuser', 'valid@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP');

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================

-- Summary of changes:
SELECT 'Migration 003 completed successfully!' AS status;
SELECT 'Added constraints:' AS info;
SELECT '  - password NOT NULL' AS constraint;
SELECT '  - password length >= 60 (bcrypt)' AS constraint;
SELECT '  - username format validation' AS constraint;
SELECT '  - email format validation' AS constraint;
SELECT '  - no placeholder passwords' AS constraint;
SELECT 'Added triggers:' AS info;
SELECT '  - validate_user_before_insert' AS trigger;
SELECT '  - validate_user_before_update' AS trigger;
SELECT 'Added audit log:' AS info;
SELECT '  - users_audit_log table' AS table;
SELECT '  - cleanup_users_audit_log function' AS function;

-- =====================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================================
-- To rollback this migration:
-- 
-- DROP TRIGGER IF EXISTS trigger_validate_user_before_insert ON users;
-- DROP TRIGGER IF EXISTS trigger_validate_user_before_update ON users;
-- DROP FUNCTION IF EXISTS validate_user_before_insert();
-- DROP FUNCTION IF EXISTS validate_user_before_update();
-- DROP FUNCTION IF EXISTS cleanup_users_audit_log();
-- DROP TABLE IF EXISTS users_audit_log;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_password_length_check;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_format_check;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_format_check;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_no_placeholder_password_check;
-- ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
-- ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
-- =====================================================================
