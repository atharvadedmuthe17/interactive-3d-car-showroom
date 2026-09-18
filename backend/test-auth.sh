#!/bin/bash

# Authentication System Test Script
# This script tests all authentication endpoints

BASE_URL="http://localhost:5000"
TEST_USERNAME="testuser_$(date +%s)"
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="Test1234"

echo "=================================="
echo "Authentication System Test"
echo "=================================="
echo ""
echo "Test User: $TEST_USERNAME"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register Step 1 - Send OTP
echo -e "${YELLOW}Test 1: Register Step 1 - Send OTP${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register-step1" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Step 1 Passed${NC}"
else
    echo -e "${RED}✗ Step 1 Failed${NC}"
    exit 1
fi
echo ""

# Wait for user to enter OTP
echo -e "${YELLOW}Please check your email and enter the OTP:${NC}"
read -p "OTP: " OTP

# Test 2: Register Step 2 - Verify OTP
echo -e "${YELLOW}Test 2: Register Step 2 - Verify OTP${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register-step2" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"otp\":\"$OTP\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Step 2 Passed${NC}"
else
    echo -e "${RED}✗ Step 2 Failed${NC}"
    exit 1
fi
echo ""

# Test 3: Register Step 3 - Set Password
echo -e "${YELLOW}Test 3: Register Step 3 - Set Password${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register-step3" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Step 3 Passed${NC}"
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "Token: $TOKEN"
else
    echo -e "${RED}✗ Step 3 Failed${NC}"
    exit 1
fi
echo ""

# Test 4: Login
echo -e "${YELLOW}Test 4: Login${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Login Passed${NC}"
else
    echo -e "${RED}✗ Login Failed${NC}"
    exit 1
fi
echo ""

# Test 5: Forgot Password - Step 1
echo -e "${YELLOW}Test 5: Forgot Password - Request Reset${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Forgot Password Step 1 Passed${NC}"
else
    echo -e "${RED}✗ Forgot Password Step 1 Failed${NC}"
    exit 1
fi
echo ""

# Wait for user to enter OTP
echo -e "${YELLOW}Please check your email and enter the password reset OTP:${NC}"
read -p "OTP: " RESET_OTP

# Test 6: Forgot Password - Step 2 (Verify OTP)
echo -e "${YELLOW}Test 6: Forgot Password - Verify OTP${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/forgot-password-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"otp\":\"$RESET_OTP\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Forgot Password Step 2 Passed${NC}"
else
    echo -e "${RED}✗ Forgot Password Step 2 Failed${NC}"
    exit 1
fi
echo ""

# Test 7: Reset Password
NEW_PASSWORD="NewPass1234"
echo -e "${YELLOW}Test 7: Reset Password${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"newPassword\":\"$NEW_PASSWORD\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Reset Password Passed${NC}"
else
    echo -e "${RED}✗ Reset Password Failed${NC}"
    exit 1
fi
echo ""

# Test 8: Login with New Password
echo -e "${YELLOW}Test 8: Login with New Password${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$NEW_PASSWORD\"}")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Login with New Password Passed${NC}"
else
    echo -e "${RED}✗ Login with New Password Failed${NC}"
    exit 1
fi
echo ""

echo "=================================="
echo -e "${GREEN}All Tests Passed! ✓${NC}"
echo "=================================="
echo ""
echo "Test user created:"
echo "  Username: $TEST_USERNAME"
echo "  Email: $TEST_EMAIL"
echo "  Password: $NEW_PASSWORD"
echo ""
echo "To clean up, run:"
echo "  psql -U mac -d ecommerce -c \"DELETE FROM users WHERE email = '$TEST_EMAIL';\""
