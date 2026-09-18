# Quick SQL Reference - PostgreSQL Commands

## Apply the Migration (FIX THE ERROR)
```bash
psql -U mac -d ecommerce -f backend/migrations/001_fix_users_schema.sql
```

## Verify Schema is Correct
```bash
psql -U mac -d ecommerce -c "\d users"
```

Expected output should include:
- id
- username
- email
- password
- role
- created_at
- reset_otp ← **THIS WAS MISSING (now fixed)**
- reset_otp_expiry

## Check All Columns
```bash
psql -U mac -d ecommerce -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;"
```

## View All Users
```bash
psql -U mac -d ecommerce -c "SELECT id, username, email, role, created_at FROM users;"
```

## Check for Incomplete Registrations
```bash
psql -U mac -d ecommerce -c "SELECT username, email, password, reset_otp FROM users WHERE password = 'PENDING' OR password IS NULL;"
```

## Clean Up Test Data (CAREFUL!)
```bash
# Remove incomplete registrations
psql -U mac -d ecommerce -c "DELETE FROM users WHERE password = 'PENDING' OR password IS NULL;"

# Remove specific test user
psql -U mac -d ecommerce -c "DELETE FROM users WHERE email = 'test@example.com';"
```

## Check Active OTPs
```bash
psql -U mac -d ecommerce -c "SELECT username, email, reset_otp, reset_otp_expiry FROM users WHERE reset_otp IS NOT NULL;"
```

## Clear Expired OTPs (Cleanup)
```bash
psql -U mac -d ecommerce -c "UPDATE users SET reset_otp = NULL, reset_otp_expiry = NULL WHERE reset_otp_expiry < NOW();"
```

## Backup Database (RECOMMENDED)
```bash
pg_dump -U mac ecommerce > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Restore from Backup
```bash
psql -U mac -d ecommerce < backup_20240101_120000.sql
```

## Create Complete Schema from Scratch (if needed)
```sql
-- Drop existing table (CAREFUL!)
DROP TABLE IF EXISTS users CASCADE;

-- Create fresh table with all columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_otp VARCHAR(6),
    reset_otp_expiry TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_users_reset_otp ON users(reset_otp) WHERE reset_otp IS NOT NULL;
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

## Useful Monitoring Queries

### Count users by status
```bash
psql -U mac -d ecommerce -c "
SELECT 
    CASE 
        WHEN password = 'PENDING' OR password IS NULL THEN 'Incomplete'
        ELSE 'Complete'
    END as status,
    COUNT(*) as count
FROM users
GROUP BY status;
"
```

### Recent registrations
```bash
psql -U mac -d ecommerce -c "
SELECT username, email, created_at 
FROM users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
"
```

### Users with active OTPs
```bash
psql -U mac -d ecommerce -c "
SELECT username, email, reset_otp_expiry,
    CASE 
        WHEN reset_otp_expiry > NOW() THEN 'Valid'
        ELSE 'Expired'
    END as otp_status
FROM users 
WHERE reset_otp IS NOT NULL;
"
```
