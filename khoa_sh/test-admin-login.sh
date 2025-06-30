#!/bin/bash

echo "🔐 Testing Super Admin Authentication..."

# Test login to get token
echo "🚀 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "khoaadmin@gmail.com",
    "password": "123456"
  }')

echo "📥 Login response:"
echo "$LOGIN_RESPONSE" | jq .

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .data.token // .user.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ No token found in login response"
    exit 1
fi

echo "✅ Token extracted: $TOKEN"

# Test Super Admin API with token
echo ""
echo "🔍 Testing Super Admin System Info..."
SYSTEM_INFO_RESPONSE=$(curl -s -X GET http://localhost:8000/api/super-admin/system-info \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "📊 System info response:"
echo "$SYSTEM_INFO_RESPONSE" | jq .

# Test Analytics
echo ""
echo "📈 Testing Super Admin Analytics..."
ANALYTICS_RESPONSE=$(curl -s -X GET http://localhost:8000/api/super-admin/analytics \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "📈 Analytics response:"
echo "$ANALYTICS_RESPONSE" | jq .

echo ""
echo "🎯 Summary:"
echo "Token: $TOKEN"
echo "System Info: $(echo "$SYSTEM_INFO_RESPONSE" | jq -r '.message // "SUCCESS"')"
echo "Analytics: $(echo "$ANALYTICS_RESPONSE" | jq -r '.message // "SUCCESS"')"
