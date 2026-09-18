# 📋 Complete Registration Flow Diagram

## 🔄 Registration Process (3 Steps)

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                             │
└─────────────────────────────────────────────────────────────────┘

STEP 1: SEND OTP
┌──────────┐
│  User    │ Enters username + email
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/auth/register-step1                     │
│  Body: { username, email }                                   │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Validation:                                          │
│  ✓ Email format (regex)                                      │
│  ✓ Username format (3-20 alphanumeric)                       │
│  ✓ Check if already registered                               │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Generate OTP:                                                │
│  • 6-digit random number (100000-999999)                     │
│  • Expiry: 30 seconds from now                               │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Database: INSERT or UPDATE                                   │
│  INSERT INTO users (username, email, reset_otp,              │
│                     reset_otp_expiry, password)              │
│  VALUES ($1, $2, $3, $4, 'PENDING')                          │
│  ON CONFLICT (email) DO UPDATE ...                           │
│  WHERE password = 'PENDING'                                  │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Send Email:                                                  │
│  To: user@example.com                                        │
│  Subject: Your ADYX Registration Code                        │
│  Body: Your OTP is: 123456 (expires in 30s)                 │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Response: { success: true, message: "OTP sent", email }     │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  User    │ Receives email with OTP
└──────────┘


═══════════════════════════════════════════════════════════════


STEP 2: VERIFY OTP
┌──────────┐
│  User    │ Enters OTP from email
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/auth/register-step2                     │
│  Body: { email, otp }                                        │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Validation:                                          │
│  ✓ Email provided                                            │
│  ✓ OTP provided                                              │
│  ✓ OTP format (exactly 6 digits)                            │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Database: SELECT                                             │
│  SELECT reset_otp, reset_otp_expiry, password                │
│  FROM users WHERE email = $1                                 │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Verify OTP:                                                  │
│  ✓ User exists                                               │
│  ✓ OTP matches                                               │
│  ✓ OTP not expired (< 30 seconds old)                       │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Response: { success: true, message: "OTP verified" }        │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  User    │ OTP verified, proceed to set password
└──────────┘


═══════════════════════════════════════════════════════════════


STEP 3: SET PASSWORD
┌──────────┐
│  User    │ Enters password
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/auth/register-step3                     │
│  Body: { email, password }                                   │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Validation:                                          │
│  ✓ Email provided                                            │
│  ✓ Password provided                                         │
│  ✓ Password length >= 8                                      │
│  ✓ Password has uppercase, lowercase, number                │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Verify Session:                                              │
│  ✓ User exists                                               │
│  ✓ OTP was verified (still in grace period)                 │
│  ✓ Session not expired (< 5 minutes since OTP)              │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Hash Password:                                               │
│  • bcrypt.hash(password, 10)                                 │
│  • Salt rounds: 10                                           │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Database: UPDATE                                             │
│  UPDATE users                                                │
│  SET password = $1,                                          │
│      reset_otp = NULL,                                       │
│      reset_otp_expiry = NULL                                 │
│  WHERE email = $2                                            │
│  RETURNING id, username, email                               │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Generate JWT Token:                                          │
│  • Payload: { id, username }                                 │
│  • Secret: JWT_SECRET from .env                             │
│  • Expiry: 24 hours                                          │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Response: {                                                  │
│    success: true,                                            │
│    message: "Registration completed",                        │
│    token: "eyJhbGc...",                                      │
│    user: { id, username, email }                             │
│  }                                                            │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  User    │ Registered & Logged In! ✅
└──────────┘
```

---

## 🔄 Resend OTP Flow (Optional)

```
┌──────────┐
│  User    │ OTP expired, clicks "Resend OTP"
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/auth/resend-registration-otp            │
│  Body: { email }                                             │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Validation:                                          │
│  ✓ Email provided                                            │
│  ✓ User exists                                               │
│  ✓ Registration incomplete (password = 'PENDING')           │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Generate New OTP:                                            │
│  • 6-digit random number                                     │
│  • New expiry: 30 seconds from now                          │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Database: UPDATE                                             │
│  UPDATE users                                                │
│  SET reset_otp = $1, reset_otp_expiry = $2                  │
│  WHERE email = $3                                            │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Send New Email:                                              │
│  Subject: Your New ADYX Registration Code                    │
│  Body: Your new OTP is: 654321                              │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Response: { success: true, message: "New OTP sent" }        │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  User    │ Receives new OTP, continues from Step 2
└──────────┘
```

---

## 🔐 Login Flow

```
┌──────────┐
│  User    │ Enters username + password
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/auth/login                              │
│  Body: { username, password }                                │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Validation:                                          │
│  ✓ Username provided                                         │
│  ✓ Password provided                                         │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Database: SELECT                                             │
│  SELECT id, username, email, password, role                  │
│  FROM users WHERE username = $1                              │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Verify:                                                      │
│  ✓ User exists                                               │
│  ✓ Registration complete (password != 'PENDING')            │
│  ✓ Password matches (bcrypt.compare)                        │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Generate JWT Token:                                          │
│  • Payload: { id, username, role }                          │
│  • Expiry: 24 hours                                          │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Response: {                                                  │
│    success: true,                                            │
│    message: "Login successful",                              │
│    token: "eyJhbGc...",                                      │
│    user: { id, username, email, role }                       │
│  }                                                            │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  User    │ Logged In! ✅
└──────────┘
```

---

## 🔄 Forgot Password Flow (3 Steps)

```
STEP 1: REQUEST RESET
┌──────────┐
│  User    │ Enters username
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/auth/forgot-password                    │
│  Body: { username }                                          │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Database: Find email by username                            │
│  SELECT email FROM users WHERE username = $1                 │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Generate OTP & Send Email                                    │
│  (Same as registration OTP)                                  │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Response: {                                                  │
│    success: true,                                            │
│    email: "user@example.com",                                │
│    maskedEmail: "u****r@example.com"                         │
│  }                                                            │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  User    │ Receives OTP email
└──────────┘


