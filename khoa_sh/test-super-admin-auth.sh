#!/bin/bash

echo "🔐 Testing Super Admin Authentication & Dashboard..."

# Get auth token for admin user
echo "1. Getting authentication token..."
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' -s | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ ! -z "$TOKEN" ]; then
    echo "✅ Authentication successful!"
    echo "Token: ${TOKEN:0:20}..."
    
    # Test Super Admin API endpoints
    echo ""
    echo "2. Testing Super Admin API endpoints..."
    
    echo "Testing system info..."
    SYSTEM_INFO=$(curl -H "Authorization: Bearer $TOKEN" \
         -H "Accept: application/json" \
         http://localhost:8000/api/super-admin/system-info -s)
    
    if echo "$SYSTEM_INFO" | grep -q "database_info"; then
        echo "✅ System info endpoint working"
        echo "Total tables: $(echo "$SYSTEM_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin)['database_info']['total_tables'])" 2>/dev/null || echo 'N/A')"
    else
        echo "❌ System info endpoint failed"
        echo "$SYSTEM_INFO"
    fi
    
    echo ""
    echo "Testing analytics..."
    ANALYTICS=$(curl -H "Authorization: Bearer $TOKEN" \
         -H "Accept: application/json" \
         http://localhost:8000/api/super-admin/analytics -s)
    
    if echo "$ANALYTICS" | grep -q "users"; then
        echo "✅ Analytics endpoint working"
        echo "Total users: $(echo "$ANALYTICS" | python3 -c "import sys, json; print(json.load(sys.stdin)['users']['total'])" 2>/dev/null || echo 'N/A')"
    else
        echo "❌ Analytics endpoint failed"
        echo "$ANALYTICS"
    fi
    
    echo ""
    echo "Testing table data (users table)..."
    TABLE_DATA=$(curl -H "Authorization: Bearer $TOKEN" \
         -H "Accept: application/json" \
         http://localhost:8000/api/super-admin/tables/users -s)
    
    if echo "$TABLE_DATA" | grep -q "table"; then
        echo "✅ Table data endpoint working"
        echo "Table: $(echo "$TABLE_DATA" | python3 -c "import sys, json; print(json.load(sys.stdin)['table'])" 2>/dev/null || echo 'N/A')"
    else
        echo "❌ Table data endpoint failed"
        echo "$TABLE_DATA"
    fi
    
    echo ""
    echo "🎉 Super Admin API tests completed!"
    echo ""
    echo "📱 Frontend Access:"
    echo "URL: http://localhost:3000/super-admin"
    echo "Login: admin@test.com / password123"
    echo ""
    echo "💡 The frontend should now be able to authenticate and load data properly!"
    
else
    echo "❌ Authentication failed!"
    echo "Make sure the backend is running and admin user exists."
fi