STEP 2: VERIFY OTP
(Same as registration Step 2)


STEP 3: RESET PASSWORD
┌──────────┐
│  User    │ Enters new password
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Frontend: POST /api/auth/reset-password                     │
│  Body: { email, newPassword }                                │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Validate password strength                                   │
│  Hash password with bcrypt                                   │
│  Update database                                             │
│  Clear OTP                                                   │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Response: { success: true, message: "Password updated" }    │
└────┬─────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  User    │ Password reset! Can now login
└──────────┘
```

---

## 🗄️ Database State Changes

### During Registration

```
STEP 1 (Send OTP):
┌────────────────────────────────────────────────────────────┐
│ users table                                                 │
├────────────────────────────────────────────────────────────┤
│ username: "testuser"                                       │
│ email: "test@example.com"                                  │
│ password: "PENDING"          ← Marks incomplete            │
│ reset_otp: "123456"          ← OTP for verification        │
│ reset_otp_expiry: 2024-01-01 12:00:30  ← 30s from now     │
└────────────────────────────────────────────────────────────┘

STEP 2 (Verify OTP):
(No database changes, just validation)

STEP 3 (Set Password):
┌────────────────────────────────────────────────────────────┐
│ users table                                                 │
├────────────────────────────────────────────────────────────┤
│ username: "testuser"                                       │
│ email: "test@example.com"                                  │
│ password: "$2b$10$..."       ← Hashed password             │
│ reset_otp: NULL              ← Cleared                     │
│ reset_otp_expiry: NULL       ← Cleared                     │
└────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Error Scenarios

### Scenario 1: OTP Expired
```
User enters OTP after 30 seconds
  ↓
Backend checks: NOW() > reset_otp_expiry
  ↓
Response: { success: false, message: "OTP expired" }
  ↓
User clicks "Resend OTP"
  ↓
New OTP generated and sent
```

### Scenario 2: Invalid OTP
```
User enters wrong OTP
  ↓
Backend checks: reset_otp !== entered_otp
  ↓
Response: { success: false, message: "Invalid OTP" }
  ↓
User tries again (max 3 attempts recommended)
```

### Scenario 3: Duplicate Registration
```
User tries to register with existing email
  ↓
Backend checks: User exists AND password != 'PENDING'
  ↓
Response: { success: false, message: "Email already registered" }
  ↓
User should use "Forgot Password" instead
```

---

## 🎯 Key Points

1. **OTP Expiry:** 30 seconds (configurable)
2. **Password Requirements:** 8+ chars, uppercase, lowercase, number
3. **JWT Expiry:** 24 hours
4. **Grace Period:** 5 minutes after OTP verification to set password
5. **Incomplete Registration:** Marked with `password = 'PENDING'`
6. **Retry Support:** Users can retry incomplete registrations

---

## 📊 Success Criteria

✅ User can register with email + username  
✅ OTP sent within seconds  
✅ OTP expires after 30 seconds  
✅ User can resend OTP if expired  
✅ Password must meet strength requirements  
✅ JWT token issued on successful registration  
✅ User can login immediately after registration  
✅ Forgot password flow works independently  
✅ No crashes or 500 errors  
✅ Clear error messages for all scenarios
